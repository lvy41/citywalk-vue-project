<template>
  <div class="page-setting">
    <div class="page-header">
      <div class="back-icon" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="title">系统设置</div>
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
  </div>
</template>

<script setup>
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

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
</script>

<style scoped>
.page-setting {
  background-color: #f8f8f8;
  min-height: 100vh;
}
.page-header {
  display: flex;
  align-items: center;
  height: 52px;
  background: #fff;
  position: relative;
  border-bottom: 1px solid #eee;
  padding: 0 16px;
}
.back-icon {
  font-size: 20px;
  cursor: pointer;
  z-index: 2;
}
.title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  font-weight: 600;
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
</style>
