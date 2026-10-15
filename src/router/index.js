import { createRouter, createWebHistory } from 'vue-router'
// 注意：useUserStore只做导入，不要在这里调用！！
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/',
    redirect: '/home' // 恢复原来的根路径重定向
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { public: true } // 标记公开页面，不需要登录
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true } // 需要登录
  },
  {
    path: '/map',
    name: 'Map',
    component: () => import('@/views/Map.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/publish',
    name: 'Publish',
    component: () => import('@/views/Publish.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/record',
    name: 'Record',
    component: () => import('@/views/Record.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my',
    name: 'My',
    component: () => import('@/views/My.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: () => import('@/views/Detail.vue'),
    meta: { requiresAuth: true }
  },
  // 404兜底路由
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ==========全局路由守卫==========
router.beforeEach((to, from, next) => {
  // ✅重点！！useUserStore必须写在守卫回调函数内部！！
  const userStore = useUserStore()
  // 从localStorage读取token，刷新页面恢复登录状态，调用pinia里面的init方法
  userStore.init()

  // 判断页面是否需要登录
  if (to.meta.requiresAuth) {
    // 需要登录的页面，判断是否已经登录
    if (!userStore.isLoggedIn) {
      // 未登录，跳转到登录，记录要跳转的页面，登录成功后跳回去
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    // public公开页面，直接放行（login页面）
    next()
  }
})

export default router
