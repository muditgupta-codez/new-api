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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { createSupportTicket } from '../api'
import {
  SUPPORT_TICKET_CATEGORIES,
  SUPPORT_TICKET_PRIORITY,
} from '../constants'

interface CreateTicketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export function CreateTicketDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateTicketDialogProps) {
  const { t } = useTranslation()
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('general')
  const [priority, setPriority] = useState(String(SUPPORT_TICKET_PRIORITY.NORMAL))
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const reset = () => {
    setSubject('')
    setCategory('general')
    setPriority(String(SUPPORT_TICKET_PRIORITY.NORMAL))
    setContent('')
  }

  const handleSubmit = async () => {
    if (!subject.trim() || !content.trim()) {
      toast.error(t('Subject and message are required'))
      return
    }
    setSubmitting(true)
    try {
      const res = await createSupportTicket({
        subject: subject.trim(),
        category,
        priority: Number(priority),
        content: content.trim(),
      })
      if (res.success) {
        toast.success(t('Ticket created'))
        reset()
        onOpenChange(false)
        onCreated()
      } else {
        toast.error(res.message || t('Failed to create ticket'))
      }
    } catch {
      toast.error(t('Failed to create ticket'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{t('New support ticket')}</DialogTitle>
          <DialogDescription>
            {t('Describe your issue — our team will reply by email and in the app.')}
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          <div>
            <label className='mb-1.5 block text-sm font-medium'>
              {t('Subject')}
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('e.g. Cannot access GPT-5.6-Luna')}
              maxLength={255}
            />
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='mb-1.5 block text-sm font-medium'>
                {t('Category')}
              </label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v ?? 'general')}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectGroup>
                    {SUPPORT_TICKET_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {t(c.label)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='mb-1.5 block text-sm font-medium'>
                {t('Priority')}
              </label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v ?? String(SUPPORT_TICKET_PRIORITY.NORMAL))}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectGroup>
                    <SelectItem value='1'>{t('Low')}</SelectItem>
                    <SelectItem value='2'>{t('Normal')}</SelectItem>
                    <SelectItem value='3'>{t('High')}</SelectItem>
                    <SelectItem value='4'>{t('Urgent')}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className='mb-1.5 block text-sm font-medium'>
              {t('Message')}
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('What happened? Include steps to reproduce if possible.')}
              rows={6}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {t('Cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {t('Submit ticket')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
