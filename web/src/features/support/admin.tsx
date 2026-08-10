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
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SectionPageLayout } from '@/components/layout'
import { Textarea } from '@/components/ui/textarea'
import { formatTimestamp } from '@/lib/format'

import {
  adminDeleteSupportTicket,
  adminReplySupportTicket,
  adminSetSupportTicketStatus,
  getAdminSupportTicket,
  getAdminSupportTickets,
} from './api'
import {
  SUPPORT_TICKET_STATUS,
  getTicketPriorityLabel,
  getTicketStatusBadgeVariant,
  getTicketStatusLabel,
} from './constants'
import type { SupportTicket } from './types'

type StatusFilter = 0 | 1 | 2 | 3 // 0 = all

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 0, label: 'All' },
  { value: SUPPORT_TICKET_STATUS.OPEN, label: 'Open' },
  { value: SUPPORT_TICKET_STATUS.REPLIED, label: 'Awaiting user' },
  { value: SUPPORT_TICKET_STATUS.CLOSED, label: 'Closed' },
]

export function SupportAdminPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(0)
  const [selected, setSelected] = useState<SupportTicket | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['support', 'admin-tickets', statusFilter],
    queryFn: () =>
      getAdminSupportTickets({
        p: 1,
        size: 50,
        status: statusFilter || undefined,
      }),
  })

  const tickets = data?.data?.items ?? []

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['support'] })
  }

  return (
    <SectionPageLayout fixedContent>
      <SectionPageLayout.Title>{t('Support tickets')}</SectionPageLayout.Title>
      <SectionPageLayout.Actions>
        <div className='flex items-center gap-1'>
          {STATUS_FILTERS.map((f) => (
            <Button
              key={f.value}
              size='sm'
              variant={statusFilter === f.value ? 'default' : 'outline'}
              onClick={() => setStatusFilter(f.value)}
            >
              {t(f.label)}
            </Button>
          ))}
        </div>
      </SectionPageLayout.Actions>
      <SectionPageLayout.Content>
        {isLoading && (
          <div className='flex items-center justify-center py-16 text-sm text-muted-foreground'>
            {t('Loading...')}
          </div>
        )}
        {!isLoading && tickets.length === 0 && (
          <div className='flex flex-col items-center justify-center gap-2 py-16 text-center'>
            <p className='text-sm font-medium'>{t('No tickets found')}</p>
          </div>
        )}
        {!isLoading && tickets.length > 0 && (
          <div className='divide-y'>
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                type='button'
                onClick={() => setSelected(ticket)}
                className='flex w-full items-center gap-3 px-1 py-3 text-left transition-colors hover:bg-muted/50'
              >
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium'>
                    #{ticket.id} · {ticket.subject}
                  </p>
                  <p className='mt-0.5 text-xs text-muted-foreground'>
                    {t('User')} #{ticket.user_id} ·{' '}
                    {getTicketPriorityLabel(ticket.priority)} ·{' '}
                    {formatTimestamp(ticket.updated_at)}
                  </p>
                </div>
                <Badge variant={getTicketStatusBadgeVariant(ticket.status)}>
                  {getTicketStatusLabel(ticket.status)}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </SectionPageLayout.Content>

      <AdminTicketDetailDialog
        ticket={selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onChanged={refresh}
      />
    </SectionPageLayout>
  )
}

interface AdminTicketDetailDialogProps {
  ticket: SupportTicket | null
  onOpenChange: (open: boolean) => void
  onChanged: () => void
}

function AdminTicketDetailDialog({
  ticket,
  onOpenChange,
  onChanged,
}: AdminTicketDetailDialogProps) {
  const { t } = useTranslation()
  const [reply, setReply] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['support', 'admin-ticket', ticket?.id],
    queryFn: () => getAdminSupportTicket(ticket!.id),
    enabled: !!ticket,
  })

  const detail = data?.data
  const status = detail?.ticket.status ?? ticket?.status ?? 0
  const isClosed = status === SUPPORT_TICKET_STATUS.CLOSED

  const doAction = async (
    action: () => Promise<{ success: boolean; message?: string }>,
    successMsg: string
  ) => {
    setSubmitting(true)
    try {
      const res = await action()
      if (res.success) {
        toast.success(t(successMsg))
        onChanged()
      } else {
        toast.error(res.message || t('Action failed'))
      }
    } catch {
      toast.error(t('Action failed'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = () => {
    if (!ticket) return
    if (!reply.trim()) {
      toast.error(t('Message cannot be empty'))
      return
    }
    void doAction(
      () => adminReplySupportTicket(ticket.id, reply.trim()),
      'Reply sent'
    ).then(() => setReply(''))
  }

  return (
    <Dialog open={!!ticket} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[80vh] flex-col gap-0 sm:max-w-2xl'>
        <DialogHeader className='shrink-0 pb-3'>
          <DialogTitle className='flex flex-wrap items-center gap-2 pr-8'>
            <span className='min-w-0 flex-1 truncate'>
              {detail?.ticket.subject ?? ticket?.subject}
            </span>
            <Badge
              variant={getTicketStatusBadgeVariant(status)}
              className='shrink-0'
            >
              {getTicketStatusLabel(status)}
            </Badge>
          </DialogTitle>
          <DialogDescription className='text-xs'>
            {ticket
              ? `#${ticket.id} · ${getTicketPriorityLabel(
                  detail?.ticket.priority ?? ticket.priority
                )} · ${t('User')} ${
                  detail?.user_name
                    ? `${detail.user_name}${
                        detail.user_email ? ` (${detail.user_email})` : ''
                      }`
                    : `#${detail?.ticket.user_id ?? ticket.user_id}`
                } · ${t('created')} ${formatTimestamp(
                  detail?.ticket.created_at ?? ticket.created_at
                )}`
              : ''}
          </DialogDescription>
        </DialogHeader>

        <div className='min-h-0 flex-1 space-y-3 overflow-y-auto px-1 py-3'>
          {isLoading && (
            <div className='py-8 text-center text-sm text-muted-foreground'>
              {t('Loading...')}
            </div>
          )}
          {!isLoading &&
            (detail?.messages ?? []).map((message) => (
              <div
                key={message.id}
                className={`flex ${message.is_admin ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    message.is_admin
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <div className='mb-1 flex items-center gap-2 text-xs opacity-70'>
                    <span>
                      {message.is_admin
                        ? t('Support team')
                        : t('User')}
                    </span>
                    <span>{formatTimestamp(message.created_at)}</span>
                  </div>
                  <p className='whitespace-pre-wrap break-words'>
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
        </div>

        <div className='shrink-0 space-y-2 border-t pt-3'>
          {!isClosed && (
            <>
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={t('Write a reply...')}
                rows={3}
              />
              <DialogFooter className='justify-between sm:justify-between'>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={submitting}
                    onClick={() =>
                      ticket &&
                      void doAction(
                        () =>
                          adminSetSupportTicketStatus(
                            ticket.id,
                            SUPPORT_TICKET_STATUS.CLOSED
                          ),
                        'Ticket closed'
                      )
                    }
                  >
                    {t('Close')}
                  </Button>
                  <Button
                    variant='destructive'
                    size='sm'
                    disabled={submitting}
                    onClick={() =>
                      ticket &&
                      void doAction(
                        () => adminDeleteSupportTicket(ticket.id),
                        'Ticket deleted'
                      )
                    }
                  >
                    {t('Delete')}
                  </Button>
                </div>
                <Button onClick={handleReply} disabled={submitting}>
                  {t('Send reply')}
                </Button>
              </DialogFooter>
            </>
          )}
          {isClosed && (
            <DialogFooter className='justify-between sm:justify-between'>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={submitting}
                  onClick={() =>
                    ticket &&
                    void doAction(
                      () =>
                        adminSetSupportTicketStatus(
                          ticket.id,
                          SUPPORT_TICKET_STATUS.OPEN
                        ),
                      'Ticket reopened'
                    )
                  }
                >
                  {t('Reopen')}
                </Button>
                <Button
                  variant='destructive'
                  size='sm'
                  disabled={submitting}
                  onClick={() =>
                    ticket &&
                    void doAction(
                      () => adminDeleteSupportTicket(ticket.id),
                      'Ticket deleted'
                    )
                  }
                >
                  {t('Delete')}
                </Button>
              </div>
              <span className='text-sm text-muted-foreground'>
                {t('This ticket is closed.')}
              </span>
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
