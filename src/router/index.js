import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

// 👇 引入后台的全局布局外壳
import Layout from '@/views-admin/Layout.vue'

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
  // ==========个人中心子页面路由==========
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
  {
    path: '/clear-cache',
    name: 'ClearCache',
    component: () => import('@/views/ClearCache.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/change-pwd',
    name: 'ChangePwd',
    component: () => import('@/views/ChangePwd.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/edit-user',
    name: 'EditUser',
    component: () => import('@/views/EditUserInfo.vue'),
    meta: { requiresAuth: true }
  },
  // 路线详情：不需要登录即可访问
  {
    path: '/detail/:id',
    name: 'Detail',
    component: () => import('@/views/Detail.vue'),
    meta: { requiresAuth: false }
  },

  // ============后台管理路由============
  // 1. 管理员登录页（独立页面，不套外壳）
  {
    path: '/adminlogin',
    name: 'AdminLogin',
    component: () => import('@/views-admin/AdminLogin.vue'),
    meta: { public: true }
  },
  
  // 2. 后台管理主框架（所有后台页面都套在这个 Layout 里）
  {
    path: '/admin',
    component: Layout,
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views-admin/Dashboard.vue'),
        meta: { adminAuth: true, title: '仪表盘' }
      },
      {
        path: 'user',
        name: 'UserManage',
        component: () => import('@/views-admin/UserManage.vue'),
        meta: { adminAuth: true, title: '用户管理' }
      },
      {
        path: 'route',
        name: 'RouteManage',
        component: () => import('@/views-admin/RouteManage.vue'),
        meta: { adminAuth: true, title: '路线管理' }
      },
      {
        path: 'comment',
        name: 'CommentManage',
        component: () => import('@/views-admin/CommentManage.vue'),
        meta: { adminAuth: true, title: '评论管理' }
      },
      // 如果你还有其它后台页面，继续往里加
      {
        path: 'tag',
        name: 'TagManage',
        component: () => import('@/views-admin/TagManage.vue'),
        meta: { adminAuth: true, title: '标签管理' }
      },
      {
        path: 'city',
        name: 'CityManage',
        component: () => import('@/views-admin/CityManage.vue'),
        meta: { adminAuth: true, title: '城市管理' }
      }
    ]
  },

  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('@/views/PrivacyAgreement.vue'),
    meta: { public: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const userStore = useUserStore()
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