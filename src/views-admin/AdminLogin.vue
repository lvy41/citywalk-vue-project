<template>
  <div class="login-container">
    <!-- 1. CityWalk 路线图背景 -->
    <div class="bg-image"></div>

    <!-- 2. 动态 SVG 路线层：叠加在背景图上 -->
    <svg class="bg-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#93C5FD" stop-opacity="0.25" />
        </linearGradient>
      </defs>

      <!-- 主动态路线 -->
      <path
        class="city-path path-main"
        d="M-80,340 C160,280 300,460 520,400 C700,340 860,500 1080,440 C1260,390 1380,480 1520,450"
        stroke="url(#lineGrad1)"
        stroke-width="2.4"
        fill="none"
      />

      <!-- 辅助动态路线 -->
      <path
        class="city-path path-sub"
        d="M-60,520 C180,460 340,600 580,540 C760,490 920,620 1160,560 C1320,520 1440,600 1540,580"
        stroke="#ffffff"
        stroke-width="1.2"
        fill="none"
        opacity="0.35"
      />

      <!-- 定位点 -->
      <circle class="dot dot-1" cx="220" cy="310" r="5" fill="#fff" />
      <circle class="dot dot-2" cx="540" cy="400" r="4" fill="#93C5FD" />
      <circle class="dot dot-3" cx="900" cy="440" r="6" fill="#fff" />
      <circle class="dot dot-4" cx="1240" cy="420" r="4" fill="#BFDBFE" />

      <!-- 装饰光晕 -->
      <circle class="glow glow-1" cx="1180" cy="200" r="140" fill="#60A5FA" opacity="0.18" />
      <circle class="glow glow-2" cx="200" cy="720" r="200" fill="#3B82F6" opacity="0.14" />
    </svg>

    <!-- 3. 页面内容 -->
    <div class="brand-area">
      <h1 class="title">CityWalk 城市漫步</h1>
      <p class="sub-title">后台管理登录</p>
    </div>

    <div class="login-box">
      <div class="tab-wrap">
        <div class="tab-item active">登录</div>
        <div class="tab-item">注册</div>
      </div>

      <el-form ref="loginFormRef" :model="loginForm" class="login-form">
        <el-form-item>
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" @click="handleLogin">登录</el-button>
        </el-form-item>
      </el-form>

      <div class="agree-wrap">
        <el-checkbox v-model="agree">
          已阅读并同意
          <span class="link" @click="$router.push('/privacy')">《隐私协议》</span>
        </el-checkbox>
        <p class="tip">⚠️ 需要使用定位权限用于打卡和路线推荐</p>
      </div>

      <div class="copyright">v1.0.0<br>© 2026 CityWalk 团队</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const loginForm = ref({
  username: 'admin',
  password: '123456'
})

const agree = ref(false)
const loginFormRef = ref(null)

const handleLogin = async () => {
  if (!agree) {
    alert('请勾选同意隐私协议')
    return
  }

  try {
    const res = await axios.post('/api/admin/login', loginForm.value)
    localStorage.setItem('adminToken', res.data.token)
    router.push('/dashboard')
  } catch (err) {
    console.error(err)
    alert('登录失败，请检查账号密码或后端服务')
  }
}
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

/* 路线图背景 */
.bg-image {
  position: absolute;
  inset: 0;
  background-image: url('@/assets/citywalk-route-bg.png');
  background-size: cover;
  background-position: center;
  z-index: 0;
}

/* 背景遮罩，增强文字可读性 */
.login-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(30, 58, 138, 0.55), rgba(59, 130, 246, 0.35));
  z-index: 1;
}

/* SVG 动态路线层 */
.bg-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

/* 路线流动画 */
.city-path {
  stroke-dasharray: 1400;
  stroke-dashoffset: 1400;
  animation: drawLine 7s ease-in-out infinite;
}

.path-main {
  animation-delay: 0s;
}

.path-sub {
  animation-delay: 1.8s;
}

@keyframes drawLine {
  0% {
    stroke-dashoffset: 1400;
  }
  50% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: 1400;
  }
}

/* 定位点呼吸 */
.dot {
  transform-origin: center;
  animation: dotPulse 3s ease-in-out infinite;
}

.dot-1 {
  animation-delay: 0s;
}

.dot-2 {
  animation-delay: 0.7s;
}

.dot-3 {
  animation-delay: 1.4s;
}

.dot-4 {
  animation-delay: 2.1s;
}

@keyframes dotPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.4);
    opacity: 0.4;
  }
}

/* 光晕漂浮 */
.glow {
  animation: floatCircle 12s ease-in-out infinite;
}

.glow-1 {
  animation-delay: 0s;
}

.glow-2 {
  animation-delay: 3s;
}

@keyframes floatCircle {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-12px, -18px) scale(1.08);
  }
}

/* 标题区域 */
.brand-area {
  position: relative;
  z-index: 3;
  text-align: center;
  margin-bottom: 28px;
  animation: fadeDown 0.9s ease-out;
}

.title {
  font-size: 34px;
  color: #ffffff;
  margin: 0;
  font-weight: 600;
  letter-spacing: 2px;
}

.sub-title {
  font-size: 15px;
  color: #dbeafe;
  margin: 6px 0 0;
  opacity: 0.9;
}

/* 登录卡片 */
.login-box {
  position: relative;
  z-index: 3;
  width: 340px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 18px;
  padding: 28px 28px 22px;
  box-shadow: 0 20px 45px rgba(15, 35, 80, 0.4);
  backdrop-filter: blur(10px);
  animation: fadeUp 0.8s ease-out;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-box:hover {
  transform: translateY(-4px);
  box-shadow: 0 26px 55px rgba(15, 35, 80, 0.48);
}

/* Tab */
.tab-wrap {
  display: flex;
  border-bottom: 1px solid #eef2ff;
  margin-bottom: 20px;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  font-size: 15px;
  color: #8892b0;
  cursor: pointer;
  transition: all 0.25s ease;
}

.tab-item.active {
  color: #2563eb;
  font-weight: 600;
  border-bottom: 2px solid #2563eb;
}

/* 表单 */
.login-form {
  width: 100%;
}

.login-btn {
  width: 100%;
  height: 46px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  color: #fff;
  transition: all 0.3s ease;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.45);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.55);
}

.login-btn:active {
  transform: translateY(0);
}

/* 协议区域 */
.agree-wrap {
  margin-top: 16px;
  font-size: 13px;
  color: #475569;
}

.link {
  color: #2563eb;
  cursor: pointer;
  text-decoration: underline;
}

.link:hover {
  color: #1d4ed8;
}

.tip {
  color: #f59e0b;
  margin-top: 6px;
}

.copyright {
  text-align: center;
  margin-top: 22px;
  font-size: 12px;
  color: #94a3b8;
}

/* 入场动画 */
@keyframes fadeDown {
  from {
    opacity: 0;
    transform: translateY(-16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
