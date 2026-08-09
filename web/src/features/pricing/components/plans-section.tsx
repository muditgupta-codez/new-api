/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { Link } from '@tanstack/react-router'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { getPublicPlans, paySubscriptionStripe } from '@/features/subscriptions/api'
import type { PlanRecord } from '@/features/subscriptions/types'
import { useAuthStore } from '@/stores/auth-store'

interface Plan {
  nameKey: string
  price: string
  period: string
  tagline: string
  cta: string
  highlighted?: boolean
  features: string[]
}

export function PlansSection() {
  const { t } = useTranslation()
  const { auth } = useAuthStore()
  const isAuthenticated = !!auth.user

  const [publicPlans, setPublicPlans] = useState<PlanRecord[]>([])
  const [payingPlan, setPayingPlan] = useState<string | null>(null)

  // The public plans endpoint requires auth; we only need plan ids to
  // launch the Stripe checkout for signed-in users.
  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    getPublicPlans()
      .then((res) => {
        if (!cancelled && res.success) setPublicPlans(res.data || [])
      })
      .catch(() => {
        // Non-fatal: CTAs fall back to /wallet when plans can't be loaded.
      })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  // Map a marketing card to its backend plan by (English) title — matched
  // against the untranslated nameKey so locale doesn't break the lookup.
  const findBackendPlan = (nameKey: string) =>
    publicPlans.find((p) => p.plan?.title === nameKey)?.plan

  // When signed in, kick off the Stripe subscription checkout directly.
  // In-tab redirect (not window.open) — the user-gesture context is lost
  // across the await, so a popup would be blocked. Stripe returns the user
  // to /wallet on success/cancel.
  const handleSubscribe = async (plan: Plan) => {
    if (!isAuthenticated) {
      return
    }
    const backendPlan = findBackendPlan(plan.nameKey)
    if (!backendPlan?.id) {
      window.location.href = '/wallet'
      return
    }
    setPayingPlan(plan.nameKey)
    try {
      const res = await paySubscriptionStripe({ plan_id: backendPlan.id })
      if (res.message === 'success' && res.data?.pay_link) {
        window.location.href = res.data.pay_link
      } else {
        toast.error(
          res.message && res.message !== 'success'
            ? res.message
            : t('Payment request failed')
        )
      }
    } catch {
      toast.error(t('Payment request failed'))
    } finally {
      setPayingPlan(null)
    }
  }

  const isPaying = (nameKey: string) => payingPlan === nameKey

  const plans: Plan[] = [
    {
      nameKey: 'Starter',
      price: '$18',
      period: t('/month'),
      tagline: t('For solo devs who want one reliable key'),
      cta: t('Get Starter'),
      features: [
        t('Access to open-weight models: DeepSeek, Qwen, GLM, Kimi'),
        t('Generous daily quota — thousands of requests'),
        t('Works with opencode, Cline, Continue, Cursor'),
        t('Usage dashboard'),
      ],
    },
    {
      nameKey: 'Pro',
      price: '$39',
      period: t('/month'),
      tagline: t('Frontier models for serious AI-assisted dev'),
      cta: t('Go Pro'),
      highlighted: true,
      features: [
        t('Everything in Starter'),
        t('Frontier models: Claude, GPT, Gemini'),
        t('Higher quotas and faster rate limits'),
        t('Priority routing & support'),
      ],
    },
    {
      nameKey: 'Max',
      price: '$99',
      period: t('/month'),
      tagline: t('For teams shipping with AI every day'),
      cta: t('Go Max'),
      features: [
        t('Everything in Pro'),
        t('5 member seats with individual keys'),
        t('Per-member quotas and usage reports'),
        t('Admin controls & spend visibility'),
      ],
    },
  ]

  return (
    <section className='mx-auto mb-14 max-w-6xl px-4 sm:px-6'>
      <div className='mb-8 text-center'>
        <p className='text-muted-foreground mb-2 text-xs font-medium tracking-widest uppercase'>
          {t('Subscription Plans')}
        </p>
        <h2 className='text-2xl font-bold tracking-tight md:text-3xl'>
          {t('One price. Every model. No meter.')}
        </h2>
        <p className='text-muted-foreground mx-auto mt-3 max-w-xl text-sm leading-relaxed'>
          {t(
            'Flat monthly pricing with generous quotas. Cancel anytime — your code stays yours.'
          )}
        </p>
      </div>

      <div className='grid gap-5 md:grid-cols-3'>
        {plans.map((plan) => (
          <div
            key={plan.nameKey}
            className={`relative flex flex-col rounded-2xl border p-6 transition-shadow ${
              plan.highlighted
                ? 'border-blue-500/40 bg-blue-500/[0.03] shadow-[0_8px_40px_-12px_rgba(59,130,246,0.25)]'
                : 'border-border/50 bg-background hover:shadow-md'
            }`}
          >
            {plan.highlighted && (
              <span className='bg-blue-500/10 text-blue-600 dark:text-blue-400 absolute -top-2.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border border-blue-500/30 px-3 py-0.5 text-[10px] font-semibold tracking-wide uppercase'>
                <Sparkles className='size-3' />
                {t('Most Popular')}
              </span>
            )}
            <h3 className='text-sm font-semibold'>{t(plan.nameKey)}</h3>
            <div className='mt-2 flex items-baseline gap-1'>
              <span className='text-3xl font-bold tracking-tight'>
                {plan.price}
              </span>
              <span className='text-muted-foreground text-sm'>
                {plan.period}
              </span>
            </div>
            <p className='text-muted-foreground mt-1.5 text-xs leading-relaxed'>
              {plan.tagline}
            </p>
            <ul className='mt-5 flex-1 space-y-2.5'>
              {plan.features.map((feature) => (
                <li key={feature} className='flex items-start gap-2'>
                  <Check className='text-emerald-500 mt-0.5 size-4 shrink-0' />
                  <span className='text-muted-foreground text-xs leading-relaxed'>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            <Button
              className='mt-6 w-full'
              variant={plan.highlighted ? 'default' : 'outline'}
              disabled={isPaying(plan.nameKey)}
              onClick={() => handleSubscribe(plan)}
              render={
                !isAuthenticated ? <Link to='/sign-up' /> : undefined
              }
            >
              {isPaying(plan.nameKey) ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                plan.cta
              )}
            </Button>
          </div>
        ))}
      </div>

      <p className='text-muted-foreground/60 mt-6 text-center text-xs'>
        {t(
          'Plans subject to fair-use quotas. All models available to every plan at their tier quota.'
        )}
      </p>
    </section>
  )
}
