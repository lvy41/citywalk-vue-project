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
          <span class="label">用户ID</span>
          <el-input
            v-model="formData.userId"
            placeholder="设置用户ID（类似微信号）"
            class="form-input"
          />
        </div>
      </div>

      <div class="btn-wrap">
        <el-button type="primary" class="save-btn" @click="submit">保存修改</el-button>
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

const router = useRouter()
const userStore = useUserStore()
const fileRef = ref(null)
const bgFileRef = ref(null) // 背景封面input

const formData = ref({
  avatar: '',
  nickname: '',
  userId: '',
  bgImage: '' // 新增背景封面
})

// 头像上传
const triggerUpload = () => {
  fileRef.value.click()
}
const onFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    formData.value.avatar = ev.target.result
  }
  reader.readAsDataURL(file)
}

// 背景封面上传
const triggerBgUpload = () => {
  bgFileRef.value.click()
}
const onBgFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    formData.value.bgImage = ev.target.result
  }
  reader.readAsDataURL(file)
}

// 加载：从pinia拿本地信息
const loadInfo = () => {
  const info = userStore.userInfo
  formData.value.avatar = info.avatar || ''
  formData.value.nickname = info.nickname || '匿名用户'
  formData.value.userId = info.userId || ''
  formData.value.bgImage = info.bgImage || ''
}

// 保存，把bgImage一起存入pinia
const submit = () => {
  if (!formData.value.userId) {
    ElMessage.warning('用户ID不能为空')
    return
  }
  userStore.setUserInfo({
    avatar: formData.value.avatar,
    nickname: formData.value.nickname,
    userId: formData.value.userId,
    bgImage: formData.value.bgImage
  })
  ElMessage.success('修改成功！')
  router.back()
}

onMounted(() => {
  loadInfo()
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
