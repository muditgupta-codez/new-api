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
import { Textarea } from '@/components/ui/textarea'
import { formatTimestamp } from '@/lib/format'

import {
  closeSupportTicket,
  getMySupportTicket,
  replySupportTicket,
} from '../api'
import {
  getTicketPriorityLabel,
  getTicketStatusBadgeVariant,
  getTicketStatusLabel,
} from '../constants'
import type { SupportTicket } from '../types'

interface TicketThreadDialogProps {
  ticket: SupportTicket | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onChanged: () => void
}

export function TicketThreadDialog({
  ticket,
  open,
  onOpenChange,
  onChanged,
}: TicketThreadDialogProps) {
  const { t } = useTranslation()
  const [reply, setReply] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['support', 'ticket', ticket?.id],
    queryFn: () => getMySupportTicket(ticket!.id),
    enabled: open && !!ticket,
  })

  const detail = data?.data
  const status = detail?.ticket.status ?? ticket?.status ?? 0
  const isClosed = status === 3

  const handleReply = async () => {
    if (!ticket) return
    if (!reply.trim()) {
      toast.error(t('Message cannot be empty'))
      return
    }
    setSubmitting(true)
    try {
      const res = await replySupportTicket(ticket.id, reply.trim())
      if (res.success) {
        toast.success(t('Reply sent'))
        setReply('')
        onChanged()
      } else {
        toast.error(res.message || t('Failed to send reply'))
      }
    } catch {
      toast.error(t('Failed to send reply'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = async () => {
    if (!ticket) return
    setSubmitting(true)
    try {
      const res = await closeSupportTicket(ticket.id)
      if (res.success) {
        toast.success(t('Ticket closed'))
        onChanged()
      } else {
        toast.error(res.message || t('Failed to close ticket'))
      }
    } catch {
      toast.error(t('Failed to close ticket'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                )} · ${t('created')} ${formatTimestamp(
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
                      ? 'bg-muted text-foreground'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  <div className='mb-1 flex items-center gap-2 text-xs opacity-70'>
                    <span>
                      {message.is_admin
                        ? t('Support team')
                        : t('You')}
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

        {!isClosed && (
          <div className='shrink-0 space-y-2 border-t pt-3'>
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={t('Write a reply...')}
              rows={3}
            />
            <DialogFooter className='justify-between sm:justify-between'>
              <Button
                variant='outline'
                onClick={handleClose}
                disabled={submitting}
              >
                {t('Close ticket')}
              </Button>
              <Button onClick={handleReply} disabled={submitting}>
                {t('Send reply')}
              </Button>
            </DialogFooter>
          </div>
        )}
        {isClosed && (
          <div className='shrink-0 border-t pt-3 text-center text-sm text-muted-foreground'>
            {t('This ticket is closed.')}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
