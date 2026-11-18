<template>
  <div class="page-my-publish">
    <div class="page-header">
      <div class="back" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </div>
      <h2>我的发布</h2>
      <div class="placeholder"></div>
    </div>

    <div class="content-wrap">
      <div v-if="list.length > 0" class="route-list">
        <div class="route-item" v-for="item in list" :key="item.id" @click="goDetail(item.id)">
          <div class="route-img">
            <img :src="item.coverImage || defaultImg" alt="" @error="onImgError">
          </div>
          <div class="route-info">
            <div class="route-name-row">
              <div class="route-name">{{ item.routeName || '未命名路线' }}</div>
              <span class="status-tag" :class="statusClass(item.auditStatus)">{{ statusText(item.auditStatus) }}</span>
            </div>
            <div class="route-desc">{{ item.description || '暂无路线介绍' }}</div>
            <div class="route-meta">
              <span v-if="item.city">{{ item.city }}</span>
              <span v-if="item.duration">{{ item.duration }}</span>
              <span v-if="item.distance">{{ item.distance }}</span>
            </div>
            <div class="route-time">{{ formatTime(item.createTime) }}</div>
          </div>
        </div>
      </div>

      <div v-else class="empty-wrap">
        <div class="empty-icon">🗺</div>
        <div class="empty-text">暂无发布路线</div>
        <div class="empty-sub">发布第一条城市漫步路线，记录你的出行足迹</div>
        <el-button type="primary" round class="go-publish" @click="$router.push('/publish')">去发布路线</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getUserPublishRouteAPI } from '@/api/route'

const router = useRouter()
const list = ref([])
const defaultImg = ref('/pictures/Myback.jpg')

const onImgError = (e) => {
  const img = e.target
  if (img && img.dataset.fallback === '1') return
  if (img) {
    img.dataset.fallback = '1'
    img.src = defaultImg.value
  }
}

const goDetail = (id) => {
  if (!id) return
  router.push(`/detail/${id}`)
}

const formatTime = (time) => {
  if (!time) return ''
  const d = new Date(typeof time === 'string' ? time.replace(' ', 'T') : time)
  if (Number.isNaN(d.getTime())) return String(time)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const statusText = (status) => {
  if (Number(status) === 1) return '已通过'
  if (Number(status) === 2) return '已驳回'
  return '待审核'
}

const statusClass = (status) => {
  if (Number(status) === 1) return 'status-pass'
  if (Number(status) === 2) return 'status-reject'
  return 'status-pending'
}

const getList = async () => {
  try {
    const res = await getUserPublishRouteAPI()
    list.value = res && res.code === 200 && Array.isArray(res.data) ? res.data : []
  } catch (e) {
    console.warn('我的发布接口不可用', e)
    list.value = []
  }
}

onMounted(getList)
onActivated(getList)
</script>

<style scoped>
.page-my-publish {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff7ed 0%, #ffe4c7 45%, #ffd2a8 100%);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  padding: 18px 20px;
  background: linear-gradient(140deg, #e65b38, #ff9048);
}

.page-header .back {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  background: #FFF0F3;
  color: #FF7A45;
  padding: 6px 12px;
  border-radius: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.placeholder {
  width: 64px;
}

.content-wrap {
  padding: 20px 16px 40px;
}

.empty-wrap {
  text-align: center;
  margin-top: 120px;
}
.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}
.empty-text {
  font-size: 20px;
  color: #666;
}
.empty-sub {
  margin-top: 10px;
  font-size: 13px;
  color: #999;
}
.go-publish {
  margin-top: 22px;
  background: linear-gradient(to right, #ff9a44, #fc6076);
  border: none;
  color: #fff;
  padding: 10px 28px;
}

.route-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.record-card {
  display: flex;
  gap: 12px;
  box-shadow: 0 4px 16px rgba(255, 130, 50, 0.1);
  cursor: pointer;
}
.route-img {
  width: 100px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f4f5f7;
}
.route-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.route-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 4px;
}
.route-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.route-name {
  font-size: 16px;
  font-weight: 500;
  color: #222;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.status-tag {
  flex-shrink: 0;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
}
.status-pending {
  background: #fff7ed;
  color: #ff8833;
}
.status-pass {
  background: #f0f9eb;
  color: #67c23a;
}
.status-reject {
  background: #fef0f0;
  color: #f56c6c;
}
.route-desc {
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.route-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: #999;
}
.route-time {
  font-size: 12px;
  color: #999;
}
</style>
