<template>
  <div class="page-my-like">
    <div class="page-header">
      <div class="back-icon" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="page-title">我的点赞</div>
    </div>

    <div class="content-wrap">
      <div v-if="likeList.length === 0" class="empty-box">
        <p>暂无点赞路线</p>
      </div>
      <div v-else class="route-list">
        <div class="route-item" v-for="item in likeList" :key="item.id">
          {{ item.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getUserLikeListAPI } from '@/api/route'

const router = useRouter()
const likeList = ref([])

const goBack = () => {
  router.back()
}

const loadData = async () => {
  try {
    const res = await getUserLikeListAPI()
    likeList.value = res.data || []
  } catch (err) {
    console.error('获取点赞列表失败', err)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-my-like {
  background-color: #f8f8f8;
  min-height: 100vh;
  padding-bottom: 24px;
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
.route-list {
  padding: 16px;
}
.route-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}
</style>
