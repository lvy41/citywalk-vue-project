<template>
  <div class="page-edit-user">
    <div class="page-header">
      <div class="back-icon" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="page-title">编辑资料</div>
    </div>

    <div class="content-wrap">
      <div class="info-card">
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { updateUserInfoAPI } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const fileRef = ref(null)
const submitting = ref(false)

const formData = ref({
  avatar: '',
  nickname: '',
  signature: '',
  userNo: ''
})

const triggerUpload = () => {
  fileRef.value.click()
}

// 图片转base64
const onFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    formData.value.avatar = ev.target.result
  }
  reader.readAsDataURL(file)
}

// 加载：先读 pinia 缓存，没有再拉一次接口
const loadInfo = () => {
  const info = userStore.userInfo || {}
  formData.value.avatar = info.avatar || ''
  formData.value.nickname = info.nickname || '匿名用户'
  formData.value.signature = info.signature || ''
  formData.value.userNo = info.userNo || ''
}

// 保存：昵称 / 头像 / 签名 / 用户ID 全部提交到 PUT /api/user/update
const submit = async () => {
  if (!formData.value.userNo) {
    ElMessage.warning('用户ID不能为空')
    return
  }
  submitting.value = true
  try {
    const res = await updateUserInfoAPI({
      nickname: formData.value.nickname,
      avatar: formData.value.avatar,
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
</script>

<style scoped>
.page-edit-user {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff7ed 0%, #ffe4c7 45%, #ffd2a8 100%);
}

.page-header {
  display: flex;
  align-items: center;
  height: 48px;
  background: #ffffff;
  border-bottom: 1px solid #f5e7d3;
  padding: 0 16px;
  position: relative;
}

.back-icon {
  font-size: 20px;
  color: #333;
  cursor: pointer;
}

.page-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  font-weight: 600;
  color: #222;
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
  width: 56%;
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
