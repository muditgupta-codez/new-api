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

import { Button } from '@/components/ui/button'
import { useStatus } from '@/hooks/use-status'
import { useAuthStore } from '@/stores/auth-store'

export function CtaBanner() {
  const { t } = useTranslation()
  const { auth } = useAuthStore()
  const { status } = useStatus()
  const isAuthenticated = !!auth.user
  const ctaHref = isAuthenticated ? '/wallet' : '/sign-up'
  const docsUrl =
    (status?.docs_link as string | undefined) || 'https://docs.zeskai.com'

  return (
    <section className='mx-auto mb-16 max-w-6xl px-4 sm:px-6'>
      <div className='relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-background to-background px-6 py-12 text-center sm:px-12 sm:py-16'>
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 opacity-40'
          style={{
            background:
              'radial-gradient(ellipse 50% 60% at 50% 0%, oklch(0.62 0.2 255 / 35%) 0%, transparent 70%)',
          }}
        />
        <div className='relative'>
          <h2 className='text-2xl font-bold tracking-tight md:text-3xl'>
            {t('Start building with every model')}
          </h2>
          <p className='text-muted-foreground mx-auto mt-3 max-w-xl text-sm leading-relaxed'>
            {t(
              'Create your account and get your API key in under a minute. One subscription, every model, zero per-token surprises.'
            )}
          </p>
          <div className='mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row'>
            <Button
              className='group rounded-lg'
              render={<Link to={ctaHref} />}
            >
              {t('Get started')}
              <ArrowRight className='size-4 transition-transform group-hover:translate-x-0.5' />
            </Button>
            <Button
              variant='outline'
              className='rounded-lg'
              render={
                <a href={docsUrl} target='_blank' rel='noopener noreferrer' />
              }
            >
              {t('Read the docs')}
            </Button>
          </div>
          <p className='text-muted-foreground/60 mt-4 text-xs'>
            {t('No credit card required to sign up')}
          </p>
        </div>
      </div>
    </section>
  )
}
