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
import { UserPlus, KeyRound, Rocket } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Step {
  icon: typeof UserPlus
  titleKey: string
  bodyKey: string
}

export function HowItWorks() {
  const { t } = useTranslation()

  const steps: Step[] = [
    {
      icon: UserPlus,
      titleKey: 'Create your account',
      bodyKey:
        'Sign up in seconds — no credit card required until you pick a plan.',
    },
    {
      icon: KeyRound,
      titleKey: 'Generate an API key',
      bodyKey:
        'Head to the console and create a key in one click. Your quota activates immediately.',
    },
    {
      icon: Rocket,
      titleKey: 'Point your tools at Zeskai',
      bodyKey:
        'Set the base URL to https://zeskai.com/v1 and pick any model in your plan. opencode, Cline, Continue and Cursor all work out of the box.',
    },
  ]

  return (
    <section className='mx-auto mb-16 max-w-6xl px-4 sm:px-6'>
      <div className='mb-8 text-center'>
        <p className='text-muted-foreground mb-2 text-xs font-medium tracking-widest uppercase'>
          {t('Getting Started')}
        </p>
        <h2 className='text-2xl font-bold tracking-tight md:text-3xl'>
          {t('Live in under a minute')}
        </h2>
      </div>

      <div className='grid gap-5 md:grid-cols-3'>
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <div key={step.titleKey} className='relative'>
              <div className='rounded-2xl border border-border/50 bg-background p-6'>
                <div className='mb-4 flex items-center justify-between'>
                  <div className='bg-primary/10 text-primary inline-flex size-10 items-center justify-center rounded-xl'>
                    <Icon className='size-5' />
                  </div>
                  <span className='text-muted-foreground/40 text-4xl font-bold'>
                    {index + 1}
                  </span>
                </div>
                <h3 className='text-sm font-semibold'>{t(step.titleKey)}</h3>
                <p className='text-muted-foreground mt-2 text-xs leading-relaxed'>
                  {t(step.bodyKey)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
