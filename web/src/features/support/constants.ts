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
export const SUPPORT_TICKET_STATUS = {
  OPEN: 1,
  REPLIED: 2,
  CLOSED: 3,
} as const

export const SUPPORT_TICKET_PRIORITY = {
  LOW: 1,
  NORMAL: 2,
  HIGH: 3,
  URGENT: 4,
} as const

export const SUPPORT_TICKET_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'billing', label: 'Billing & payments' },
  { value: 'api', label: 'API & keys' },
  { value: 'models', label: 'Models & access' },
  { value: 'account', label: 'Account' },
  { value: 'other', label: 'Other' },
] as const

export function getTicketStatusLabel(status: number): string {
  switch (status) {
    case SUPPORT_TICKET_STATUS.OPEN:
      return 'Open'
    case SUPPORT_TICKET_STATUS.REPLIED:
      return 'Awaiting your reply'
    case SUPPORT_TICKET_STATUS.CLOSED:
      return 'Closed'
    default:
      return 'Unknown'
  }
}

export function getTicketStatusBadgeVariant(
  status: number
): 'default' | 'warning' | 'secondary' | 'outline' {
  switch (status) {
    case SUPPORT_TICKET_STATUS.OPEN:
      return 'warning'
    case SUPPORT_TICKET_STATUS.REPLIED:
      return 'default'
    case SUPPORT_TICKET_STATUS.CLOSED:
      return 'outline'
    default:
      return 'secondary'
  }
}

export function getTicketPriorityLabel(priority: number): string {
  switch (priority) {
    case SUPPORT_TICKET_PRIORITY.LOW:
      return 'Low'
    case SUPPORT_TICKET_PRIORITY.NORMAL:
      return 'Normal'
    case SUPPORT_TICKET_PRIORITY.HIGH:
      return 'High'
    case SUPPORT_TICKET_PRIORITY.URGENT:
      return 'Urgent'
    default:
      return 'Normal'
  }
}

export function getTicketCategoryLabel(category: string): string {
  return (
    SUPPORT_TICKET_CATEGORIES.find((c) => c.value === category)?.label ?? category
  )
}
