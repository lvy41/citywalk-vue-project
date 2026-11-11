<template>
  <div class="page-recycle">
    <div class="page-header">
      <div class="back" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </div>
      <h3>最近删除打卡路线</h3>
      <div class="placeholder"></div>
    </div>
    <div class="empty">
      <p>回收站暂无路线</p>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft } from '@element-plus/icons-vue'
</script>

<style scoped>
.page-recycle {
  /* 替换成和我的发布一模一样的渐变背景，其余全部不动 */
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
.page-header h3 {
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
.empty {
  text-align: center;
  padding: 80px 0;
  color: #999;
}
</style>
