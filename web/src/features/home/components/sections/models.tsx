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
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'
import { Button } from '@/components/ui/button'

interface ModelFamily {
  name: string
  models: string
  tier: 'Starter' | 'Pro' | 'Max'
}

const TIER_STYLES: Record<ModelFamily['tier'], string> = {
  Starter: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400',
  Pro: 'border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400',
  Max: 'border-violet-500/20 bg-violet-500/5 text-violet-600 dark:text-violet-400',
}

export function Models() {
  const { t } = useTranslation()

  const families: ModelFamily[] = [
    {
      name: 'DeepSeek',
      models: 'V4 Flash · V4 Pro',
      tier: 'Starter',
    },
    {
      name: 'Qwen',
      models: '3.5/3.6/3.7 Plus · 3.7/3.8 Max',
      tier: 'Starter',
    },
    {
      name: 'GLM',
      models: '5 · 5.1 · 5.2',
      tier: 'Starter',
    },
    {
      name: 'Kimi',
      models: 'K2.5 · K2.6 · K2.7-Code · K3',
      tier: 'Pro',
    },
    {
      name: 'MiniMax',
      models: 'M2.5 · M2.7 · M3',
      tier: 'Starter',
    },
    {
      name: 'Mimo',
      models: 'V2 Pro · V2 Omni · V2.5 · V2.5 Pro',
      tier: 'Starter',
    },
    {
      name: 'Hunyuan',
      models: 'Hy3 · Hy3 Preview',
      tier: 'Starter',
    },
    {
      name: 'Grok',
      models: '4.5',
      tier: 'Max',
    },
    {
      name: 'GPT',
      models: '5.6-Luna',
      tier: 'Max',
    },
  ]

  return (
    <section className='border-border/40 relative z-10 border-t px-6 py-24 md:py-32'>
      <div className='mx-auto max-w-6xl'>
        <AnimateInView className='mx-auto mb-16 max-w-2xl text-center md:mb-20'>
          <p className='text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase'>
            {t('The Model Catalog')}
          </p>
          <h2 className='text-2xl font-bold tracking-tight md:text-3xl'>
            {t('25 frontier and open-weight models. One key.')}
          </h2>
          <p className='text-muted-foreground/80 mx-auto mt-4 max-w-xl text-sm leading-relaxed md:text-base'>
            {t(
              'Every major family is behind the same endpoint. Your plan decides access — your code never changes.'
            )}
          </p>
        </AnimateInView>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {families.map((family, i) => (
            <AnimateInView
              key={family.name}
              delay={i * 60}
              animation='fade-up'
              className='border-border/50 bg-background group flex flex-col rounded-2xl border p-6 transition-shadow hover:shadow-md'
            >
              <div className='mb-2 flex items-center justify-between gap-2'>
                <h3 className='text-base font-bold'>{family.name}</h3>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${TIER_STYLES[family.tier]}`}
                >
                  {t(family.tier)}
                </span>
              </div>
              <p className='text-muted-foreground font-mono text-xs leading-relaxed'>
                {family.models}
              </p>
            </AnimateInView>
          ))}
        </div>

        <div className='mt-10 text-center'>
          <Button
            variant='outline'
            className='border-border/50 hover:border-border hover:bg-muted/50 group rounded-lg'
            render={<Link to='/pricing' />}
          >
            {t('See full model list')}
            <ArrowRight className='ml-1.5 size-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
          </Button>
        </div>
      </div>
    </section>
  )
}
