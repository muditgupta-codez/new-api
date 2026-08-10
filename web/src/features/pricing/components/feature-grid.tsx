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
import {
  KeyRound,
  PlugZap,
  Gauge,
  LayoutDashboard,
  Blocks,
  BadgeCheck,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Feature {
  icon: LucideIcon
  titleKey: string
  bodyKey: string
}

export function FeatureGrid() {
  const { t } = useTranslation()

  const features: Feature[] = [
    {
      icon: KeyRound,
      titleKey: 'One key, every model',
      bodyKey:
        'A single API key unlocks every model in your plan. No per-provider accounts, no juggling credentials — DeepSeek, Qwen, GLM, Kimi, GPT and more behind one endpoint.',
    },
    {
      icon: PlugZap,
      titleKey: 'OpenAI-compatible API',
      bodyKey:
        'Drop-in replacement for the OpenAI API. Set your base URL to https://zeskai.com/v1, swap in your key, and everything just works.',
    },
    {
      icon: Gauge,
      titleKey: 'Flat monthly quotas',
      bodyKey:
        'Every plan includes a generous daily token allowance and clear rate limits. No per-token meter, no surprise bills at the end of the month.',
    },
    {
      icon: LayoutDashboard,
      titleKey: 'Usage dashboard',
      bodyKey:
        'Track tokens, spend and rate-limit headroom per key in real time. See exactly which models you use and how much headroom you have left.',
    },
    {
      icon: Blocks,
      titleKey: 'Works with your tools',
      bodyKey:
        'Compatible with opencode, Cline, Continue, Cursor, LangChain and any tool that speaks the OpenAI protocol. Point them at Zeskai and keep your workflow.',
    },
    {
      icon: BadgeCheck,
      titleKey: 'Cancel anytime',
      bodyKey:
        'No contracts, no lock-in. Upgrade, downgrade or cancel from your console whenever you like — your code and keys stay yours.',
    },
  ]

  return (
    <section className='mx-auto mb-16 max-w-6xl px-4 sm:px-6'>
      <div className='mb-8 text-center'>
        <p className='text-muted-foreground mb-2 text-xs font-medium tracking-widest uppercase'>
          {t('Everything Included')}
        </p>
        <h2 className='text-2xl font-bold tracking-tight md:text-3xl'>
          {t('One subscription. Zero friction.')}
        </h2>
      </div>

      <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div
              key={feature.titleKey}
              className='rounded-2xl border border-border/50 bg-background p-6 transition-shadow hover:shadow-md'
            >
              <div className='bg-primary/10 text-primary mb-4 inline-flex size-10 items-center justify-center rounded-xl'>
                <Icon className='size-5' />
              </div>
              <h3 className='text-sm font-semibold'>{t(feature.titleKey)}</h3>
              <p className='text-muted-foreground mt-2 text-xs leading-relaxed'>
                {t(feature.bodyKey)}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
