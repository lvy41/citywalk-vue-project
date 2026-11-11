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
</style>
