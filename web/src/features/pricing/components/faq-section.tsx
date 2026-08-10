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
import { useTranslation } from 'react-i18next'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface FaqEntry {
  questionKey: string
  answerKey: string
}

export function FaqSection() {
  const { t } = useTranslation()

  const faqs: FaqEntry[] = [
    {
      questionKey: 'What exactly do I get with a subscription?',
      answerKey:
        'A flat monthly price covers every model in your tier, a daily token allowance, and the rate limits listed on each plan card. There is no per-token billing — one price, one key, every model in your plan.',
    },
    {
      questionKey: 'Which models are included in each plan?',
      answerKey:
        'Starter includes 14 open-weight models (DeepSeek V4 Flash, Qwen Plus tier, GLM-5, MiniMax, Mimo, Hunyuan Hy3). Pro adds DeepSeek V4 Pro, Kimi K2.5–K2.7, GLM 5.1/5.2 and the Qwen Max tier for 22 total. Max unlocks all 25, including GPT-5.6-Luna, Grok 4.5 and Kimi K3.',
    },
    {
      questionKey: 'Can I upgrade or downgrade later?',
      answerKey:
        'Yes. Switch plans from your wallet/console any time — upgrades give you the wider model list and higher limits immediately.',
    },
    {
      questionKey: 'Is the API compatible with OpenAI SDKs?',
      answerKey:
        'Yes. Point any OpenAI-compatible client at https://zeskai.com/v1 with your Zeskai API key. opencode, Cline, Continue, Cursor, LangChain and most other tools work without code changes.',
    },
    {
      questionKey: 'How do tokens and daily quotas work?',
      answerKey:
        'A token is roughly a piece of a word. Each plan includes a daily token allowance (5M for Starter, 20M for Pro, 100M for Max) that resets every day. The dashboard shows your usage and remaining headroom in real time.',
    },
    {
      questionKey: 'What happens if I hit my daily limit?',
      answerKey:
        'Requests pause until your allowance resets the next day. Upgrade any time for a higher allowance — the switch applies immediately.',
    },
    {
      questionKey: 'What payment methods do you accept?',
      answerKey:
        'Cards are processed securely through Stripe. Subscriptions renew monthly and you can cancel anytime — no contracts, no lock-in.',
    },
  ]

  return (
    <section className='mx-auto mb-16 max-w-3xl px-4 sm:px-6'>
      <div className='mb-8 text-center'>
        <p className='text-muted-foreground mb-2 text-xs font-medium tracking-widest uppercase'>
          {t('FAQ')}
        </p>
        <h2 className='text-2xl font-bold tracking-tight md:text-3xl'>
          {t('Questions, answered')}
        </h2>
      </div>

      <Accordion
        className='w-full rounded-2xl border border-border/50 bg-background px-5'
      >
        {faqs.map((faq, index) => (
          <AccordionItem
            key={faq.questionKey}
            value={`faq-${index}`}
            className='border-border/60'
          >
            <AccordionTrigger className='text-start hover:no-underline'>
              <span className='text-sm leading-relaxed font-semibold'>
                {t(faq.questionKey)}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <p className='text-muted-foreground/70 text-sm leading-relaxed'>
                {t(faq.answerKey)}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
