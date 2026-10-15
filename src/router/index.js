import { createRouter, createWebHistory } from 'vue-router'
// 注意：useUserStore只做导入，不要在这里调用！！
import { useUserStore } from '@/store/user'
const routes = [
  {
    path: '/',
    redirect: '/home' // 恢复原来的根路径重定向
  },
  // ========== 移动端H5路由 【原有全部保留】 ==========
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

  // ========== 管理员后台路由【新增】 ==========
  {
    path: '/adminlogin',
    name: 'AdminLogin',
    component: () => import('@/views‑admin/AdminLogin.vue'),
    meta: { public: true } //后台登录公开，无需token
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views‑admin/Dashboard.vue'),
    meta: { adminAuth: true } // 需要管理员token
  },
  {
    path: '/routeManage',
    name: 'RouteManage',
    component: () => import('@/views‑admin/RouteManage.vue'),
    meta: { adminAuth: true }
  },
  {
    path: '/userManage',
    name: 'UserManage',
    component: () => import('@/views‑admin/UserManage.vue'),
    meta: { adminAuth: true }
  },
  {
    path: '/commentManage',
    name: 'CommentManage',
    component: () => import('@/views‑admin/CommentManage.vue'),
    meta: { adminAuth: true }
  },
  {
    path: '/tagManage',
    name: 'TagManage',
    component: () => import('@/views‑admin/TagManage.vue'),
    meta: { adminAuth: true }
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
// ==========全局路由守卫【改造，同时处理普通用户、管理员两种权限】==========
router.beforeEach((to, from, next) => {
  // ✅重点！！useUserStore必须写在守卫回调函数内部！！
  const userStore = useUserStore()
  // 从localStorage读取token，刷新页面恢复登录状态，调用pinia里面的init方法
  userStore.init()

  //👉访问后台管理页面，校验管理员token
  if (to.meta.adminAuth) {
    if (!userStore.adminToken) {
      //没有管理员令牌，跳后台登录页
      next({ path: '/adminlogin' })
    } else {
      next()
    }
  }
  //👉普通移动端页面，校验普通用户token
  else if (to.meta.requiresAuth) {
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
  }
  //👉公开页面 login / adminlogin，直接放行
  else {
    next()
  }
})
export default router
