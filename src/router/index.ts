import { createRouter, createWebHistory } from 'vue-router'
import { storage } from '@/utils/storage'
// 定义路由元数据
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresAdmin?: boolean
  }
}
// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue')
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/equipment',
      name: 'equipment',
      component: () => import('@/views/EquipmentList.vue')
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/Cart.vue')
    },
    {
      path: '/orders/create',
      name: 'create-order',
      component: () => import('@/views/CreateOrder.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/equipment/:id',
      name: 'equipment-detail',
      component: () => import('@/views/EquipmentDetail.vue')
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/views/OrdersList.vue')
    },
    {
      path: '/orders/:id',
      name: 'order-detail',
      component: () => import('@/views/OrderDetail.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/Profile.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('@/views/admin/AdminUsers.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      path: '/admin/equipment',
      name: 'admin-equipment',
      component: () => import('@/views/admin/AdminEquipment.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      path: '/admin/orders',
      name: 'admin-orders',
      component: () => import('@/views/admin/AdminOrders.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    }
  ]
})
router.beforeEach((to, from) => {
  const requiresAuth = to.meta.requiresAuth || to.meta.requiresAdmin
  const token = storage.get('access_token')
  if (requiresAuth && !token) {
    return '/login'
  } else if (to.path === '/login' && token) {
    return '/'
  }
})

export default router
