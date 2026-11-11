import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'

const request = axios.create({
  baseURL: 'http://127.0.0.1:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()

    // 后台接口才用管理员 Token，其余接口一律用普通用户 Token
    // （否则管理员登录后，普通用户接口会带上假的管理员 token，导致"请先登录"）
    const isAdminApi = (config.url || '').startsWith('/admin/')
    const token = isAdminApi
      ? (localStorage.getItem('adminToken') || userStore.token)
      : userStore.token

    // 登录注册接口不需要 Token
    const skipUrls = ['/user/login', '/user/register', '/admin/login']
    const isSkipApi = skipUrls.some(path => config.url.endsWith(path))
    
    if (!isSkipApi) {
      if (token) {
        config.headers.Authorization = `Bearer ${token}` 
      }
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
    const res = response.data
    
    // 👇 核心修改：针对后台接口的 401 报错，直接静默返回空数据，不弹窗、不踢人！
    if (response.config.url.includes('/admin/')) {
      if (res.code === 200 || res.code === 0) {
        return res.data
      } else {
        // 如果是后台接口报错，直接返回个空数组或者 null，让前端页面自己处理
        console.warn('后台接口报错，已静默处理:', res.message || res.msg)
        return [] 
      }
    }

    // 下面是给普通用户端用的校验逻辑
    if (res.code === 200 || res.code === 0) {
      return res.data 
    } else {
      ElMessage.error(res.message || res.msg || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      // 如果是后台接口的 401，也不踢人
      if (error.config.url.includes('/admin/') && status === 401) {
        return []
      }
      
      switch (status) {
        case 401: {
          ElMessage.error('登录已过期，请重新登录')
          const userStore = useUserStore()
          userStore.logout()
          localStorage.removeItem('adminToken')
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