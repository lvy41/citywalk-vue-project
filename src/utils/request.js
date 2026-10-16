import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'

// ✅ 注意：不要 import router，避免和 router/index.js 形成循环依赖
// 使用 window.location.href 跳转即可

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    const token = userStore.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 统一处理响应数据
    const { code, data, message } = response.data

    // ⚠️ 这里要跟后端统一：如果是 200 就保持，如果是 0 就改成 code === 0
    if (code === 200) {
      return { data }
    } else {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message || '请求失败'))
    }
  },
  (error) => {
    // 处理 HTTP 错误
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401: {
          // ✅ 使用块级作用域，避免 no-case-declarations 报错
          ElMessage.error('登录已过期，请重新登录')
          const userStore = useUserStore()
          // ✅ 确保 store 里有 logout 方法
          userStore.logout()
          // ✅ 不用 router，避免循环依赖
          window.location.href = '/login'
          break
        }
        case 403:
          ElMessage.error('没有权限访问该资源')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误，请稍后重试')
          break
        default:
          ElMessage.error(data?.message || '请求失败')
      }
    } else {
      ElMessage.error(error.message || '网络连接失败')
    }
    return Promise.reject(error)
  }
)

export default request