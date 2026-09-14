import request from '@/utils/request'
import type { Order, OrderItem, Cart, CartItem } from '@/types'

export function getOrderList(params?: {
  status?: number
  page?: number
}) {
  return request.get('/orders/', { params }) as unknown as Promise<{
    count: number
    results: Order[]
  }>
}

export function getOrderDetail(id: number) {
  return request.get<Order>(`/orders/${id}/`) as unknown as Promise<Order>
}

export function createOrder(data: {
  create_order_items: { equipment_id: number; count: number; rental_days: number }[]
  start_time: string
  end_time: string
  contact_name: string
  contact_phone: string
}) {
  return request.post('/orders/', data)
}

export function payOrder(id: number, payment_method?: string) {
  return request.post(`/orders/${id}/pay/`, { payment_method: payment_method || 'alipay' })
}

export function cancelOrder(id: number) {
  return request.post(`/orders/${id}/cancel/`)
}

export function applyRefund(id: number, reason_type: string, custom_reason?: string) {
  return request.post(`/orders/${id}/refund/`, {
    refund_reason_type: reason_type,
    refund_reason_custom: custom_reason || ''
  })
}

export function applyReturn(id: number) {
  return request.post(`/orders/${id}/apply_return/`)
}

export function payOverdueDebt(id: number) {
  return request.post(`/orders/${id}/pay_overdue_debt/`)
}

export function getCart() {
  return request.get<Cart>('/orders/cart/') as unknown as Promise<Cart>
}

export function addToCart(data: { equipment_id: number; count: number; rental_days: number }) {
  return request.post<Cart>('/orders/cart/', data) as unknown as Promise<Cart>
}

export function updateCartItem(data: { item_id: number; count: number; rental_days: number }) {
  return request.put<Cart>('/orders/cart/', data) as unknown as Promise<Cart>
}

export function removeCartItem(item_id: number) {
  return request.delete<Cart>(`/orders/cart/remove/${item_id}/`) as unknown as Promise<Cart>
}

export function clearCart() {
  return request.post<Cart>('/orders/cart/clear/') as unknown as Promise<Cart>
}