<template>
  <template v-if="isAuthPage">
    <router-view />
  </template>
  <template v-else>
    <div class="app">
      <Header />
      <div class="app-content">
        <Sidebar />
        <main class="app-main">
          <router-view />
        </main>
      </div>
    </div>
  </template>
</template>
<script setup lang="ts" name="App">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import { storage } from '@/utils/storage'

const userStore = useUserStore()
// 获取当前路由和路由元数据
const route = useRoute()
// 检查是否有token
const token = storage.get('access_token')
//初始化用户信息
if (token) {
  userStore.initUser()
}
// 检查是否需要登录
const requiresAuth = computed(() => {
  return route.meta.requiresAuth
})
const isAuthPage = computed(() => {
  // 登录注册页
  return ['login', 'register'].includes(route.name as string)
})
</script>
<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fafc;
}

.app-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.app-main {
  flex: 1;
  overflow-y: auto;
}
</style>