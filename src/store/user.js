import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserInfoAPI } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref('')
  const userInfo = ref({})

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)

  // 操作
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

  // 清除用户信息
  const clearUser = () => {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
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

  // 初始化
  const init = () => {
    token.value = localStorage.getItem('token') || ''
    const savedInfo = localStorage.getItem('userInfo')
    if (savedInfo) {
      userInfo.value = JSON.parse(savedInfo)
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    setToken,
    setUserInfo,
    getToken,
    getUserInfo,
    clearUser,
    fetchUserInfo,
    init
  }
})
