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
    meta: { requiresAuth: true }
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
  // ==========新增4条路由开始==========
  {
    path: '/my-publish',
    name: 'MyPublish',
    component: () => import('@/views/MyPublish.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-like',
    name: 'MyLike',
    component: () => import('@/views/MyLike.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/message',
    name: 'Message',
    component: () => import('@/views/Message.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/setting',
    name: 'Setting',
    component: () => import('@/views/Setting.vue'),
    meta: { requiresAuth: true }
  },
  // ==========新增4条路由结束==========
  {
    path: '/detail/:id',
    name: 'Detail',
    component: () => import('@/views/Detail.vue'),
    meta: { requiresAuth: true }
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

// 路由守卫：合并后的版本（保留组长admin后台判断 + 你的public公开页面判断）
router.beforeEach((to) => {
  const userStore = useUserStore()
  userStore.init()

  // 公开页面直接放行
  if (to.meta.public) {
    return true
  }
  // 管理员页面校验
  if (to.meta.adminAuth) {
    if (!userStore.adminToken) {
      return '/adminlogin'
    }
  }
  // 普通用户登录校验
  if (to.meta.requiresAuth) {
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
