import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './APP.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 引入图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 引入userStore
import { useUserStore } from '@/store/user'

// 高德 2.0 安全密钥必须在 JSAPI 首次加载前设置，否则地理编码/POI 检索等服务会被鉴权拒绝
window._AMapSecurityConfig = {
  securityJsCode: import.meta.env.VITE_AMAP_SECRET
}

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 全局注册element-plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 初始化用户缓存（读取localStorage恢复登录状态，和你的user.js配套）
const userStore = useUserStore()
userStore.init()

app.mount('#app')
