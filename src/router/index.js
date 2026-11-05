import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
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
    meta: { requiresAuth: false }
  },
  {
    path: '/map',
    name: 'Map',
    component: () => import('@/views/Map.vue'),
    meta: { title: "探索地图", requiresAuth: true }
  },
  {
    path: '/publish',
    name: 'Publish',
    component: () => import('@/views/Publish.vue'),
    meta: { requiresAuth: false }
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
  // ✅详情页修改为 requiresAuth: false，调试点击卡片不会跳登录
  {
    path: '/detail/:id',
    name: 'Detail',
    component: () => import('@/views/Detail.vue'),
    meta: { requiresAuth: false }
  },
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
  // ============新增：城市管理后台路由============
  {
    path: '/cityManage',
    name: 'CityManage',
    component: () => import('@/views-admin/CityManage.vue'),
    meta: { adminAuth: true }
  },
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
// 同步守卫，Router4 标准return写法，无next、无async
router.beforeEach((to) => {
  const userStore = useUserStore()
  // 每次路由切换先读取本地存储
  userStore.init()
  if (to.meta.adminAuth) {
    if (!userStore.adminToken) {
      return '/adminlogin'
    }
  } else if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      return {
        path: '/login',
        query: { redirect: to.fullPath }
      }
    }
  }
  return true
})
export default router
