<template>
  <div class="page-clear-cache">
    <div class="page-header">
      <div class="back" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </div>
      <h2>清除缓存</h2>
      <div class="placeholder"></div>
    </div>
    <div class="content-wrap">
      <div class="info-card">
        <div class="desc-text">
          缓存包含图片、临时数据等，清除后不会删除你的账号、发布路线、点赞记录。
        </div>
        <div class="cache-row">
          <span>当前缓存</span>
          <span class="cache-size">{{ cacheSize }}</span>
        </div>
      </div>
      <div class="btn-wrap">
        <el-button type="primary" class="clear-btn" @click="handleClear">清除缓存</el-button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const cacheSize = ref('2.36 MB')
const handleClear = () => {
  // 前端模拟清除缓存（实际前端只能清localStorage，图片缓存由浏览器控制）
  localStorage.removeItem('tempImgCache')
  ElMessage.success('缓存清除成功')
  cacheSize.value = '0.00 MB'
}
</script>
<style scoped>
.page-clear-cache {
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
.desc-text {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 20px;
}
.cache-row {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  color: #333;
}
.cache-size {
  color: #ff7a2f;
}
.btn-wrap {
  margin-top: 32px;
}
.clear-btn {
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
