<template>
  <nav class="tab-bar" aria-label="主导航">
    <router-link to="/home" class="tab-item">
      <el-icon><House /></el-icon>
      <span>首页</span>
    </router-link>
    <router-link to="/map" class="tab-item">
      <el-icon><MapLocation /></el-icon>
      <span>地图</span>
    </router-link>
    <router-link to="/publish" class="tab-item">
      <el-icon><CirclePlus /></el-icon>
      <span>发布</span>
    </router-link>
    <router-link to="/record" class="tab-item">
      <el-icon><Clock /></el-icon>
      <span>记录</span>
    </router-link>
    <router-link to="/my" class="tab-item">
      <el-icon><User /></el-icon>
      <span>我的</span>
    </router-link>
  </nav>
</template>

<script setup>
import { Clock, CirclePlus, House, MapLocation, User } from "@element-plus/icons-vue";
</script>

<style scoped>
.tab-bar {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  min-height: 58px;
  background: #fff;
  border-top: 1px solid #eee;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: #777;
  font-size: 11px;
  text-decoration: none;
}

.tab-item .el-icon {
  font-size: 19px;
}

.tab-item.router-link-active {
  color: #222;
}
</style>
