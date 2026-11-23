<template>
  <div class="page-profile">
    <div class="profile-header" :style="headerStyle">
      <div class="top-bar">
        <div class="back-icon" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
        </div>
        <div class="top-right"></div>
      </div>

      <div class="user-info">
        <el-avatar :size="72" :src="profile.avatar" class="avatar">
          {{ (profile.nickname || '用').slice(0, 1) }}
        </el-avatar>
        <div class="meta">
          <div class="nickname">{{ profile.nickname || '匿名用户' }}</div>
          <div class="user-no">ID：{{ profile.userNo || profile.id }}</div>
          <div class="signature" v-if="profile.signature">{{ profile.signature }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-item">
          <div class="num">{{ profile.publishCount || 0 }}</div>
          <div class="label">发布路线</div>
        </div>
        <div class="divider"></div>
        <div class="stat-item">
          <div class="num">{{ profile.fansCount || 0 }}</div>
          <div class="label">粉丝</div>
        </div>
        <div class="divider"></div>
        <div class="stat-item">
          <div class="num">{{ profile.followCount || 0 }}</div>
          <div class="label">关注</div>
        </div>
      </div>
    </div>

    <div class="action-bar">
      <el-button
        v-if="!profile.isSelf"
        :type="profile.followedByMe ? 'default' : 'primary'"
        :class="profile.followedByMe ? 'btn-followed' : 'btn-follow'"
        round
        @click="toggleFollow"
      >
        {{ profile.mutual ? '互相关注' : profile.followedByMe ? '已关注' : '关注' }}
      </el-button>
    </div>

    <div class="section">
      <div class="section-title">TA 的路线</div>
      <div class="tag-tabs">
        <button
          v-for="tag in allTags"
          :key="tag"
          class="tag-tab"
          :class="{ active: activeTag === tag }"
          @click="activeTag = tag"
        >{{ tag }}</button>
      </div>
      <div v-if="filteredRoutes.length === 0" class="empty">还没有发布路线</div>
      <div v-else class="route-list">
        <div v-for="item in filteredRoutes" :key="item.id" class="route-item" @click="goDetail(item.id)">
          <div class="route-img">
            <img :src="item.coverImage || defaultImg" alt="" @error="onCoverError" />
          </div>
          <div class="route-info">
            <div class="route-name">{{ item.routeName }}</div>
            <div class="route-desc">{{ item.description || '这个人很懒，没有写介绍' }}</div>
            <div class="route-time">{{ formatTime(item.createTime) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getUserProfileAPI, getUserRoutesAPI } from '@/api/user'
import { followUserAPI, unfollowUserAPI } from '@/api/follow'

const route = useRoute()
const router = useRouter()
const userId = route.params.id

const profile = ref({})
const routes = ref([])
const activeTag = ref('全部')
const defaultImg = 'https://picsum.photos/id/1039/300/200'

const allTags = computed(() => {
  const names = new Set()
  routes.value.forEach(route => {
    (route.tags || []).forEach(tag => names.add(tag.tagName || tag.name))
  })
  return ['全部', ...Array.from(names)]
})
const filteredRoutes = computed(() => {
  if (activeTag.value === '全部') return routes.value
  return routes.value.filter(route =>
    (route.tags || []).some(tag => (tag.tagName || tag.name) === activeTag.value)
  )
})

const headerStyle = computed(() => ({
  backgroundImage: profile.value.bgImage
    ? `url(${profile.value.bgImage})`
    : 'linear-gradient(135deg, #e85d3a, #ff8c42)'
}))

const loadProfile = async () => {
  try {
    const res = await getUserProfileAPI(userId)
    if (res && res.code === 200) profile.value = res.data || {}
  } catch (e) {
    ElMessage.error('用户信息加载失败')
  }
}

const loadRoutes = async () => {
  try {
    const res = await getUserRoutesAPI(userId)
    routes.value = res && res.code === 200 && Array.isArray(res.data) ? res.data : []
    activeTag.value = '全部'
  } catch (e) {
    routes.value = []
  }
}

const toggleFollow = async () => {
  try {
    if (profile.value.followedByMe) {
      await unfollowUserAPI(userId)
      ElMessage.success('已取消关注')
    } else {
      await followUserAPI(userId)
      ElMessage.success('关注成功')
    }
    await loadProfile()
  } catch (e) {
    ElMessage.error('操作失败，请稍后重试')
  }
}

const goDetail = (id) => router.push(`/detail/${id}`)
const goBack = () => router.back()

// 封面加载失败时退回本地默认图，避免出现破图
const onCoverError = (e) => {
  const img = e && e.target
  if (!img || img.dataset.fallbackApplied) return
  img.dataset.fallbackApplied = '1'
  img.src = defaultImg
}

// 后端返回的时间可能是 ISO/UTC，统一格式化成 YYYY-MM-DD HH:mm（按本地时区）
const formatTime = (value) => {
  if (!value) return ''
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(value)) return value.slice(0, 16)
  const d = new Date(value)
  if (isNaN(d.getTime())) return String(value)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

onMounted(() => {
  loadProfile()
  loadRoutes()
})
</script>

<style scoped>
.page-profile {
  background: #f8f8f8;
  min-height: 100vh;
  padding-bottom: 24px;
}
.profile-header {
  background-size: cover;
  background-position: center;
  color: #fff;
  padding: 16px 20px 22px;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  position: relative;
}
.profile-header::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.22);
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
}
.top-bar,
.user-info,
.stat-card {
  position: relative;
  z-index: 1;
}
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.back-icon {
  font-size: 20px;
  cursor: pointer;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 18px 0 20px;
}
.avatar {
  border: 2px solid #fff;
  flex-shrink: 0;
}
.meta {
  flex: 1;
  min-width: 0;
}
.nickname {
  font-size: 22px;
  font-weight: 600;
}
.user-no {
  font-size: 13px;
  opacity: 0.85;
  margin-top: 4px;
}
.signature {
  font-size: 13px;
  opacity: 0.8;
  margin-top: 4px;
}
.stat-card {
  background: rgba(255, 255, 255, 0.22);
  border-radius: 16px;
  display: flex;
  text-align: center;
  padding: 16px 0;
}
.stat-item {
  flex: 1;
}
.divider {
  width: 1px;
  background: rgba(255, 255, 255, 0.35);
}
.stat-item .num {
  font-size: 22px;
  font-weight: bold;
}
.stat-item .label {
  font-size: 13px;
  opacity: 0.9;
  margin-top: 4px;
}
.action-bar {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}
.btn-follow {
  background: linear-gradient(to right, #ff9a44, #fc6076);
  border: none;
  color: #fff;
  min-width: 120px;
}
.btn-followed {
  min-width: 120px;
  color: #999;
  border-color: #ddd;
}
.section {
  padding: 0 16px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin-bottom: 12px;
}
.tag-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 0 0 12px;
  -webkit-overflow-scrolling: touch;
}
.tag-tab {
  flex-shrink: 0;
  white-space: nowrap;
  border: 1px solid #eee;
  background: #fff;
  border-radius: 18px;
  padding: 6px 12px;
  font-size: 13px;
  color: #555;
}
.tag-tab.active {
  color: #fff;
  border-color: #ff7a45;
  background: linear-gradient(to right, #ff9a44, #fc6076);
}
.empty {
  text-align: center;
  color: #bbb;
  padding: 50px 0;
}
.route-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.route-item {
  background: #fff;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  gap: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  cursor: pointer;
}
.route-img {
  width: 100px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}
.route-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.route-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}
.route-name {
  font-size: 15px;
  font-weight: 500;
  color: #222;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.route-desc {
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.route-time {
  font-size: 12px;
  color: #999;
}
</style>
