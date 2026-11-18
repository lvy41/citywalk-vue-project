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
        <div class="route-item" v-for="item in likeList" :key="item.id">
          <div class="route-img" @click="goDetail(item.id)">
            <img :src="item.coverImage || defaultImg" alt="" @error="onImgError">
          </div>
          <div class="route-info">
            <div class="route-name" @click="goDetail(item.id)">{{ item.routeName }}</div>
            <div class="route-desc">{{ metaText(item) }}</div>
            <div class="route-time">{{ item.description }}</div>
          </div>
          <div class="route-action" @click.stop="cancelLike(item)">
            <span>取消点赞</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
// 我的点赞读后端 /route/user-like（真实点赞数据）
import { getUserLikeListAPI, unlikeRouteAPI } from '@/api/route'

const router = useRouter()

const likeList = ref([])
const defaultImg = ref('/pictures/Myback.jpg')

const onImgError = (e) => {
  const img = e.target
  if (img && img.dataset.fallback === '1') return
  if (img) { img.dataset.fallback = '1'; img.src = '/pictures/Myback.jpg' }
}

const goDetail = (id) => {
  if (!id) return
  router.push(`/detail/${id}`)
}

const metaText = (item) => [item.city, item.duration, item.distance].filter(Boolean).join(' · ') || '城市漫步路线'

const getList = async () => {
  try {
    const res = await getUserLikeListAPI()
    likeList.value = (res && res.code === 200 && Array.isArray(res.data)) ? res.data : []
  } catch (e) {
    likeList.value = []
  }
}

const cancelLike = async (item) => {
  try {
    await unlikeRouteAPI(item.id)
    likeList.value = likeList.value.filter(r => r.id !== item.id)
    ElMessage.success('已取消点赞')
  } catch (e) {
    ElMessage.warning('请先登录后再操作')
  }
}

onMounted(() => {
  getList()
})
onActivated(getList)
</script>

<style scoped>
.page-my-like {
  min-height: 100vh;
  padding-bottom: 24px;
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
  display: flex;
  gap: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}
.route-img {
  width: 86px;
  height: 86px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f2f2f2;
}
.route-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.route-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}
.route-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  cursor: pointer;
}
.route-desc {
  font-size: 12px;
  color: #909399;
}
.route-time {
  font-size: 12px;
  color: #b0b3b8;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.route-action {
  align-self: center;
  flex-shrink: 0;
  font-size: 12px;
  color: #e85d3a;
  border: 1px solid #ffd2a8;
  background: #fff7ed;
  border-radius: 999px;
  padding: 4px 10px;
  cursor: pointer;
}
</style>
