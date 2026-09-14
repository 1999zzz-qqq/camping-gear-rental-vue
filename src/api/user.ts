import request from '@/utils/request'
import type { User } from '@/types'

export function getUserInfo() {
  return request.get<User>('/users/profile/') as unknown as Promise<User>
}

export function updateUserInfo(data: {
  phone?: string
  email?: string
}) {
  return request.put('/users/profile/', data)
}

export function changePassword(data: {
  old_password: string
  new_password: string
  confirm_password: string
}) {
  return request.post('/users/change-password/', data)
}