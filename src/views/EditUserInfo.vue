<template>
  <div class="page-edit-user">
    <!-- 修改这里头部，和其他页面统一 -->
    <div class="page-header">
      <div class="back" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </div>
      <h2>编辑资料</h2>
      <div class="placeholder"></div>
    </div>

    <div class="content-wrap">
      <div class="info-card">
        <!-- 新增：背景封面 -->
        <div class="form-row">
          <span class="label">个人背景封面</span>
          <div class="bg-box" @click="triggerBgUpload">
            <div class="bg-preview" v-if="formData.bgImage">
              <img :src="formData.bgImage" alt="背景预览" />
            </div>
            <div class="bg-empty" v-else>点击上传封面</div>
            <input ref="bgFileRef" type="file" accept="image/*" hidden @change="onBgFileChange" />
          </div>
        </div>

        <div class="line"></div>

        <div class="form-row">
          <span class="label">头像</span>
          <div class="avatar-box" @click="triggerUpload">
            <div class="avatar-border">
              <el-avatar :size="78" :src="formData.avatar" class="my-avatar">
                <span v-if="!formData.avatar">用</span>
              </el-avatar>
            </div>
            <span class="tip">点击更换</span>
            <input ref="fileRef" type="file" accept="image/*" hidden @change="onFileChange" />
          </div>
        </div>

        <div class="line"></div>

        <div class="form-row">
          <span class="label">昵称</span>
          <el-input
            v-model="formData.nickname"
            placeholder="请输入昵称"
            class="form-input"
          />
        </div>

        <div class="line"></div>

        <div class="form-row">
          <span class="label">邮箱</span>
          <el-input
            v-model="formData.email"
            type="email"
            placeholder="绑定QQ邮箱，用于找回密码"
            maxlength="50"
            class="form-input"
            @input="onEmailInput"
          />
        </div>

        <div class="line"></div>

        <div class="form-row code-row">
          <span class="label">邮箱验证码</span>
          <div class="code-input-wrap">
            <el-input
              v-model="formData.emailCode"
              placeholder="修改邮箱时需验证"
              maxlength="6"
              class="form-input code-input"
            />
            <el-button
              class="code-btn"
              :disabled="codeCountdown > 0 || emailUnchanged"
              @click="sendBindCode"
            >
              {{ codeCountdown > 0 ? `${codeCountdown}s` : '发送验证码' }}
            </el-button>
          </div>
        </div>

        <div class="line"></div>

        <div class="form-row">
          <span class="label">个性签名</span>
          <el-input
            v-model="formData.signature"
            placeholder="一句话介绍自己"
            maxlength="60"
            class="form-input"
          />
        </div>

        <div class="line"></div>

        <div class="form-row">
          <span class="label">用户ID</span>
          <el-input
            v-model="formData.userNo"
            placeholder="设置用户ID（类似微信号，保存到服务端）"
            maxlength="30"
            class="form-input"
          />
        </div>
      </div>

      <div class="btn-wrap">
        <el-button type="primary" class="save-btn" :loading="submitting" @click="submit">保存修改</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { updateUserInfoAPI, sendEmailCodeAPI } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const fileRef = ref(null)
const bgFileRef = ref(null)
const submitting = ref(false)
const codeCountdown = ref(0)
let codeTimer = null
const originalEmail = ref('')

const formData = ref({
  avatar: '',
  bgImage: '',
  nickname: '',
  email: '',
  emailCode: '',
  signature: '',
  userNo: ''
})

// 图片压缩：头像/封面先缩放到合理尺寸，避免大图 dataURL 直接入库
const compressImageFile = (file, maxSize = 800, quality = 0.82) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const ratio = Math.min(1, maxSize / Math.max(img.width, img.height))
        const width = Math.round(img.width * ratio)
        const height = Math.round(img.height * ratio)
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = ev.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 背景封面上传
const triggerBgUpload = () => {
  bgFileRef.value.click()
}
const onBgFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  try {
    formData.value.bgImage = await compressImageFile(file, 1200, 0.8)
  } catch (err) {
    ElMessage.warning('图片读取失败，请换一张图片')
  }
}

// 头像上传
const triggerUpload = () => {
  fileRef.value.click()
}
const onFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  try {
    formData.value.avatar = await compressImageFile(file, 400, 0.85)
  } catch (err) {
    ElMessage.warning('图片读取失败，请换一张图片')
  }
}

// 加载：先读 pinia 缓存，没有再拉一次接口
const loadInfo = () => {
  const info = userStore.userInfo || {}
  formData.value.avatar = info.avatar || ''
  formData.value.bgImage = info.bgImage || ''
  formData.value.nickname = info.nickname || '匿名用户'
  formData.value.email = info.email || ''
  originalEmail.value = info.email || ''
  formData.value.signature = info.signature || ''
  formData.value.userNo = info.userNo || ''
}

