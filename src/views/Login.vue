<template>
  <div class="login-page">
    <!-- 背景层 -->
    <div class="bg-layer"></div>
    <div class="overlay"></div>

    <!-- 内容层 -->
    <div class="content-layer">
      <!-- 顶部品牌区 -->
      <div class="header">
        <div class="logo-badge">
          <span class="logo-icon">🚶</span>
        </div>
        <h1 class="title">CityWalk</h1>
        <p class="slogan">{{ currentSlogan }}</p>
      </div>

      <!-- 表单卡片 -->
      <div class="form-container">
        <!-- Tab 切换 -->
        <div class="tabs">
          <div
            class="tab-slider"
            :style="{ transform: activeTab === 'register' ? 'translateX(100%)' : 'translateX(0)' }"
          ></div>
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
            <span class="input-icon">👤</span>
            <input
              v-model="loginForm.username"
              type="text"
              placeholder="用户名"
              name="username"
              autocomplete="username"
              class="input"
            >
          </div>
          <div class="input-group">
            <span class="input-icon">🔒</span>
            <input
              v-model="loginForm.password"
              :type="showPwd ? 'text' : 'password'"
              placeholder="密码"
              name="password"
              autocomplete="current-password"
              class="input"
            >
            <span class="eye-icon" @click="showPwd = !showPwd">
              {{ showPwd ? '🙈' : '👁️' }}
            </span>
          </div>
          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="!loading" class="btn-text">登录</span>
            <span v-else class="btn-loading">
              <span class="spinner"></span> 登录中
            </span>
          </button>
        </form>

        <!-- 注册表单 -->
        <form v-else @submit.prevent="handleRegister" class="form">
          <div class="input-group">
            <span class="input-icon">👤</span>
            <input
              v-model="registerForm.username"
              type="text"
              placeholder="设置用户名"
              name="username"
              autocomplete="username"
              class="input"
            >
          </div>
          <div class="input-group">
            <span class="input-icon">🔒</span>
            <input
              v-model="registerForm.password"
              :type="showRegPwd ? 'text' : 'password'"
              placeholder="设置密码（至少6位）"
              name="new-password"
              autocomplete="new-password"
              class="input"
            >
            <span class="eye-icon" @click="showRegPwd = !showRegPwd">
              {{ showRegPwd ? '🙈' : '👁️' }}
            </span>
          </div>
          <div class="input-group">
            <span class="input-icon">📱</span>
            <input
              v-model="registerForm.phone"
              type="tel"
              placeholder="手机号"
              name="tel"
              maxlength="11"
              @input="registerForm.phone = registerForm.phone.replace(/\D/g, '')"
              class="input"
            >
          </div>
          <div class="input-group">
            <span class="input-icon">🛡️</span>
            <input
              v-model="registerForm.captcha"
              type="text"
              placeholder="验证码"
              maxlength="4"
              class="input captcha-input"
            >
            <div class="captcha-code" @click="refreshCaptcha" title="点击刷新">
              <span v-for="(ch, i) in captchaChars" :key="i" :style="{ transform: `rotate(${captchaRots[i]}deg)` }">{{ ch }}</span>
            </div>
          </div>
          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="!loading" class="btn-text">注册</span>
            <span v-else class="btn-loading">
              <span class="spinner"></span> 注册中
            </span>
          </button>
        </form>

        <!-- 协议区 -->
        <div class="agreement-section">
          <label class="checkbox-label" @click.prevent>
            <input
              type="checkbox"
              v-model="agree"
              class="checkbox"
              @click.stop
            >
            <span>已阅读并同意</span>
            <span class="agree-link" @click.stop="showAgreement">《隐私协议》</span>
          </label>
          <div class="location-tip">
            <span class="tip-icon">📍</span>
            <span>开启定位权限，为你推荐附近路线并支持打卡</span>
          </div>
        </div>
      </div>

      <!-- 底部 -->
      <div class="footer">
        <p>© 2026 CityWalk · 用脚步阅读城市</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { loginAPI, registerAPI } from '@/api/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('login')
const loading = ref(false)
const agree = ref(false)
const showPwd = ref(false)
const showRegPwd = ref(false)

