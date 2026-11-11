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
    // （否则管理员登录后，普通用户接口会带上管理员 token，导致"请先登录"）
    const isAdminApi = (config.url || '').startsWith('/admin/')
    const token = isAdminApi
      ? (localStorage.getItem('adminToken') || userStore.token)
      : userStore.token

    // 登录注册接口 + 公开浏览接口不需要 Token（后端 JwtInterceptor 白名单同步）
    const skipUrls = [
      '/user/login',
      '/user/register',
      '/admin/login',
      '/route/list',
      '/route/detail',
      '/map/points',
      '/map/nearRoute',
      '/map/routePath',
      '/tag/list',
      '/city/list',
      '/area/tree',
      '/area/provinceList',
      '/area/cityListByProvince',
      '/area/districtListByCity'
    ]
    const isSkipApi = skipUrls.some(path => (config.url || '').endsWith(path))

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

// 响应拦截器：统一返回完整响应体（{ code, msg/message, data }），由页面自己取 .data
request.interceptors.response.use(
  (response) => {
    const resBody = response.data
    const { code, data, msg, message } = resBody
    const text = msg || message

    // 后台接口报错不弹窗、不踢人，交给管理页按空数据处理
    if ((response.config.url || '').includes('/admin/')) {
      if (code === 200 || code === 0) {
        return resBody
      }
      console.warn('后台接口报错，已静默处理:', text)
      return { code, msg: text, data: [] }
    }

    if (code === 200 || code === 0) {
      return resBody
    }
    ElMessage.error(text || '请求失败')
    const err = new Error(text || '请求失败')
    err.bizMsg = text
    return Promise.reject(err)
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      // 后台接口 401 不踢人，返回空数据让管理页自己处理
      if ((error.config.url || '').includes('/admin/') && status === 401) {
        return { code: 401, msg: '未登录', data: [] }
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
          ElMessage.error(data?.msg || '请求失败')
      }
    } else {
      ElMessage.error(error.message || '网络连接失败')
    }
    return Promise.reject(error)
  }
)

export default request
