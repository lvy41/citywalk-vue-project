<template>
  <div class="page-setting">
    <div class="page-header">
      <div class="back" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </div>
      <div class="title">系统设置</div>
      <div class="placeholder"></div>
    </div>

    <div class="menu-group">
      <div class="menu-item" @click="goEditUser">
        <span>编辑个人信息</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="goChangePwd">
        <span>修改密码</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="goClearCache">
        <span>清除缓存</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="goAbout">
        <span>关于我们</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
    </div>

    <div class="menu-group danger-group">
      <div class="menu-item danger" @click="openCancel">
        <span>注销账号</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
    </div>

    <el-dialog
      v-model="cancelVisible"
      title="注销账号"
      width="86%"
      :close-on-click-modal="false"
    >
      <div class="cancel-tip">
        注销后，账号、发布路线、评论、点赞、收藏和打卡记录将无法恢复。请输入当前密码确认注销。
      </div>
      <el-input
        v-model="cancelPassword"
        type="password"
        show-password
        placeholder="请输入当前密码"
        @keyup.enter="submitCancel"
      />
      <template #footer>
        <el-button @click="cancelVisible = false">再想想</el-button>
        <el-button type="danger" :loading="canceling" @click="submitCancel">确认注销</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { cancelAccountAPI } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const cancelVisible = ref(false)
const cancelPassword = ref('')
const canceling = ref(false)

// 跳转编辑个人信息
const goEditUser = () => {
  router.push('/edit-user')
}
// 跳转修改密码
const goChangePwd = () => {
  router.push('/change-pwd')
}
// 跳转清除缓存页面
const goClearCache = () => {
  router.push('/clear-cache')
}
// 跳转关于我们页面
const goAbout = () => {
  router.push('/about')
}

const openCancel = () => {
  cancelPassword.value = ''
  cancelVisible.value = true
}

const submitCancel = async () => {
  if (canceling.value) return
  if (!cancelPassword.value) {
    ElMessage.warning('请输入当前密码')
    return
  }
  canceling.value = true
  try {
    await cancelAccountAPI({ password: cancelPassword.value })
    userStore.clearUser()
    ElMessage.success('账号已注销')
    router.replace('/login')
  } catch (error) {
    console.error('注销账号失败:', error)
  } finally {
    canceling.value = false
  }
}
</script>

<style scoped>
.page-setting {
  /* 只修改背景，和我的发布保持一致渐变，其余不动 */
  background: linear-gradient(180deg, #fff7ed 0%, #ffe4c7 45%, #ffd2a8 100%);
  min-height: 100vh;
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
.title {
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
.menu-group {
  margin: 16px;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}
.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px;
  font-size: 15px;
  color: #222;
  border-bottom: 1px solid #f2f2f2;
  cursor: pointer;
}
.menu-item:last-child {
  border-bottom: none;
}
.danger-group {
  margin-top: 16px;
}
.menu-item.danger {
  color: #d93025;
  font-weight: 500;
}
.cancel-tip {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
}
</style>
