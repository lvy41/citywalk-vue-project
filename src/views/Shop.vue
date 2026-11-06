<template>
  <div class="page-shop">
    <div class="page-header">
      <el-icon @click="$router.back()" class="back-icon">
        <ArrowLeft />
      </el-icon>
      <h3>兑换商城</h3>
    </div>
    <div class="empty">
      <p>商城商品开发中...</p>
    </div>
  </div>
</template>
<script setup>
import { ArrowLeft } from '@element-plus/icons-vue'
</script>
<style scoped>
.page-shop {
  background: #f8f8f8;
  min-height: 100vh;
}
.page-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  gap:12px;
}
.back-icon {
  font-size:20px;
  cursor:pointer;
}
.empty {
  text-align:center;
  padding:80px 0;
  color:#999;
}
</style>
