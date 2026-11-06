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
  // ==========你新增的个人页面路由==========
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
    path: '/my-follow',
    name: 'MyFollow',
    component: () => import('@/views/MyFollow.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/recycle-route',
    name: 'RecycleRoute',
    component: () => import('@/views/RecycleRoute.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/shop',
    name: 'Shop',
    component: () => import('@/views/Shop.vue'),
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
    path: '/title-list',
    name: 'TitleList',
    component: () => import('@/views/TitleList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/edit-user',
    name: 'EditUser',
    component: () => import('@/views/EditUserInfo.vue'),
    meta: { requiresAuth: true }
  },
  // ✅详情页（组长设置不需要登录）
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
  // 组长新增：城市管理后台路由
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
