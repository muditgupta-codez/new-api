package middleware

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/common/fairuse"
	"github.com/QuantumNous/new-api/model"

	"github.com/gin-gonic/gin"
)

// ============================================================================
// Fair-use throttling for subscription plans
//
// Three throttles are enforced per user (single-container in-memory):
//   1. RPM              — sliding window of requests per minute
//   2. Concurrent       — max in-flight requests (atomic counter)
//   3. Daily tokens     — max tokens consumed per UTC day
//
// Limits come from the user's active subscription plans (most generous plan
// wins per metric; zero = unlimited). Users without an active plan are not
// throttled (backward compatible).
// ============================================================================

const (
	// ContextKeyFairUseLimits carries the user's effective RateLimits.
	ContextKeyFairUseLimits = "fair_use_limits"
	// ContextKeyFairUseConc marks a request that incremented the concurrent counter.
	ContextKeyFairUseConc = "fair_use_concurrent_counted"
)

// FairUseLimit checks the user's plan-based fair-use throttles. It must run
// after authentication (uid available) and before the relay proceeds.
func FairUseLimit() func(c *gin.Context) {
	return func(c *gin.Context) {
		uid := c.GetInt("id")
		if uid <= 0 {
			c.Next()
			return
		}

		limits, err := model.GetRateLimitsForUser(uid)
		if err != nil {
			// Fail-open: throttling must never break the API.
			common.SysError("fair-use limits lookup failed for user " + strconv.Itoa(uid) + ": " + err.Error())
			c.Next()
			return
		}
		c.Set(ContextKeyFairUseLimits, limits)

		if !limits.HasAny() {
			c.Next()
			return
		}

		// 1. RPM
		if limits.RpmLimit > 0 {
			if !fairuse.Default.AllowRPM(uid, limits.RpmLimit) {
				abortWithOpenAiMessage(c, http.StatusTooManyRequests, fmt.Sprintf("Rate limit exceeded: maximum %d requests per minute on your current plan.", limits.RpmLimit))
				return
			}
		}

		// 2. Daily tokens (pre-check; actual consumption recorded after relay)
		if limits.DailyTokenLimit > 0 {
			c.Set(fairuse.ContextKeyDailyEnabled, true)
			if !fairuse.Default.CheckDailyTokens(uid, limits.DailyTokenLimit) {
				abortWithOpenAiMessage(c, http.StatusTooManyRequests, "Daily token limit reached on your current plan. Please upgrade or try again tomorrow.")
				return
			}
		}

		// 3. Concurrent
		if limits.ConcurrentLimit > 0 {
			if !fairuse.Default.IncrConcurrent(uid, limits.ConcurrentLimit) {
				abortWithOpenAiMessage(c, http.StatusTooManyRequests, fmt.Sprintf("Too many concurrent requests: maximum %d in-flight on your current plan.", limits.ConcurrentLimit))
				return
			}
			c.Set(ContextKeyFairUseConc, true)
			defer fairuse.Default.DecrConcurrent(uid)
		}

		c.Next()
	}
}

// RecordFairUseDailyTokens is called after a relay completes to add the actual
// token consumption to the user's daily budget. It only records when the
// request passed through FairUseLimit with a daily budget enabled, and is
// idempotent per request (retries don't double-count).
func RecordFairUseDailyTokens(c *gin.Context, userId int, promptTokens int, completionTokens int) {
	fairuse.Default.RecordDailyForRequest(c, userId, promptTokens, completionTokens)
}