// ========== 随机Slogan ==========
const slogans = [
  '穿梭街巷 · 发现城市小众惊喜',
  '每一步都是新的风景',
  '用脚步丈量城市的温度',
  '老街巷里藏着时光的秘密',
  '慢下来，遇见城市的另一面',
  '转角处，总有不期而遇的美好'
]
const currentSlogan = ref(slogans[0])
const randomSlogan = () => {
  currentSlogan.value = slogans[Math.floor(Math.random() * slogans.length)]
}

const loginForm = reactive({ username: '', password: '' })
const registerForm = reactive({ username: '', password: '', phone: '', captcha: '' })

// ========== 图形验证码 ==========
const captchaChars = ref([])
const captchaRots = ref([])
const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  captchaChars.value = []
  captchaRots.value = []
  for (let i = 0; i < 4; i++) {
    captchaChars.value.push(chars[Math.floor(Math.random() * chars.length)])
    captchaRots.value.push(Math.floor(Math.random() * 30) - 15)
  }
  registerForm.captcha = ''
}
const refreshCaptcha = () => generateCaptcha()
onMounted(() => {
  generateCaptcha()
  randomSlogan()
})

const switchTab = (tab) => {
  activeTab.value = tab
  loginForm.username = ''
  loginForm.password = ''
  registerForm.username = ''
  registerForm.password = ''
  registerForm.phone = ''
  registerForm.captcha = ''
  showPwd.value = false
  showRegPwd.value = false
  if (tab === 'register') generateCaptcha()
}

const showAgreement = () => {
  ElMessage.info('正在打开隐私协议页面...')
}

