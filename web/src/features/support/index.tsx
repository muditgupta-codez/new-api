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
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { SectionPageLayout } from '@/components/layout'
import { useDialogState } from '@/hooks/use-dialog'

import { CreateTicketDialog } from './components/create-ticket-dialog'
import { TicketThreadDialog } from './components/ticket-thread-dialog'
import { UserTicketList } from './components/user-ticket-list'
import type { SupportTicket } from './types'

export function SupportPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useDialogState<boolean>(false)
  const [selected, setSelected] = useDialogState<SupportTicket | null>(null)

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['support'] })
  }

  return (
    <SectionPageLayout fixedContent>
      <SectionPageLayout.Title>{t('Support')}</SectionPageLayout.Title>
      <SectionPageLayout.Actions>
        <Button onClick={() => setCreateOpen(true)}>
          {t('New ticket')}
        </Button>
      </SectionPageLayout.Actions>
      <SectionPageLayout.Content>
        <UserTicketList onSelect={(ticket) => setSelected(ticket)} />
      </SectionPageLayout.Content>

      <CreateTicketDialog
        open={createOpen ?? false}
        onOpenChange={(open) => setCreateOpen(open ? true : null)}
        onCreated={refresh}
      />
      <TicketThreadDialog
        ticket={selected}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onChanged={refresh}
      />
    </SectionPageLayout>
  )
}
