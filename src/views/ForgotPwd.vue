<template>
  <div class="forgot-page">
    <div class="page-header">
      <div class="back" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </div>
      <h2>忘记密码</h2>
      <div class="placeholder"></div>
    </div>

    <div class="content-wrap">
      <div class="form-card">
        <div class="form-row">
          <span class="label">用户名</span>
          <el-input
            v-model="form.username"
            placeholder="请输入注册用户名"
            class="form-input"
            clearable
          />
        </div>

        <div class="line"></div>

        <div class="form-row">
          <span class="label">邮箱</span>
          <el-input
            v-model="form.email"
            type="email"
            maxlength="50"
            placeholder="请输入绑定的QQ邮箱"
            class="form-input"
          />
        </div>

        <div class="line"></div>

        <div class="form-row code-row">
          <span class="label">验证码</span>
          <el-input
            v-model="form.emailCode"
            type="text"
            maxlength="6"
            placeholder="邮箱验证码"
            class="form-input code-input"
            @input="form.emailCode = form.emailCode.replace(/\D/g, '')"
          />
          <el-button
            class="code-btn"
            :disabled="codeCountdown > 0 || submitting"
            @click="sendCode"
          >
            {{ codeCountdown > 0 ? codeCountdown + 's后重发' : '获取验证码' }}
          </el-button>
        </div>

        <div class="line"></div>

        <div class="form-row">
          <span class="label">新密码</span>
          <el-input
            v-model="form.newPwd"
            type="password"
            placeholder="6-16位新密码"
            class="form-input"
            show-password
          />
        </div>

        <div class="line"></div>

        <div class="form-row">
          <span class="label">确认密码</span>
          <el-input
            v-model="form.confirmPwd"
            type="password"
            placeholder="再次输入新密码"
            class="form-input"
            show-password
          />
        </div>
      </div>

      <div class="tip-text">
        验证码将发送到账号绑定的QQ邮箱，5分钟内有效；如未收到，请检查垃圾邮件。
      </div>

      <div class="btn-wrap">
        <el-button type="primary" class="save-btn" :loading="submitting" @click="submit">
          重置密码
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { forgotPasswordAPI, sendEmailCodeAPI } from '@/api/user'

const router = useRouter()
const route = useRoute()

const emailReg = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
const form = reactive({
  username: route.query.username ? String(route.query.username) : '',
  email: '',
  emailCode: '',
  newPwd: '',
  confirmPwd: ''
})
const submitting = ref(false)
const codeCountdown = ref(0)
let codeTimer = null

const goBack = () => {
  router.push('/login')
}

const startCountdown = () => {
  codeCountdown.value = 60
  codeTimer = window.setInterval(() => {
    codeCountdown.value -= 1
    if (codeCountdown.value <= 0 && codeTimer) {
      window.clearInterval(codeTimer)
      codeTimer = null
    }
  }, 1000)
}

onUnmounted(() => {
  if (codeTimer) window.clearInterval(codeTimer)
})

const sendCode = async () => {
  if (codeCountdown.value > 0) return
  if (!form.username.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!emailReg.test(form.email.trim())) {
    ElMessage.warning('请输入正确的QQ邮箱地址')
    return
  }
  try {
    await sendEmailCodeAPI({
      username: form.username.trim(),
      email: form.email.trim(),
      purpose: 'forgot'
    })
    ElMessage.success('验证码已发送，请查收邮箱')
    startCountdown()
  } catch (e) {
    console.warn('验证码发送失败', e)
  }
}

const submit = async () => {
  if (!form.username.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!emailReg.test(form.email.trim())) {
    ElMessage.warning('请输入正确的QQ邮箱地址')
    return
  }
  if (!form.emailCode) {
    ElMessage.warning('请输入邮箱验证码')
    return
  }
  if (!form.newPwd) {
    ElMessage.warning('请输入新密码')
    return
  }
  if (form.newPwd.length < 6 || form.newPwd.length > 16) {
    ElMessage.warning('新密码长度需要6-16位')
    return
  }
  if (form.newPwd !== form.confirmPwd) {
    ElMessage.warning('两次输入的新密码不一致')
    return
  }

  submitting.value = true
  try {
    await forgotPasswordAPI({
      username: form.username.trim(),
      email: form.email.trim(),
      emailCode: form.emailCode,
      newPassword: form.newPwd
    })
    ElMessage.success('密码重置成功，请使用新密码登录')
    router.replace({ path: '/login', query: { username: form.username.trim() } })
  } catch (e) {
    console.warn('重置密码失败', e)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.forgot-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff7ed 0%, #ffe4c7 45%, #ffd2a8 100%);
}

.page-header {
  background: linear-gradient(140deg, #e65b38, #ff9048);
  color: #fff;
  padding: 18px 20px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 15px;
  color: #ff7a45;
  font-weight: bold;
  cursor: pointer;
  background: #fff0f3;
  padding: 6px 12px;
  border-radius: 20px;
}

.page-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.placeholder {
  width: 70px;
}

.content-wrap {
  padding: 20px 16px 40px;
}

.form-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 24px 22px;
  box-shadow: 0 6px 20px rgba(255, 130, 50, 0.1);
}

.form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.label {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
}

.line {
  height: 1px;
  background: #f0e2d4;
  margin: 18px 0;
}

.form-input {
  width: 58%;
}

.code-row {
  gap: 10px;
}

.code-input {
  width: 46%;
}

.code-btn {
  flex: none;
  height: 36px;
  min-width: 96px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #fff0eb, #ffe5d9);
  color: #e85d3a;
  font-size: 13px;
  font-weight: 600;
  padding: 0 10px;
}

.code-btn:disabled {
  opacity: 0.6;
}

:deep(.form-input .el-input__wrapper) {
  box-shadow: none !important;
  border-radius: 18px;
  background-color: #fffaf4;
}

:deep(.form-input .el-input__inner) {
  background: transparent;
}

.tip-text {
  margin-top: 14px;
  padding: 0 6px;
  font-size: 13px;
  color: #886038;
  line-height: 1.5;
}

.btn-wrap {
  margin-top: 32px;
}

.save-btn {
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 18px;
  font-size: 17px;
  color: #fff;
  background: linear-gradient(135deg, #ff7a2f, #ffb14a);
}
</style>
