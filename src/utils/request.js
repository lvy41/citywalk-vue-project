import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'

// 后台接口判定（/admin/* + 标签/城市的增删改）
const isAdminRequest = (url = '') =>
  url.includes('/admin/')
  || url.startsWith('/tag/add') || url.startsWith('/tag/update') || url.startsWith('/tag/delete')
  || url.startsWith('/city/add') || url.startsWith('/city/update') || url.startsWith('/city/delete')

// 管理员登录失效：清掉可能残留的旧 token（例如老版本写的 admin-token-1），回后台登录页
function handleAdminExpired(msg) {
  const hadToken = localStorage.getItem('adminToken')
  localStorage.removeItem('adminToken')
  if (hadToken) {
    ElMessage.error(msg || '管理员登录已过期，请重新登录')
  }
  if (!window.location.pathname.startsWith('/adminlogin')) {
    window.location.href = '/adminlogin'
  }
}

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
    // 标签/城市管理的增删改由后台发起，同样要走管理员 Token
    const url = config.url || ''
    const isAdminApi = url.startsWith('/admin/')
      || url.startsWith('/tag/add') || url.startsWith('/tag/update') || url.startsWith('/tag/delete')
      || url.startsWith('/city/add') || url.startsWith('/city/update') || url.startsWith('/city/delete')
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
    const isSkipApi = skipUrls.some(path => url.split('?')[0] === path)

    // 后台接口一律带管理员 Token（/admin/login 除外）；公开接口（/route/list 等）不带 Token
    if (isAdminApi) {
      if (url !== '/admin/login' && token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } else if (!isSkipApi && token) {
      config.headers.Authorization = `Bearer ${token}`
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

    // 后台接口：正常返回交给页面取 .data；401 说明管理员登录已失效，清掉旧 token 引导重新登录
    const reqUrl = response.config.url || ''
    if (isAdminRequest(reqUrl)) {
      if (code === 200 || code === 0) {
        return resBody
      }
      if (code === 401 || code === 403) {
        handleAdminExpired(text || '管理员权限校验失败，请重新登录后台')
        return { code, msg: text, data: [] }
      }
      console.warn('后台接口报错:', text)
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
      const reqUrl = error.config?.url || ''
      // 后台接口 401/403：管理员 token 失效、旧版无 role 的 token、或不是管理员账号，清掉并要求重新登录后台
      if (isAdminRequest(reqUrl) && (status === 401 || status === 403)) {
        handleAdminExpired(status === 403 ? '当前登录没有后台管理权限，请用管理员账号重新登录' : '未登录或登录已过期')
        return { code: status, msg: '未登录或无权访问', data: [] }
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
