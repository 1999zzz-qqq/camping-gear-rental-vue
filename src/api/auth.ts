import request from '@/utils/request'  
import type { User } from '@/types/index'
import { storage } from '@/utils/storage'
// 登录接口
export const login = (data: { username: string, password: string, captcha_key?: string, captcha_code?: string }) => {
  return request.post<{ access: string; refresh: string }>('/users/login/', data) as unknown as Promise<{ access: string; refresh: string }>
}
// 注册接口
export const register = (data: { username: string, password: string, re_password: string, phone: string, email: string }) => {
  return request.post<User>('/users/register/', data) as unknown as Promise<User>
}
// 获取用户信息接口
export const getUserInfo = () => {
  return request.get<User>('/users/profile/') as unknown as Promise<User>
}
// 退出登录接口
export const logout = () => {
  return request.post('/users/logout/', {
    refresh: storage.get('refresh_token')
  })
}
// 刷新token接口
export const refreshToken = () => {
  return request.post<{ access: string; refresh: string }>('/token/refresh/') as unknown as Promise<{ access: string; refresh: string }>
}
