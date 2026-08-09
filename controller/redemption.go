package controller

import (
	"net/http"
	"strconv"
	"strings"
	"unicode/utf8"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/i18n"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting/operation_setting"

	"github.com/gin-gonic/gin"
)

func GetAllRedemptions(c *gin.Context) {
	pageInfo := common.GetPageQuery(c)
	redemptions, total, err := model.GetAllRedemptions(pageInfo.GetStartIdx(), pageInfo.GetPageSize())
	if err != nil {
		common.ApiError(c, err)
		return
	}
	pageInfo.SetTotal(int(total))
	pageInfo.SetItems(redemptions)
	common.ApiSuccess(c, pageInfo)
	return
}

func SearchRedemptions(c *gin.Context) {
	keyword := c.Query("keyword")
	status := c.Query("status")
	pageInfo := common.GetPageQuery(c)
	redemptions, total, err := model.SearchRedemptions(keyword, status, pageInfo.GetStartIdx(), pageInfo.GetPageSize())
	if err != nil {
		common.ApiError(c, err)
		return
	}
	pageInfo.SetTotal(int(total))
	pageInfo.SetItems(redemptions)
	common.ApiSuccess(c, pageInfo)
	return
}

func GetRedemption(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	redemption, err := model.GetRedemptionById(id)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    redemption,
	})
	return
}

func AddRedemption(c *gin.Context) {
	if !operation_setting.IsPaymentComplianceConfirmed() {
		common.ApiErrorI18n(c, i18n.MsgPaymentComplianceRequired)
		return
	}

	redemption := model.Redemption{}
	err := c.ShouldBindJSON(&redemption)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if utf8.RuneCountInString(redemption.Name) == 0 || utf8.RuneCountInString(redemption.Name) > 20 {
		common.ApiErrorI18n(c, i18n.MsgRedemptionNameLength)
		return
	}
	if redemption.Count <= 0 {
		common.ApiErrorI18n(c, i18n.MsgRedemptionCountPositive)
		return
	}
	if redemption.Count > 100 {
		common.ApiErrorI18n(c, i18n.MsgRedemptionCountMax)
		return
	}
	if valid, msg := validateExpiredTime(c, redemption.ExpiredTime); !valid {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": msg})
		return
	}
	// A code grants either wallet quota or a subscription plan, not both.
	if redemption.PlanId > 0 {
		if redemption.Quota != 0 {
			c.JSON(http.StatusOK, gin.H{"success": false, "message": "兑换码不能同时设置额度与订阅套餐"})
			return
		}
		plan, err := model.GetSubscriptionPlanById(redemption.PlanId)
		if err != nil {
			c.JSON(http.StatusOK, gin.H{"success": false, "message": "订阅套餐不存在"})
			return
		}
		if !plan.Enabled {
			c.JSON(http.StatusOK, gin.H{"success": false, "message": "订阅套餐未启用"})
			return
		}
	}
	// Optional short-code prefix: generates keys like "SP-AB2CD3" instead of
	// 32-char UUIDs. Letters, digits and hyphens only, max 10 chars.
	if redemption.KeyPrefix != "" {
		redemption.KeyPrefix = strings.ToUpper(strings.TrimSpace(redemption.KeyPrefix))
		if len(redemption.KeyPrefix) > 10 {
			c.JSON(http.StatusOK, gin.H{"success": false, "message": "兑换码前缀过长（最多10个字符）"})
			return
		}
		for _, ch := range redemption.KeyPrefix {
			if !(ch >= 'A' && ch <= 'Z' || ch >= '0' && ch <= '9' || ch == '-') {
				c.JSON(http.StatusOK, gin.H{"success": false, "message": "兑换码前缀只能包含字母、数字和连字符"})
				return
			}
		}
	}
	var keys []string
	for i := 0; i < redemption.Count; i++ {
		key := ""
		inserted := false
		for attempt := 0; attempt < 10 && !inserted; attempt++ {
			if redemption.KeyPrefix != "" {
				shortKey, err := model.GenerateShortKey(redemption.KeyPrefix)
				if err != nil {
					common.SysError("failed to generate short key: " + err.Error())
					c.JSON(http.StatusOK, gin.H{
						"success": false,
						"message": i18n.T(c, i18n.MsgRedemptionCreateFailed),
						"data":    keys,
					})
					return
				}
				key = shortKey
			} else {
				key = common.GetUUID()
			}
			cleanRedemption := model.Redemption{
				UserId:      c.GetInt("id"),
				Name:        redemption.Name,
				Key:         key,
				CreatedTime: common.GetTimestamp(),
				Quota:       redemption.Quota,
				PlanId:      redemption.PlanId,
				ExpiredTime: redemption.ExpiredTime,
			}
			err = cleanRedemption.Insert()
			if err != nil {
				// Duplicate key on a short code (rare) → regenerate and retry.
				if redemption.KeyPrefix != "" && model.RedemptionKeyExists(key) {
					continue
				}
				common.SysError("failed to insert redemption: " + err.Error())
				c.JSON(http.StatusOK, gin.H{
					"success": false,
					"message": i18n.T(c, i18n.MsgRedemptionCreateFailed),
					"data":    keys,
				})
				return
			}
			inserted = true
		}
		if !inserted {
			common.SysError("failed to insert redemption after retries")
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": i18n.T(c, i18n.MsgRedemptionCreateFailed),
				"data":    keys,
			})
			return
		}
		keys = append(keys, key)
	}
	recordManageAudit(c, "redemption.create", map[string]interface{}{
		"name":    redemption.Name,
		"count":   redemption.Count,
		"quota":   logger.LogQuota(redemption.Quota),
		"plan_id": redemption.PlanId,
	})
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    keys,
	})
	return
}

func DeleteRedemption(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	err := model.DeleteRedemptionById(id)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
	})
	return
}

func UpdateRedemption(c *gin.Context) {
	statusOnly := c.Query("status_only")
	redemption := model.Redemption{}
	err := c.ShouldBindJSON(&redemption)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	cleanRedemption, err := model.GetRedemptionById(redemption.Id)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if statusOnly == "" {
		if valid, msg := validateExpiredTime(c, redemption.ExpiredTime); !valid {
			c.JSON(http.StatusOK, gin.H{"success": false, "message": msg})
			return
		}
		// If you add more fields, please also update redemption.Update()
		cleanRedemption.Name = redemption.Name
		cleanRedemption.Quota = redemption.Quota
		cleanRedemption.ExpiredTime = redemption.ExpiredTime
	}
	if statusOnly != "" {
		cleanRedemption.Status = redemption.Status
	}
	err = cleanRedemption.Update()
	if err != nil {
		common.ApiError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    cleanRedemption,
	})
	return
}

func DeleteInvalidRedemption(c *gin.Context) {
	rows, err := model.DeleteInvalidRedemptions()
	if err != nil {
		common.ApiError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    rows,
	})
	return
}

func validateExpiredTime(c *gin.Context, expired int64) (bool, string) {
	if expired != 0 && expired < common.GetTimestamp() {
		return false, i18n.T(c, i18n.MsgRedemptionExpireTimeInvalid)
	}
	return true, ""
}
