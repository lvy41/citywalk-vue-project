import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'
const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  // ========== 移动端H5路由 ==========
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
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
  // ========== 管理员后台路由【全部启用】 ==========
  {
    path: '/adminlogin',
    name: 'AdminLogin',
    component: () => import('@/views-admin/AdminLogin.vue'),
    meta: { public: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views-admin/Dashboard.vue'),
    meta: { adminAuth: true }
  },
  {
    path: '/routeManage',
    name: 'RouteManage',
    component: () => import('@/views-admin/RouteManage.vue'),
    meta: { adminAuth: true }
  },
  {
    path: '/userManage',
    name: 'UserManage',
    component: () => import('@/views-admin/UserManage.vue'),
    meta: { adminAuth: true }
  },
  {
    path: '/commentManage',
    name: 'CommentManage',
    component: () => import('@/views-admin/CommentManage.vue'),
    meta: { adminAuth: true }
  },
  {
    path: '/tagManage',
    name: 'TagManage',
    component: () => import('@/views-admin/TagManage.vue'),
    meta: { adminAuth: true }
  },
  // 404兜底路由
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  },
  {
  path: '/privacy',
  name: 'Privacy',
  component: () => import('@/views/PrivacyAgreement.vue'),
  meta:{public:true}
}
]
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  userStore.init()

  if (to.meta.adminAuth) {
    if (!userStore.adminToken) {
      next({ path: '/adminlogin' })
    } else {
      next()
    }
  } else if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
