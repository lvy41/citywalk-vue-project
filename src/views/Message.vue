<template>
  <div class="page-message">
    <div class="page-header">
      <div class="back-icon" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="page-title">消息通知</div>
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
  background-color: #f8f8f8;
  min-height: 100vh;
  padding-bottom: 70px;
}
.page-header {
  display: flex;
  align-items: center;
  height: 52px;
  background: #fff;
  padding: 0 16px;
  position: relative;
  border-bottom: 1px solid #eee;
}
.back-icon {
  font-size: 20px;
  cursor: pointer;
  z-index: 2;
}
.page-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  font-weight: 600;
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
