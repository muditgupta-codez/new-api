package setting

var StripeApiSecret = ""
var StripeWebhookSecret = ""
var StripePriceId = ""
var StripeUnitPrice = 8.0
var StripeMinTopUp = 1
var StripePromotionCodesEnabled = false

// Subscription discount coupon. When a user applies the configured code,
// every subscription checkout gets the discount attached server-side.
var StripeSubscriptionCouponId = ""      // Stripe Coupon ID (percent_off) to attach
var SubscriptionCouponCode = ""          // code users type on the site (e.g. LAUNCH50)
var SubscriptionCouponPercent = 50.0     // discount percent applied to all plans
var SubscriptionCouponEnabled = false
