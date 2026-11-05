<template>
  <div class="page-about">
    <div class="page-header">
      <div class="back-icon" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="page-title">关于我们</div>
    </div>
    <div class="content-wrap">
      <div class="info-card">
        <div class="logo-box">
          <div class="app-logo">🚶</div>
          <div class="app-name">城市漫步 CityWalk</div>
          <div class="app-version">版本 v1.0.0</div>
        </div>
        <div class="line"></div>
        <div class="about-text">
          <p>城市漫步，记录你在城市里走过的每一条路线。</p>
          <p>探索城市、分享路线、打卡美景，遇见同好。</p>
        </div>
        <div class="line"></div>
        <div class="link-item" @click="openProtocol">用户协议</div>
        <div class="line"></div>
        <div class="link-item" @click="openPrivacy">隐私政策</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
const openProtocol = () => {
  ElMessage.info('用户协议页面（后续补充）')
}
const openPrivacy = () => {
  ElMessage.info('隐私政策页面（后续补充）')
}
</script>
<style scoped>
.page-about {
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
.logo-box {
  text-align: center;
  padding: 10px 0 20px;
}
.app-logo {
  font-size: 48px;
  margin-bottom:8px;
}
.app-name {
  font-size:18px;
  font-weight:600;
  color:#222;
}
.app-version {
  font-size:13px;
  color:#888;
  margin-top:4px;
}
.line {
  height: 1px;
  background: #f0e2d4;
  margin: 18px 0;
}
.about-text p {
  font-size:14px;
  color:#555;
  line-height:1.7;
  margin:6px 0;
}
.link-item {
  font-size:16px;
  color:#333;
  padding:8px 0;
  cursor: pointer;
}
</style>
