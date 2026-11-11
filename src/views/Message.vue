<template>
  <div class="page-message">
    <div class="page-header">
      <div class="back" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </div>
      <div class="page-title">消息通知</div>
      <div class="placeholder"></div>
    </div>

    <div class="content-wrap">
      <div v-if="msgList.length === 0" class="empty-box">
        <p>暂无消息</p>
      </div>
      <div v-else class="msg-list">
        <div class="msg-item" v-for="item in msgList" :key="item.id">
          {{ item.content }}
        </div>
      </div>
    </div>

    <div class="tab-bottom">
      <TabBar />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import TabBar from '@/components/TabBar.vue'

const router = useRouter()
const msgList = ref([])

const goBack = () => {
  router.back()
}

const loadData = () => {
  // 消息接口在这里调用
}
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-message {
  /* 只改这里，和我的发布一致渐变背景，其他全部保留 */
  background: linear-gradient(180deg, #fff7ed 0%, #ffe4c7 45%, #ffd2a8 100%);
  min-height: 100vh;
  padding-bottom: 70px;
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
.page-title {
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
  padding-top: 40px;
}
.empty-box {
  text-align: center;
  color: #999;
  font-size: 20px;
  padding: 60px 0;
}
.msg-list {
  padding: 16px;
}
.msg-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}
.tab-bottom {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
}
</style>
