package controller

import (
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/setting"
	"github.com/gin-gonic/gin"
)

type ApplySubscriptionCouponRequest struct {
	Code string `json:"code"`
}

// ValidateSubscriptionCoupon checks a coupon code against the configured
// subscription discount. Returns the discount percent when valid.
// Shared by the apply endpoint and the stripe/balance pay flows so the
// discount is always validated server-side at checkout time.
func ValidateSubscriptionCoupon(code string) (percent float64, ok bool, reason string) {
	code = strings.TrimSpace(code)
	if !setting.SubscriptionCouponEnabled {
		return 0, false, "Coupon feature is not enabled"
	}
	if setting.SubscriptionCouponCode == "" {
		return 0, false, "Coupon is not configured"
	}
	if !strings.EqualFold(code, setting.SubscriptionCouponCode) {
		return 0, false, "Invalid coupon code"
	}
	percent = setting.SubscriptionCouponPercent
	if percent <= 0 || percent >= 100 {
		percent = 50
	}
	return percent, true, ""
}

// ApplySubscriptionCoupon validates a coupon code and returns the discount.
// Public route (no auth) so visitors can preview the discount on the pricing
// page before signing up; the discount is re-validated at checkout.
func ApplySubscriptionCoupon(c *gin.Context) {
	var req ApplySubscriptionCouponRequest
	if err := common.DecodeJson(c.Request.Body, &req); err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "参数错误"})
		return
	}

	percent, ok, reason := ValidateSubscriptionCoupon(req.Code)
	if !ok {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": reason})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "success",
		"data": gin.H{
			"valid":            true,
			"discount_percent": percent,
			"code":             strings.ToUpper(strings.TrimSpace(req.Code)),
		},
	})
}
