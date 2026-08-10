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
import { Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'

interface Row {
  labelKey: string
  starter: string
  pro: string
  max: string
}

export function ComparisonTable() {
  const { t } = useTranslation()
  const { auth } = useAuthStore()
  const isAuthenticated = !!auth.user

  const rows: Row[] = [
    {
      labelKey: 'Models included',
      starter: '14',
      pro: '22',
      max: 'All 25',
    },
    {
      labelKey: 'Model highlights',
      starter: t(
        'DeepSeek V4 Flash, Qwen 3.5/3.6/3.7 Plus, GLM-5, MiniMax M2.5–M3, Mimo V2 family, Hunyuan Hy3'
      ),
      pro: t(
        'Everything in Starter, plus DeepSeek V4 Pro, Kimi K2.5–K2.7, GLM 5.1/5.2, Qwen 3.7/3.8 Max'
      ),
      max: t('Everything in Pro, plus GPT-5.6-Luna, Grok 4.5, Kimi K3'),
    },
    {
      labelKey: 'Daily token quota',
      starter: '5M',
      pro: '20M',
      max: '100M',
    },
    {
      labelKey: 'Requests per minute',
      starter: '30',
      pro: '120',
      max: '300',
    },
    {
      labelKey: 'Concurrent requests',
      starter: '2',
      pro: '8',
      max: '32',
    },
    {
      labelKey: 'OpenAI-compatible API',
      starter: t('Included'),
      pro: t('Included'),
      max: t('Included'),
    },
    {
      labelKey: 'Usage dashboard',
      starter: t('Included'),
      pro: t('Included'),
      max: t('Included'),
    },
  ]

  const ctaHref = isAuthenticated ? '/wallet' : '/sign-up'

  return (
    <section className='mx-auto mb-16 max-w-6xl px-4 sm:px-6'>
      <div className='mb-8 text-center'>
        <p className='text-muted-foreground mb-2 text-xs font-medium tracking-widest uppercase'>
          {t('Compare Plans')}
        </p>
        <h2 className='text-2xl font-bold tracking-tight md:text-3xl'>
          {t('Find the right tier')}
        </h2>
      </div>

      <div className='overflow-x-auto rounded-2xl border border-border/50 bg-background'>
        <table className='w-full min-w-[640px] border-collapse text-left text-sm'>
          <thead>
            <tr className='border-border/50 border-b'>
              <th className='text-muted-foreground px-5 py-4 text-xs font-medium tracking-wide uppercase'>
                {t('Feature')}
              </th>
              <th className='px-5 py-4'>
                <div className='text-base font-bold'>Starter</div>
                <div className='text-muted-foreground text-xs'>$18/month</div>
              </th>
              <th className='bg-blue-500/[0.04] px-5 py-4'>
                <div className='flex items-center gap-1.5 text-base font-bold'>
                  <Sparkles className='text-blue-500 size-3.5' />
                  Pro
                </div>
                <div className='text-muted-foreground text-xs'>$39/month</div>
              </th>
              <th className='px-5 py-4'>
                <div className='text-base font-bold'>Max</div>
                <div className='text-muted-foreground text-xs'>$99/month</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.labelKey}
                className='border-border/50 border-b last:border-0'
              >
                <td className='text-muted-foreground px-5 py-4 text-xs leading-relaxed'>
                  {t(row.labelKey)}
                </td>
                <td className='px-5 py-4 text-xs leading-relaxed'>
                  {row.starter}
                </td>
                <td className='bg-blue-500/[0.04] px-5 py-4 text-xs leading-relaxed'>
                  {row.pro}
                </td>
                <td className='px-5 py-4 text-xs leading-relaxed'>{row.max}</td>
              </tr>
            ))}
            <tr>
              <td className='px-5 py-5' />
              <td className='px-5 py-5'>
                <Button
                  variant='outline'
                  className='w-full'
                  render={<Link to={ctaHref} />}
                >
                  {t('Get Starter')}
                </Button>
              </td>
              <td className='bg-blue-500/[0.04] px-5 py-5'>
                <Button
                  variant='default'
                  className='w-full'
                  render={<Link to={ctaHref} />}
                >
                  {t('Go Pro')}
                </Button>
              </td>
              <td className='px-5 py-5'>
                <Button
                  variant='outline'
                  className='w-full'
                  render={<Link to={ctaHref} />}
                >
                  {t('Go Max')}
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className='text-muted-foreground/60 mt-4 text-center text-xs'>
        {t(
          'All plans include the same dashboard, API and support channels. The difference is model access, quota and rate limits.'
        )}
      </p>
    </section>
  )
}
