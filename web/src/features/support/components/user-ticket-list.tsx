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
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { formatTimestamp } from '@/lib/format'

import { getMySupportTickets } from '../api'
import {
  getTicketCategoryLabel,
  getTicketPriorityLabel,
  getTicketStatusBadgeVariant,
  getTicketStatusLabel,
} from '../constants'
import type { SupportTicket } from '../types'

interface UserTicketListProps {
  onSelect: (ticket: SupportTicket) => void
}

export function UserTicketList({ onSelect }: UserTicketListProps) {
  const { t } = useTranslation()

  const { data, isLoading } = useQuery({
    queryKey: ['support', 'my-tickets'],
    queryFn: () => getMySupportTickets({ p: 1, size: 50 }),
  })

  const tickets = data?.data?.items ?? []

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16 text-sm text-muted-foreground'>
        {t('Loading...')}
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-2 py-16 text-center'>
        <p className='text-sm font-medium'>{t('No support tickets yet')}</p>
        <p className='text-sm text-muted-foreground'>
          {t('Open a ticket and our team will get back to you.')}
        </p>
      </div>
    )
  }

  return (
    <div className='divide-y'>
      {tickets.map((ticket) => (
        <button
          key={ticket.id}
          type='button'
          onClick={() => onSelect(ticket)}
          className='flex w-full items-center gap-3 px-1 py-3 text-left transition-colors hover:bg-muted/50'
        >
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium'>
              #{ticket.id} · {ticket.subject}
            </p>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              {getTicketCategoryLabel(ticket.category)} ·{' '}
              {getTicketPriorityLabel(ticket.priority)} ·{' '}
              {formatTimestamp(ticket.updated_at)}
            </p>
          </div>
          <span
            className={`inline-flex h-5 w-fit shrink-0 items-center rounded-full px-2 text-xs font-medium ${
              getTicketStatusBadgeVariant(ticket.status) === 'warning'
                ? 'border-warning/40 bg-warning/10 text-warning'
                : getTicketStatusBadgeVariant(ticket.status) === 'outline'
                  ? 'border-border text-foreground'
                  : 'bg-primary text-primary-foreground'
            }`}
          >
            {getTicketStatusLabel(ticket.status)}
          </span>
        </button>
      ))}
    </div>
  )
}
