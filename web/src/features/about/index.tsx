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
import { ArrowRight, Mail, ShieldCheck, Sparkles, Workflow } from 'lucide-react'

import { PublicLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'

export function About() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className='border-border/40 relative overflow-hidden px-6 pt-20 pb-16 md:pt-28 md:pb-24'>
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 -z-10 opacity-25 dark:opacity-[0.12]'
          style={{
            background: [
              'radial-gradient(ellipse 60% 50% at 20% 20%, oklch(0.72 0.18 250 / 80%) 0%, transparent 70%)',
              'radial-gradient(ellipse 50% 40% at 80% 15%, oklch(0.65 0.15 200 / 60%) 0%, transparent 70%)',
            ].join(', '),
          }}
        />
        <div className='mx-auto max-w-3xl text-center'>
          <div className='mb-5 inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1.5 text-[11px] font-medium text-blue-600 dark:text-blue-400'>
            <span className='relative flex size-1.5'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75' />
            </span>
            <span>About Zeskai</span>
          </div>
          <h1 className='text-[clamp(2.25rem,4.5vw,3.25rem)] leading-[1.15] font-bold tracking-tight'>
            Simple access to the world's best AI models.
          </h1>
          <p className='text-muted-foreground/80 mx-auto mt-5 max-w-xl text-base leading-relaxed'>
            Zeskai exists to remove the friction from using AI in your work.
            No account sprawl, no surprise bills, no provider hopping — just a
            single, reliable way to build with the models you need.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className='border-border/40 border-t px-6 py-16 md:py-24'>
        <div className='mx-auto max-w-6xl'>
          <div className='grid gap-12 lg:grid-cols-2 lg:items-center'>
            <div>
              <p className='text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase'>
                Our Mission
              </p>
              <h2 className='text-2xl font-bold tracking-tight md:text-3xl'>
                Make powerful AI boring to integrate.
              </h2>
              <p className='text-muted-foreground/80 mt-4 text-sm leading-relaxed md:text-base'>
                The AI landscape moves fast — new models ship constantly, and
                keeping up means juggling different providers, different
                accounts, and different billing systems. We believe using AI
                should be as straightforward as using any other API: one
                integration, one place to manage access, and predictable costs
                you can plan around.
              </p>
              <p className='text-muted-foreground/80 mt-4 text-sm leading-relaxed md:text-base'>
                That's the problem we're building for: a single platform that
                gives developers and teams dependable access to frontier and
                open-weight models without the operational overhead.
              </p>
              <Button
                className='group mt-8 h-11 rounded-lg px-5 text-sm font-medium'
                render={<Link to='/sign-up' />}
              >
                Get Started
                <ArrowRight className='ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5' />
              </Button>
            </div>

            {/* Value props */}
            <div className='grid gap-4 sm:grid-cols-1'>
              {[
                {
                  icon: Workflow,
                  title: 'One integration, many models',
                  body: 'A single OpenAI-compatible endpoint means your code keeps working whether you switch models today or next quarter.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Built for reliability',
                  body: 'We obsess over uptime, error handling, and clear documentation so you can ship with confidence.',
                },
                {
                  icon: Sparkles,
                  title: 'Made for builders',
                  body: 'We are developers ourselves. We design for the workflows real teams use, not for dashboards that impress.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className='border-border/50 bg-background group flex items-start gap-4 rounded-2xl border p-6'
                >
                  <div className='border-border/60 bg-muted/40 flex size-10 shrink-0 items-center justify-center rounded-lg border'>
                    <item.icon className='text-primary size-5' />
                  </div>
                  <div>
                    <h3 className='text-base font-bold'>{item.title}</h3>
                    <p className='text-muted-foreground/80 mt-1 text-sm leading-relaxed'>
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What we offer */}
      <section className='border-border/40 border-t px-6 py-16 md:py-24'>
        <div className='mx-auto max-w-6xl'>
          <div className='mx-auto mb-12 max-w-2xl text-center'>
            <p className='text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase'>
              What We Offer
            </p>
            <h2 className='text-2xl font-bold tracking-tight md:text-3xl'>
              Everything you need to build with AI.
            </h2>
          </div>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {[
              {
                title: 'Model access',
                body: 'Frontier and open-weight models across the major families, all reachable through one key.',
              },
              {
                title: 'Developer experience',
                body: 'OpenAI-compatible API, clear docs, and a console that gets out of your way.',
              },
              {
                title: 'Predictable billing',
                body: 'Subscription pricing with no per-request surprises, so costs stay easy to plan for.',
              },
              {
                title: 'Support that helps',
                body: 'A small team that answers questions and fixes issues — not a ticket queue that disappears.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className='border-border/50 bg-background rounded-2xl border p-6'
              >
                <h3 className='text-base font-bold'>{item.title}</h3>
                <p className='text-muted-foreground/80 mt-2 text-sm leading-relaxed'>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className='border-border/40 border-t px-6 py-16 md:py-24'>
        <div className='mx-auto max-w-2xl text-center'>
          <h2 className='text-2xl font-bold tracking-tight md:text-3xl'>
            Questions? We'd love to hear from you.
          </h2>
          <p className='text-muted-foreground/80 mx-auto mt-4 max-w-lg text-sm leading-relaxed md:text-base'>
            Whether you're evaluating Zeskai, have feedback on the product, or
            want to tell us what you'd like to see next — reach out and a real
            human will get back to you.
          </p>
          <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
            <Button
              variant='outline'
              className='group border-border/50 hover:border-border hover:bg-muted/50 h-11 rounded-lg px-5 text-sm font-medium'
              render={
                <a href='mailto:support@zeskai.com'>
                  <Mail className='text-muted-foreground/80 group-hover:text-foreground mr-2 inline size-4' />
                  support@zeskai.com
                </a>
              }
            />
            <Button
              variant='outline'
              className='group border-border/50 hover:border-border hover:bg-muted/50 h-11 rounded-lg px-5 text-sm font-medium'
              render={<Link to='/pricing' />}
            >
              View Plans
              <ArrowRight className='ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5' />
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
