<template>
  <div class="page-my-like">
    <div class="page-header">
      <div class="back" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </div>
      <h2>我的点赞</h2>
      <div class="placeholder"></div>
    </div>

    <div class="content-wrap">
      <div v-if="likeList.length === 0" class="empty-wrap">
        <div class="empty-text">暂无点赞路线</div>
      </div>
      <div v-else class="route-list">
        <div class="route-item" v-for="item in likeList" :key="item.id" @click="goDetail(item.id)">
          <div class="route-img">
            <img :src="item.cover || defaultImg" alt="">
          </div>
          <div class="route-info">
            <div class="route-name">{{ item.title }}</div>
            <div class="route-desc">{{ item.content }}</div>
            <div class="route-time">{{ item.createTime }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getUserLikeListAPI } from '@/api/route'
const router = useRouter()

const likeList = ref([])
const defaultImg = ref('https://picsum.photos/id/1039/300/200')

const goDetail = (id) => {
  console.log('点击点赞路线id：', id)
  router.push(`/detail/${id}`)
}

const getList = async () => {
  const res = await getUserLikeListAPI()
  if (res.code === 200) {
    likeList.value = res.data
  }
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.page-my-like {
  min-height: 100vh;
  /* 和我的发布一模一样的背景渐变 */
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

.empty-wrap {
  text-align: center;
  margin-top: 120px;
}
.empty-text {
  font-size: 22px;
  color: #999;
}

.route-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.route-item {
  background: #fff;
  border-radius: 20px;
  padding: 14px;
  display: flex;
  gap:12px;
  box-shadow: 0 4px 16px rgba(255,130,50,0.1);
  cursor: pointer;
}
.route-img {
  width: 100px;
  height: 80px;
  border-radius:12px;
  overflow: hidden;
  flex-shrink: 0;
}
.route-img img {
  width:100%;
  height:100%;
  object-fit: cover;
}
.route-info {
  flex:1;
  display:flex;
  flex-direction:column;
  justify-content: space-between;
}
.route-name {
  font-size:16px;
  font-weight:500;
  color:#222;
}
.route-desc {
  font-size:13px;
  color:#666;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.route-time {
  font-size:12px;
  color:#999;
}
</style>