// ========== 登录 ==========
const handleLogin = async () => {
  if (loading.value) return // 防重复提交
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
    // 防御：拦截器已解构返回 { data }，这里再判断一次
    const resData = response?.data || response
    const { token, userInfo } = resData || {}
    if (!token) {
      ElMessage.error('登录响应异常，未获取到token')
      return
    }
    userStore.setToken(token)
    userStore.setUserInfo(userInfo || {})
    ElMessage.success('登录成功，开始漫步吧！')
    router.push('/home')
  } catch (error) {
    // 拦截器已统一弹错，这里只打日志
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

// ========== 注册 ==========
const handleRegister = async () => {
  if (loading.value) return
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
  if (!registerForm.captcha) {
    ElMessage.warning('请输入图形验证码')
    return
  }
  if (registerForm.captcha.toLowerCase() !== captchaChars.value.join('').toLowerCase()) {
    ElMessage.warning('验证码错误，请重新输入')
    refreshCaptcha()
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
    const resData = response?.data || response
    const { token, userInfo } = resData || {}
    if (!token) {
      ElMessage.error('注册响应异常，未获取到token')
      return
    }
    userStore.setToken(token)
    userStore.setUserInfo(userInfo || {})
    ElMessage.success('注册成功，欢迎加入城市漫步！')
    router.push('/home')
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 引入手写花体字体 */
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');

/* ========== 主题色变量 ========== */
.login-page {
  --primary: #e85d3a;
  --primary-light: #f2704a;
  --primary-lighter: #ff8c42;
  --primary-shadow: rgba(232, 93, 58, 0.35);

  position: relative;
  width: 100vw;
  min-height: 100vh;
  min-height: 100dvh;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

/* ========== 背景 ========== */
.bg-layer {
  position: absolute;
  inset: 0;
  background: url('https://aka.doubaocdn.com/s/Xct4qbWra2') no-repeat center center / cover;
  transform: scale(1.1);
  z-index: 0;
}
.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg,
    rgba(0, 0, 0, 0.35) 0%,
    rgba(0, 0, 0, 0.15) 40%,
    rgba(0, 0, 0, 0.3) 100%);
  z-index: 1;
}

/* ========== 内容层 ========== */
.content-layer {
  position: relative;
  z-index: 2;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 28px;
  padding-top: calc(20px + env(safe-area-inset-top));
  padding-bottom: calc(28px + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

/* ========== 顶部品牌区 ========== */
.header {
  text-align: center;
  margin-bottom: 30px;
}
.logo-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}
.logo-icon {
  font-size: 36px;
  animation: float 3s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* 手写花体标题 */
.title {
  font-family: 'Dancing Script', cursive;
  font-size: 56px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 10px 0;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
  line-height: 1.1;
}
.slogan {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 4px;
  margin: 0;
  font-style: italic;
  position: relative;
  display: inline-block;
  padding: 0 16px;
}
.slogan::before,
.slogan::after {
  content: '—';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.4);
  font-size: 10px;
}
.slogan::before { left: 0; }
.slogan::after { right: 0; }

/* ========== 表单卡片 ========== */
.form-container {
  background: rgba(255, 255, 255, 0.97);
  border-radius: 28px;
  padding: 26px 22px 26px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  color: #1a1a2e;
  box-sizing: border-box;
}

/* ========== Tab ========== */
.tabs {
  display: flex;
  position: relative;
  margin-bottom: 22px;
  background: #f5f6f8;
  border-radius: 14px;
  padding: 4px;
}
.tab-slider {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.tab-item {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  font-size: 15px;
  font-weight: 600;
  color: #999;
  cursor: pointer;
  position: relative;
  z-index: 1;
  transition: color 0.25s;
}
.tab-item.active {
  color: var(--primary);
}

/* ========== 输入框 ========== */
.form {
  display: flex;
  flex-direction: column;
  gap: 13px;
}
.input-group {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon {
  position: absolute;
  left: 16px;
  font-size: 16px;
  opacity: 0.4;
  filter: grayscale(0.5);
  pointer-events: none;
  z-index: 1;
}
.input {
  width: 100%;
  height: 48px;
  border: 1.5px solid #ececec;
  border-radius: 14px;
  padding: 0 16px 0 46px;
  font-size: 14px;
  outline: none;
  transition: all 0.25s;
  box-sizing: border-box;
  background: #f8f9fb;
  color: #1a1a2e;
}
.input::placeholder { color: #b0b0b0; }
.input:focus {
  border-color: var(--primary);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(232, 93, 58, 0.08);
}

/* 眼睛图标 */
.eye-icon {
  position: absolute;
  right: 14px;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.5;
  z-index: 1;
  user-select: none;
}
.eye-icon:active { opacity: 0.8; }

/* 验证码 */
.captcha-input { padding-right: 100px; }
.captcha-code {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  height: 36px;
  min-width: 88px;
  border-radius: 10px;
  background: linear-gradient(135deg, #fff0eb, #ffe5d9);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  user-select: none;
  padding: 0 8px;
}
.captcha-code span {
  font-size: 16px;
  font-weight: 700;
  font-style: italic;
  color: var(--primary);
  font-family: 'Courier New', monospace;
  display: inline-block;
}

/* ========== 按钮 ========== */
.submit-btn {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 50%, var(--primary-lighter) 100%);
  border: none;
  border-radius: 14px;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 6px;
  text-indent: 6px;
  cursor: pointer;
  transition: all 0.25s;
  margin-top: 6px;
  box-shadow: 0 6px 20px var(--primary-shadow), inset 0 1px 0 rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(232, 93, 58, 0.45), inset 0 1px 0 rgba(255,255,255,0.2);
}
.submit-btn:active { transform: scale(0.98); }
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
/* loading状态：字间距收紧 */
.submit-btn .btn-loading {
  letter-spacing: 1px;
  text-indent: 0;
}
/* loading spinner */
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin-right: 8px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ========== 协议区 ========== */
.agreement-section {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid #f0f0f0;
}
.checkbox-label {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #888;
  cursor: pointer;
  margin-bottom: 10px;
  line-height: 18px;
}
.checkbox {
  margin-right: 8px;
  width: 18px;
  height: 18px;
  accent-color: var(--primary);
  cursor: pointer;
  flex-shrink: 0;
  vertical-align: middle;
}
.agree-link {
  color: var(--primary);
  cursor: pointer;
  font-weight: 500;
  margin-left: 2px;
}
.agree-link:active { text-decoration: underline; }

.location-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #999;
  background: #f8f9fb;
  padding: 10px 12px;
  border-radius: 10px;
  line-height: 1.5;
}
.tip-icon { font-size: 14px; flex-shrink: 0; }

/* ========== 底部 ========== */
.footer {
  text-align: center;
  margin-top: 28px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 1px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

/* ========== 手机适配 ========== */
@media (max-width: 400px) {
  .content-layer {
    padding: 0 20px;
    padding-top: calc(20px + env(safe-area-inset-top));
    padding-bottom: calc(20px + env(safe-area-inset-bottom));
  }
  .title { font-size: 48px; }
  .form-container {
    padding: 22px 18px 22px;
    border-radius: 24px;
  }
  .logo-badge {
    width: 56px;
    height: 56px;
    border-radius: 18px;
  }
  .logo-icon { font-size: 32px; }
}
</style>
