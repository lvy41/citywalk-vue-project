<template>
  <div class="login-page">
    <!-- 背景层 -->
    <div class="bg-layer"></div>

    <!-- 内容层 -->
    <div class="content-layer">
      <!-- 顶部标题 -->
      <div class="header">
        <h1 class="title">CityWalk 城市漫步</h1>
        <p class="slogan">发现城市小众路线</p>
      </div>
      <!-- 表单区域 -->
      <div class="form-container">
        <!-- Tab 切换 -->
        <div class="tabs">
          <span
            class="tab-item"
            :class="{ active: activeTab === 'login' }"
            @click="switchTab('login')"
          >登录</span>
          <span
            class="tab-item"
            :class="{ active: activeTab === 'register' }"
            @click="switchTab('register')"
          >注册</span>
        </div>
        <!-- 登录表单 -->
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="form">
          <div class="input-group">
            <input
              v-model="loginForm.username"
              type="text"
              placeholder="请输入用户名"
              class="input"
            >
          </div>
          <div class="input-group">
            <input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              class="input"
            >
          </div>
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>
        <!-- 注册表单 -->
        <form v-else @submit.prevent="handleRegister" class="form">
          <div class="input-group">
            <input
              v-model="registerForm.username"
              type="text"
              placeholder="请输入用户名"
              class="input"
            >
          </div>
          <div class="input-group">
            <input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码（至少6位）"
              class="input"
            >
          </div>
          <div class="input-group">
            <input
              v-model="registerForm.phone"
              type="tel"
              placeholder="请输入手机号"
              class="input"
            >
          </div>
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </form>
        <!-- 协议和权限提示 -->
        <div class="agreement-section">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="agree"
              class="checkbox"
            >
            <span>已阅读并同意 <a @click="showAgreement">《隐私协议》</a></span>
          </label>
          <p class="location-tip">
            <span class="warning-icon">⚠️</span>
            需要使用定位权限用于打卡和路线推荐
          </p>
        </div>
      </div>
      <!-- 底部版本信息 -->
      <div class="footer">
        <p class="version">v1.0.0</p>
        <p class="copyright">© 2026 CityWalk 团队</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
// ✅修改为@别名
import { useUserStore } from '@/store/user'
import { loginAPI, registerAPI } from '@/api/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

// 状态管理
const activeTab = ref('login')
const loading = ref(false)
const agree = ref(false)

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
})
const registerForm = reactive({
  username: '',
  password: '',
  phone: ''
})

// 切换 Tab
const switchTab = (tab) => {
  activeTab.value = tab
  // 清空表单
  loginForm.username = ''
  loginForm.password = ''
  registerForm.username = ''
  registerForm.password = ''
  registerForm.phone = ''
}

// 显示隐私协议
const showAgreement = () => {
  ElMessage.info('正在打开隐私协议页面...')
}

// 登录处理
const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  if (!agree.value) {
    ElMessage.warning('请先勾选同意隐私协议')
    return
  }
  loading.value = true
  try {
    const response = await loginAPI({
      username: loginForm.username,
      password: loginForm.password
    })
    const { token, userInfo } = response.data
    userStore.setToken(token)
    userStore.setUserInfo(userInfo)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    // ✅兼容后端未启动时error.response为undefined的情况
    const msg = error?.response?.data?.message || error?.message || '登录失败'
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}

// 注册处理
const handleRegister = async () => {
  if (!registerForm.username || !registerForm.password || !registerForm.phone) {
    ElMessage.warning('请填写完整的注册信息')
    return
  }
  if (registerForm.password.length < 6) {
    ElMessage.warning('密码长度至少6位')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  if (!agree.value) {
    ElMessage.warning('请先勾选同意隐私协议')
    return
  }
  loading.value = true
  try {
    const response = await registerAPI({
      username: registerForm.username,
      password: registerForm.password,
      phone: registerForm.phone
    })
    const { token, userInfo } = response.data
    userStore.setToken(token)
    userStore.setUserInfo(userInfo)
    ElMessage.success('注册成功')
    router.push('/')
  } catch (error) {
    const msg = error?.response?.data?.message || error?.message || '注册失败'
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}
/* 背景层：增加纯色兜底，没有图片也不会白屏 */
.bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* 如果后续有图片再解开下面这一行 */
  /* background: url('@/assets/images/citywalk-bg.png') no-repeat center center/cover; */
  background-color: #3671b9;
  filter: brightness(0.7);
  z-index: 0;
}
/* 内容层 */
.content-layer {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 40px 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #fff;
}
/* 标题样式 */
.header {
  text-align: center;
  margin-bottom: 30px;
}
.title {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 2px;
  margin-bottom: 8px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
.slogan {
  font-size: 16px;
  opacity: 0.9;
  letter-spacing: 1px;
}
/* 表单区域 */
.form-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
}
/* Tab 样式 */
.tabs {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}
.tab-item {
  cursor: pointer;
  font-size: 16px;
  padding: 5px 0;
  width: 80px;
  text-align: center;
  color: #999;
  transition: color 0.3s;
}
.tab-item.active {
  color: #007bff;
  border-bottom: 2px solid #007bff;
  font-weight: 500;
}
/* 表单样式 */
.form {
  margin-top: 10px;
}
.input-group {
  margin-bottom: 15px;
}
.input {
  width: 100%;
  height: 42px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
  box-sizing: border-box;
}
.input:focus {
  border-color: #007bff;
}
.submit-btn {
  width: 100%;
  height: 44px;
  background: #007bff;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: opacity 0.3s;
  margin-top: 10px;
}
.submit-btn:hover {
  opacity: 0.9;
}
.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
/* 协议区 */
.agreement-section {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}
.checkbox-label {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  margin-bottom: 8px;
}
.checkbox {
  margin-right: 6px;
  cursor: pointer;
}
.checkbox-label a {
  color: #007bff;
  text-decoration: none;
}
.checkbox-label a:hover {
  text-decoration: underline;
}
.location-tip {
  font-size: 12px;
  color: #999;
  background: #f5f5f5;
  padding: 8px 10px;
  border-radius: 6px;
  margin-top: 8px;
}
.warning-icon {
  margin-right: 4px;
}
/* 底部 */
.footer {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}
.version {
  margin-bottom: 4px;
}
.copyright {
  opacity: 0.7;
}
/* 响应式调整 */
@media (max-width: 400px) {
  .content-layer {
    padding: 20px 20px;
  }

  .title {
    font-size: 24px;
  }

  .slogan {
    font-size: 14px;
  }
}
</style>
