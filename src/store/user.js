import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserInfoAPI } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  // ========== 状态 ==========
  const token = ref('')          // 普通移动端用户token
  const adminToken = ref('')     // 管理员后台token【新增】
  const userInfo = ref({})

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const isAdminLogin = computed(() => !!adminToken.value) // 判断管理员是否登录【新增】

  // ========== 普通用户方法 ==========
  const setToken = (value) => {
    token.value = value
    localStorage.setItem('token', value)
  }

  const setUserInfo = (info) => {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  const getToken = () => token.value
  const getUserInfo = () => userInfo.value

  // ========== 管理员token方法【新增】 ==========
  const setAdminToken = (value) => {
    adminToken.value = value
    localStorage.setItem('adminToken', value)
  }

  const getAdminToken = () => adminToken.value

  // 清除用户信息（同时清空普通用户 + 管理员）
  const clearUser = () => {
    token.value = ''
    adminToken.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('userInfo')
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      const response = await getUserInfoAPI()
      setUserInfo(response.data)
      return response.data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      clearUser()
      throw error
    }
  }

  // 初始化：从localStorage读取缓存，刷新页面恢复登录状态【补充读取adminToken】
  const init = () => {
    token.value = localStorage.getItem('token') || ''
    adminToken.value = localStorage.getItem('adminToken') || '' //新增读取管理员token
    const savedInfo = localStorage.getItem('userInfo')
    if (savedInfo) {
      userInfo.value = JSON.parse(savedInfo)
    }
  }

  return {
    token,
    adminToken,        //对外暴露
    userInfo,
    isLoggedIn,
    isAdminLogin,      //对外暴露，路由守卫可以使用
    setToken,
    setAdminToken,     //对外暴露，后台登录页面调用
    getToken,
    getAdminToken,
    setUserInfo,
    getUserInfo,
    clearUser,
    fetchUserInfo,
    init
  }
})
