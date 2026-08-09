// Package fairuse provides in-memory fair-use throttling counters used by the
// subscription plan throttle middleware. State is process-local (single
// container); zero values mean "unlimited".
package fairuse

import (
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	rpmPrefix        = "rpm:"
	concurrentPrefix = "conc:"
	dailyPrefix      = "daily:"

	// ContextKeyDailyCounted marks a request whose tokens have already been
	// counted for the daily budget (idempotency guard).
	ContextKeyDailyCounted = "fair_use_daily_counted"
	// ContextKeyDailyEnabled marks a request subject to a daily token budget
	// (set by the fair-use middleware when the user has a daily limit).
	ContextKeyDailyEnabled = "fair_use_daily_enabled"
)

// Default is the process-wide limiter used by middleware and log hooks.
var Default = New()

// Limiter holds all in-memory fair-use counters.
type Limiter struct {
	mu         sync.Mutex
	rpm        map[string][]int64 // key -> request timestamps (sliding window)
	concurrent map[string]int     // key -> in-flight count
	daily      map[string]int64   // key -> tokens consumed today
}

// New returns an initialized Limiter.
func New() *Limiter {
	return &Limiter{
		rpm:        make(map[string][]int64),
		concurrent: make(map[string]int),
		daily:      make(map[string]int64),
	}
}

// ---------------------------------------------------------------------------
// RPM sliding window
// ---------------------------------------------------------------------------

// AllowRPM records a request timestamp and reports whether the request may
// proceed within the trailing 60s window.
func (l *Limiter) AllowRPM(userId int, limit int) bool {
	if limit <= 0 {
		return true
	}
	l.mu.Lock()
	defer l.mu.Unlock()
	now := time.Now().Unix()
	windowStart := now - 60
	key := rpmPrefix + strconv.Itoa(userId)
	queue := l.rpm[key]
	kept := queue[:0]
	for _, ts := range queue {
		if ts >= windowStart {
			kept = append(kept, ts)
		}
	}
	if len(kept) >= limit {
		l.rpm[key] = kept
		return false
	}
	l.rpm[key] = append(kept, now)
	return true
}

// ---------------------------------------------------------------------------
// Concurrent counter
// ---------------------------------------------------------------------------

// IncrConcurrent increments the in-flight counter and reports whether the
// request may proceed (count <= limit).
func (l *Limiter) IncrConcurrent(userId int, limit int) bool {
	if limit <= 0 {
		return true
	}
	l.mu.Lock()
	defer l.mu.Unlock()
	key := concurrentPrefix + strconv.Itoa(userId)
	cur := l.concurrent[key]
	if cur >= limit {
		return false
	}
	l.concurrent[key] = cur + 1
	return true
}

// DecrConcurrent decrements the in-flight counter.
func (l *Limiter) DecrConcurrent(userId int) {
	l.mu.Lock()
	defer l.mu.Unlock()
	key := concurrentPrefix + strconv.Itoa(userId)
	if cur, ok := l.concurrent[key]; ok {
		if cur <= 1 {
			delete(l.concurrent, key)
		} else {
			l.concurrent[key] = cur - 1
		}
	}
}

// ---------------------------------------------------------------------------
// Daily token counter
// ---------------------------------------------------------------------------

func dailyKey(userId int) string {
	return dailyPrefix + strconv.Itoa(userId) + ":" + time.Now().UTC().Format("2006-01-02")
}

// CheckDailyTokens reports whether the user is under their daily token budget.
func (l *Limiter) CheckDailyTokens(userId int, limit int64) bool {
	if limit <= 0 {
		return true
	}
	l.mu.Lock()
	defer l.mu.Unlock()
	return l.daily[dailyKey(userId)] < limit
}

// RecordDailyTokens adds consumed tokens to the daily counter.
func (l *Limiter) RecordDailyTokens(userId int, tokens int64) {
	if tokens <= 0 {
		return
	}
	l.mu.Lock()
	defer l.mu.Unlock()
	l.daily[dailyKey(userId)] += tokens
}

// RecordDailyForRequest adds consumed tokens to the user's daily budget,
// guarded by a per-request context flag so retries don't double-count. It is
// safe to call from log/consume hooks; it no-ops when the request was not
// marked by the fair-use middleware (no active plan limits).
func (l *Limiter) RecordDailyForRequest(c *gin.Context, userId int, promptTokens int, completionTokens int) {
	if c == nil || userId <= 0 {
		return
	}
	if !c.GetBool(ContextKeyDailyEnabled) {
		return
	}
	if c.GetBool(ContextKeyDailyCounted) {
		return
	}
	c.Set(ContextKeyDailyCounted, true)
	l.RecordDailyTokens(userId, int64(promptTokens+completionTokens))
}