const emailReg = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
const emailUnchanged = () => formData.value.email.trim().toLowerCase() === originalEmail.value.trim().toLowerCase()
const onEmailInput = () => {
  if (emailUnchanged()) formData.value.emailCode = ''
}

const startCountdown = () => {
  codeCountdown.value = 60
  codeTimer = setInterval(() => {
    codeCountdown.value -= 1
    if (codeCountdown.value <= 0 && codeTimer) {
      clearInterval(codeTimer)
      codeTimer = null
    }
  }, 1000)
}

const sendBindCode = async () => {
  const email = formData.value.email.trim()
  if (!email) {
    ElMessage.warning('请先输入要绑定的邮箱')
    return
  }
  if (!emailReg.test(email)) {
    ElMessage.warning('请输入正确的邮箱地址')
    return
  }
  try {
    await sendEmailCodeAPI({ email, purpose: 'bind' })
    startCountdown()
    ElMessage.success('验证码已发送到邮箱')
  } catch (e) {
    console.warn('邮箱验证码发送失败', e)
  }
}
// 保存：昵称 / 头像 / 签名 / 用户ID 全部提交到 PUT /api/user/update
const submit = async () => {
  if (!formData.value.userNo) {
    ElMessage.warning('用户ID不能为空')
    return
  }
  const email = formData.value.email.trim().toLowerCase()
  if (email && !emailReg.test(email)) {
    ElMessage.warning('请输入正确的QQ邮箱地址')
    return
  }
  const emailChanged = email !== originalEmail.value.trim().toLowerCase()
  if (emailChanged && !formData.value.emailCode.trim()) {
    ElMessage.warning('修改邮箱需先获取并填写邮箱验证码')
    return
  }
  submitting.value = true
  try {
    const res = await updateUserInfoAPI({
      nickname: formData.value.nickname,
      avatar: formData.value.avatar,
      bgImage: formData.value.bgImage,
      email,
      emailCode: emailChanged ? formData.value.emailCode.trim() : '',
      signature: formData.value.signature,
      userNo: formData.value.userNo
    })
    // 后端返回最新资料（已含 userNo），直接回写 store
    userStore.setUserInfo(res.data || {})
    ElMessage.success('修改成功！')
    router.back()
  } catch (e) {
    // 后端不可用时先保留本地输入，避免白填一遍
    userStore.setUserInfo({
      nickname: formData.value.nickname,
      avatar: formData.value.avatar,
      bgImage: formData.value.bgImage,
      email,
      signature: formData.value.signature,
      userNo: formData.value.userNo
    })
    ElMessage.warning('保存失败（用户ID可能已被占用），已暂存本地')
    console.warn('更新资料失败', e)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  if (!userStore.userInfo || !userStore.userInfo.nickname) {
    try {
      await userStore.fetchUserInfo()
    } catch (e) {
      console.warn('拉取用户资料失败', e)
    }
  }
  loadInfo()
})

onBeforeUnmount(() => {
  if (codeTimer) {
    clearInterval(codeTimer)
    codeTimer = null
  }
})
</script>

<style scoped>
.page-edit-user {
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
  color: #FF7A45;
  font-weight: bold;
  cursor: pointer;
  background: #FFF0F3;
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

.info-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 24px 22px;
  box-shadow: 0 6px 20px rgba(255, 130, 50, 0.1);
}

.form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

/* 背景封面预览 */
.bg-box {
  width: 52%;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 1px dashed #ffb16b;
}
.bg-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.bg-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff8833;
  font-size:13px;
}

.avatar-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.avatar-border {
  border: 3px solid #ffb16b;
  border-radius: 50%;
  overflow: hidden;
}

:deep(.my-avatar) {
  display: block !important;
}
:deep(.my-avatar img) {
  display: block !important;
  object-fit: cover !important;
  width: 100%;
  height: 100%;
}

.tip {
  margin-top: 6px;
  font-size: 13px;
  color: #ff8833;
}

.line {
  height: 1px;
  background: #f0e2d4;
  margin: 18px 0;
}

.form-input {
  width: 52%;
}

.code-row .code-input-wrap {
  width: 52%;
  display: flex;
  gap: 8px;
  align-items: center;
}
.code-row .code-input {
  flex: 1;
  width: auto;
}
.code-btn {
  flex-shrink: 0;
  border: none;
  background: #fff0f3;
  color: #e85d3a;
}

:deep(.form-input .el-input__wrapper) {
  box-shadow: none !important;
  border-radius: 18px;
  background-color: #fffaf4;
}
:deep(.form-input .el-input__inner) {
  background: transparent;
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
  box-shadow: 0 6px 16px rgba(255, 122, 47, 0.22);
}
</style>
