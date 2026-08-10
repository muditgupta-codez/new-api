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
import { api } from '@/lib/api'

import type {
  ApiResponse,
  CreateSupportTicketRequest,
  PaginatedResponse,
  ReplySupportTicketRequest,
  SupportTicket,
  SupportTicketDetail,
} from './types'

// ============================================================================
// User APIs
// ============================================================================

export async function createSupportTicket(
  payload: CreateSupportTicketRequest
): Promise<ApiResponse<SupportTicket>> {
  const res = await api.post('/api/support/tickets', payload)
  return res.data
}

export async function getMySupportTickets(
  params: { p?: number; size?: number } = {}
): Promise<PaginatedResponse<SupportTicket>> {
  const { p = 1, size = 20 } = params
  const res = await api.get(`/api/support/tickets?p=${p}&size=${size}`)
  return res.data
}

export async function getMySupportTicket(
  id: number
): Promise<ApiResponse<SupportTicketDetail>> {
  const res = await api.get(`/api/support/tickets/${id}`)
  return res.data
}

export async function replySupportTicket(
  id: number,
  content: string
): Promise<ApiResponse<unknown>> {
  const res = await api.post(`/api/support/tickets/${id}/reply`, {
    content,
  } satisfies ReplySupportTicketRequest)
  return res.data
}

export async function closeSupportTicket(
  id: number
): Promise<ApiResponse<unknown>> {
  const res = await api.post(`/api/support/tickets/${id}/close`)
  return res.data
}

// ============================================================================
// Admin APIs
// ============================================================================

export async function getAdminSupportTickets(
  params: { p?: number; size?: number; status?: number } = {}
): Promise<PaginatedResponse<SupportTicket>> {
  const { p = 1, size = 20, status } = params
  const query = new URLSearchParams({ p: String(p), size: String(size) })
  if (status) query.set('status', String(status))
  const res = await api.get(`/api/support/admin/tickets?${query.toString()}`)
  return res.data
}

export async function getAdminSupportTicket(
  id: number
): Promise<ApiResponse<SupportTicketDetail>> {
  const res = await api.get(`/api/support/admin/tickets/${id}`)
  return res.data
}

export async function adminReplySupportTicket(
  id: number,
  content: string
): Promise<ApiResponse<unknown>> {
  const res = await api.post(`/api/support/admin/tickets/${id}/reply`, {
    content,
  } satisfies ReplySupportTicketRequest)
  return res.data
}

export async function adminSetSupportTicketStatus(
  id: number,
  status: number
): Promise<ApiResponse<unknown>> {
  const res = await api.put(`/api/support/admin/tickets/${id}/status?status=${status}`)
  return res.data
}

export async function adminDeleteSupportTicket(
  id: number
): Promise<ApiResponse<unknown>> {
  const res = await api.delete(`/api/support/admin/tickets/${id}`)
  return res.data
}
