<template>
  <div class="page-my-favorite">
    <div class="page-header">
      <div class="back" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </div>
      <h2>我的收藏</h2>
      <div class="placeholder"></div>
    </div>

    <div class="content-wrap">
      <div v-if="favoriteList.length === 0" class="empty-wrap">
        <div class="empty-text">暂无收藏路线</div>
        <div class="empty-sub">去首页逛逛，看到喜欢的路线收藏起来吧</div>
      </div>
      <div v-else class="route-list">
        <div class="route-item" v-for="item in favoriteList" :key="item.id">
          <div class="route-img" @click="goDetail(item.id)">
            <img :src="item.coverImage || defaultImg" alt="" @error="onImgError">
          </div>
          <div class="route-info">
            <div class="route-name" @click="goDetail(item.id)">{{ item.routeName }}</div>
            <div class="route-desc">{{ item.city }} · {{ item.duration }} · {{ item.distance }}</div>
            <div class="route-time" v-if="item.description">{{ item.description }}</div>
            <div class="btn-group">
              <el-button type="warning" size="small" round class="action-btn yellow-btn" @click.stop="goCheckin(item.id)">去打卡</el-button>
              <el-button type="danger" size="small" round plain class="action-btn pink-btn" @click.stop="cancelFavorite(item)">取消收藏</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getUserFavoriteListAPI, unfavoriteRouteAPI } from '@/api/route'

const router = useRouter()

const favoriteList = ref([])
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

const goCheckin = (id) => {
  if (!id) return
  router.push(`/checkin/${id}`)
}

const getList = async () => {
  try {
    const res = await getUserFavoriteListAPI()
    favoriteList.value = (res && res.code === 200 && Array.isArray(res.data)) ? res.data : []
  } catch (e) {
    favoriteList.value = []
  }
}

const cancelFavorite = async (item) => {
  try {
    await unfavoriteRouteAPI(item.id)
    favoriteList.value = favoriteList.value.filter(r => r.id !== item.id)
    ElMessage.success('已取消收藏')
  } catch (e) {
    ElMessage.warning('请先登录后再操作')
  }
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.page-my-favorite {
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
.empty-sub {
  margin-top: 10px;
  font-size: 13px;
  color: #bbb;
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
.btn-group {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}
.action-btn {
  font-weight: 600;
  border: none;
  padding: 6px 14px;
}
.yellow-btn {
  background: linear-gradient(to right, #FFD15C, #FFA04D);
  color: #fff;
}
.pink-btn {
  color: #FC6076;
  border-color: #FFD1D9;
  background-color: #FFF0F3;
}
</style>
