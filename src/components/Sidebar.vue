<template>
  <aside class="app-sidebar">
    <router-link to="/" class="sidebar-link" :class="{ active: route.name === 'home' }">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
      <span>首页</span>
    </router-link>
    <router-link to="/equipment" class="sidebar-link" :class="{ active: route.name === 'equipment' }">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 7h-9"></path>
        <path d="M14 17h9"></path>
        <path d="M17 21h-9"></path>
        <path d="M12 12h9"></path>
        <path d="M21 12v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"></path>
      </svg>
      <span>装备列表</span>
    </router-link>
    <router-link to="/cart" class="sidebar-link" :class="{ active: route.name === 'cart' }">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      <span>购物车</span>
    </router-link>
    <router-link to="/orders" class="sidebar-link" :class="{ active: route.name === 'orders' }">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 3h18v18H3z"></path>
        <path d="M3 9h18"></path>
        <path d="M9 3v18"></path>
      </svg>
      <span>我的订单</span>
    </router-link>
    <router-link to="/profile" class="sidebar-link" :class="{ active: route.name === 'profile' }">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      <span>个人中心</span>
    </router-link>

    <div v-if="userStore.isAdmin" class="sidebar-divider"></div>
    <div v-if="userStore.isAdmin" class="sidebar-title">管理中心</div>
    <router-link v-if="userStore.isAdmin" to="/admin/users" class="sidebar-link" :class="{ active: route.name === 'admin-users' }">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
        <line x1="20" y1="8" x2="20" y2="14"></line>
        <line x1="4" y1="8" x2="4" y2="14"></line>
      </svg>
      <span>用户管理</span>
    </router-link>
    <router-link v-if="userStore.isAdmin" to="/admin/equipment" class="sidebar-link" :class="{ active: route.name === 'admin-equipment' }">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
      </svg>
      <span>装备管理</span>
    </router-link>
    <router-link v-if="userStore.isAdmin" to="/admin/orders" class="sidebar-link" :class="{ active: route.name === 'admin-orders' }">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 3h18v18H3z"></path>
        <path d="M3 9h18"></path>
        <path d="M9 3v18"></path>
        <path d="M15 9h6"></path>
      </svg>
      <span>订单管理</span>
    </router-link>
  </aside>
</template>

<script setup lang="ts" name="Sidebar">
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
// 导航栏路由
const route = useRoute()
// 用户状态管理
const userStore = useUserStore()
</script>

<style scoped>
.app-sidebar {
  width: 200px;
  background: white;
  padding: 16px 0;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: #64748b;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.sidebar-link:hover {
  background: #f1f5f9;
  color: #334155;
}

.sidebar-link.active {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-left-color: #667eea;
}

.sidebar-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 12px 20px;
}

.sidebar-title {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  padding: 8px 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>