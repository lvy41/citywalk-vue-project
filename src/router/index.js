import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path:'/',
    redirect:'/home'
  },
  {
    path:'/login',
    name:'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path:'/home',
    name:'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path:'/map',
    name:'Map',
    component: () => import('@/views/Map.vue')
  },
  {
    path:'/publish',
    name:'Publish',
    component: () => import('@/views/Publish.vue')
  },
  {
    path:'/record',
    name:'Record',
    component: () => import('@/views/Record.vue')
  },
  {
    path:'/my',
    name:'My',
    component: () => import('@/views/My.vue')
  },
  {
    path:'/detail/:id',
    name:'Detail',
    component: () => import('@/views/Detail.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
