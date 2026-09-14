<template>
  <header class="app-header">
    <div class="header-left">
      <router-link to="/" class="logo">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
        <span>露营装备租赁</span>
      </router-link>
    </div>
    <div class="header-center">
      <div class="search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="M21 21l-4.35-4.35"></path>
        </svg>
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索装备..." 
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button class="search-btn" @click="handleSearch">搜索</button>
      </div>
    </div>
    <div class="header-right">
      <template v-if="isLoggedIn">
        <span class="user-info">{{ userStore.userInfo?.username }}</span>
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </template>
      <template v-else>
        <router-link to="/login" class="login-link">登录</router-link>
        <router-link to="/register" class="register-link">注册</router-link>
      </template>
    </div>
  </header>
</template>

<script setup lang="ts" name="Header">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
// 导航栏组件
const router = useRouter()
const userStore = useUserStore()
const searchKeyword = ref('')
// 是否登录
const isLoggedIn = computed(() => userStore.isLoggedIn)
// 退出登录
function handleLogout() {
  userStore.logout()
  router.push('/login')
}
// 搜索装备
function handleSearch() {
  if (searchKeyword.value.trim()) {
    router.push(`/equipment?keyword=${encodeURIComponent(searchKeyword.value.trim())}`)
  } else {
    router.push('/equipment')
  }
}
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.header-left {
  flex-shrink: 0;
}

.header-left .logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #667eea;
  font-size: 18px;
  font-weight: 700;
}

.header-center {
  flex: 1;
  max-width: 500px;
  margin: 0 40px;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}

.search-box svg {
  color: #94a3b8;
  margin-right: 12px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #334155;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-btn {
  padding: 6px 16px;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-left: 8px;
}

.search-btn:hover {
  background: #5a6fd6;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.user-info {
  font-size: 14px;
  color: #334155;
}

.login-link,
.register-link {
  font-size: 14px;
  text-decoration: none;
  padding: 6px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.login-link {
  color: #667eea;
}

.login-link:hover {
  background: rgba(102, 126, 234, 0.1);
}

.register-link {
  background: #667eea;
  color: white;
}

.register-link:hover {
  background: #5a6fd6;
}

.logout-btn {
  padding: 6px 16px;
  border: none;
  background: #ef4444;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.logout-btn:hover {
  background: #dc2626;
}
</style>