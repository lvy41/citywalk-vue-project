<template>
  <el-container class="admin-layout">
    <!-- 左侧侧边栏 -->
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <span>🚶 CityWalk</span> 管理后台
      </div>
      <el-menu
        :default-active="$route.path"
        class="el-menu-vertical"
        router
        background-color="#FFF6F0"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>数据仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/userManage">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/routeManage">
          <el-icon><MapLocation /></el-icon>
          <span>路线管理</span>
        </el-menu-item>
        <el-menu-item index="/commentManage">
          <el-icon><ChatDotRound /></el-icon>
          <span>评论管理</span>
        </el-menu-item>
        <el-menu-item index="/tagManage">
          <el-icon><PriceTag /></el-icon>
          <span>标签管理</span>
        </el-menu-item>
        <el-menu-item index="/cityManage">
          <el-icon><OfficeBuilding /></el-icon>
          <span>城市管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧内容 -->
    <el-container>
      <!-- 顶部 Header -->
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $route.meta.title || '管理页' }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <span class="welcome">欢迎您，超级管理员</span>
          <el-button type="danger" link @click="logout">退出登录</el-button>
        </div>
      </el-header>

      <!-- 核心内容区 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { DataLine, User, MapLocation, ChatDotRound, PriceTag, OfficeBuilding } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

const logout = () => {
  localStorage.removeItem('adminToken')
  ElMessage.success('已退出登录')
  router.push('/adminlogin')
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  overflow: hidden;
}

/* 侧边栏设计 */
.sidebar {
  background-color: #FFF6F0;
  box-shadow: 2px 0 8px rgba(255, 154, 68, 0.05);
  display: flex;
  flex-direction: column;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 18px;
  font-weight: 900;
  color: #FF7A45;
  border-bottom: 1px dashed #FFE4D6;
}
.el-menu-vertical {
  border-right: none;
  flex: 1;
}
:deep(.el-menu-item) {
  margin: 8px 15px;
  border-radius: 12px;
  color: #606266;
  font-weight: bold;
}
:deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #FF9A44 0%, #FC6076 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(252, 96, 118, 0.3);
}

/* 顶部 Header 设计 */
.header {
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #F2F6FC;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}
.welcome {
  font-size: 14px;
  color: #909399;
}

/* 主内容区背景色 */
.main-content {
  background-color: #F7F8FA;
  padding: 0;
}
</style>