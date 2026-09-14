import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'
import type { User } from '@/types/index'

// 用户状态管理
export const useUserStore = defineStore('user', () => {
  // 用户信息
  // 存储用户信息
  const userInfo = ref<User | null>(null)
  // 存储用户token
  // 存储用户token
  const token = ref<string | null>(null)
  // 登录状态
  // 计算用户是否登录 ，根据token是否存在
  const isLoggedIn = computed(() => !!token.value)
  // 计算用户是否是管理员
  const isAdmin = computed(() => userInfo.value?.is_staff === true)
  // 登录函数
  // 登录用户，将token和用户信息存储到本地存储
  function login(data: { access_token: string; refresh_token: string; user: User }) {
    token.value = data.access_token
    userInfo.value = data.user
    storage.set('access_token', data.access_token)
    // 登陆成功将 refresh_token 存储到本地存储
    storage.set('refresh_token', data.refresh_token )
    // 登陆成功将用户信息存储到本地存储
    storage.set('user', data.user)
  }
  // 退出登录函数
  // 退出登录用户，将token和用户信息从本地存储中移除
  function logout() {
    token.value = null
    userInfo.value = null
    storage.remove('access_token')
    // 退出登录后，将 refresh_token 从本地存储中移除
    storage.remove('refresh_token')
    storage.remove('user')
  }
  // 初始化用户状态
  // 从本地存储中获取用户token和用户信息，初始化用户状态
  function initUser() {
    token.value = storage.get('access_token')
    userInfo.value = storage.get('user')
  }
  // 返回用户状态管理对象
  return { userInfo, token, isLoggedIn, isAdmin, login, logout, initUser }
})