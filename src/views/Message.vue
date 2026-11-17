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

    <!-- 一级分类：系统通知 / 互动通知 -->
    <div class="main-tabs">
      <div
        class="main-tab"
        :class="{ active: mainTab === 'system' }"
        @click="mainTab = 'system'"
      >
        系统通知
      </div>
      <div
        class="main-tab"
        :class="{ active: mainTab === 'interaction' }"
        @click="mainTab = 'interaction'"
      >
        互动通知
      </div>
    </div>

    <!-- 系统通知 -->
    <div v-if="mainTab === 'system'" class="content-wrap">
      <div v-if="systemList.length === 0" class="empty-box">
        <p>暂无系统通知</p>
      </div>
      <div v-else class="msg-list">
        <div class="msg-item" v-for="item in systemList" :key="item.id" @click="goRoute(item.routeId)">
          <div class="msg-title">{{ item.title }}</div>
          <div class="msg-content">{{ item.content }}</div>
          <div class="msg-time">{{ formatTime(item.createTime) }}</div>
        </div>
      </div>
    </div>

    <!-- 互动通知 -->
    <div v-else class="content-wrap">
      <!-- 互动通知二级分类：点赞/评论/收藏 与 新关注 -->
      <div class="sub-tabs">
        <div
          class="sub-tab"
          :class="{ active: subTab === 'messages' }"
          @click="subTab = 'messages'"
        >
          互动消息 {{ messages.length }}
        </div>
        <div
          class="sub-tab"
          :class="{ active: subTab === 'follows' }"
          @click="subTab = 'follows'"
        >
          新关注 {{ followsList.length }}
        </div>
      </div>

      <!-- 点赞 / 评论 / 收藏 -->
      <div v-if="subTab === 'messages'">
        <div v-if="messages.length === 0" class="empty-box">
          <p>暂无点赞、评论或收藏消息</p>
        </div>
        <div v-else class="msg-list">
          <div class="msg-item" v-for="item in messages" :key="`${item.type}-${item.id}`" @click="goRoute(item.routeId)">
            <el-avatar :size="44" :src="item.avatar" class="avatar">
              {{ (item.nickname || '用').slice(0, 1) }}
            </el-avatar>
            <div class="msg-body">
              <div class="msg-line">
                <span class="nickname">{{ item.nickname }}</span>
                <span class="action" :class="`action-${item.type}`">{{ actionText(item.type) }}</span>
              </div>
              <div class="msg-route">{{ item.routeName }}</div>
              <div v-if="item.content" class="msg-comment">{{ item.content }}</div>
              <div class="msg-time">{{ formatTime(item.createTime) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 新关注 -->
      <div v-else>
        <div v-if="followsList.length === 0" class="empty-box">
          <p>暂无新关注</p>
        </div>
        <div v-else class="follow-list">
          <div class="follow-item" v-for="item in followsList" :key="item.id">
            <el-avatar :size="48" :src="item.avatar" class="avatar">
              {{ (item.nickname || '用').slice(0, 1) }}
            </el-avatar>
            <div class="user-meta" @click="goUserHome(item.userId)">
              <div class="nickname">{{ item.nickname }}</div>
              <div class="desc">{{ item.desc || '这位漫步者还没写签名' }}</div>
              <div class="stat">
                {{ item.routeCount || 0 }} 条路线 · {{ item.fansCount || 0 }} 粉丝
              </div>
            </div>
            <el-button
              v-if="!item.followedByMe"
              size="small"
              round
              class="follow-btn"
              @click.stop="followBack(item)"
            >
              回关
            </el-button>
            <el-button
              v-else
              size="small"
              round
              plain
              class="unfollow-btn"
              @click.stop="unfollow(item)"
            >
              已回关
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  getInteractionNotificationsAPI,
  getSystemNotificationsAPI
} from '@/api/notification'
import { followUserAPI, unfollowUserAPI } from '@/api/follow'

const router = useRouter()

const mainTab = ref('interaction')
const subTab = ref('messages')

const systemList = ref([])
const likesList = ref([])
const commentsList = ref([])
const favoritesList = ref([])
const followsList = ref([])

const messages = computed(() => {
  const merged = [
    ...likesList.value.map(item => ({ ...item, type: 'like' })),
    ...commentsList.value.map(item => ({ ...item, type: 'comment' })),
    ...favoritesList.value.map(item => ({ ...item, type: 'favorite' }))
  ]
  return merged.sort((a, b) => compareTime(b.createTime, a.createTime))
})

const actionText = (type) => {
  if (type === 'like') return '点赞了你的路线'
  if (type === 'comment') return '评论了你的路线'
  if (type === 'favorite') return '收藏了你的路线'
  return '互动了你的路线'
}

const compareTime = (a, b) => {
  const ta = a ? String(a) : ''
  const tb = b ? String(b) : ''
  return ta.localeCompare(tb)
}

const formatTime = (time) => {
  if (!time) return ''
  if (typeof time === 'string') {
    return time.replace('T', ' ').slice(0, 16)
  }
  const d = new Date(time)
  if (Number.isNaN(d.getTime())) return String(time)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const loadInteractions = async () => {
  try {
    const res = await getInteractionNotificationsAPI()
    if (res && res.code === 200 && res.data) {
      likesList.value = res.data.likes || []
      commentsList.value = res.data.comments || []
      favoritesList.value = res.data.favorites || []
      followsList.value = res.data.follows || []
    }
  } catch (e) {
    console.warn('互动通知加载失败', e)
  }
}

const loadSystem = async () => {
  try {
    const res = await getSystemNotificationsAPI()
    if (res && res.code === 200 && Array.isArray(res.data)) {
      systemList.value = res.data
    }
  } catch (e) {
    console.warn('系统通知加载失败', e)
  }
}

const followBack = async (item) => {
  try {
    await followUserAPI(item.userId)
    followsList.value = followsList.value.map(u =>
      u.userId === item.userId ? { ...u, followedByMe: true } : u
    )
    ElMessage.success(`已关注「${item.nickname}」`)
  } catch (e) {
    ElMessage.error('关注失败，请稍后重试')
  }
}

const unfollow = async (item) => {
  try {
    await unfollowUserAPI(item.userId)
    followsList.value = followsList.value.map(u =>
      u.userId === item.userId ? { ...u, followedByMe: false } : u
    )
    ElMessage.success(`已取消关注「${item.nickname}」`)
  } catch (e) {
    ElMessage.error('取关失败，请稍后重试')
  }
}

const goRoute = (routeId) => {
  if (routeId) router.push(`/detail/${routeId}`)
}

const goUserHome = (userId) => {
  if (userId) router.push(`/user/${userId}`)
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadInteractions()
  loadSystem()
})
</script>

<style scoped>
.page-message {
  background: linear-gradient(180deg, #fff7ed 0%, #ffe4c7 45%, #ffd2a8 100%);
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

.main-tabs,
.sub-tabs {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #eee;
}

.main-tab,
.sub-tab {
  flex: 1;
  text-align: center;
  padding: 13px 0;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  position: relative;
}

.main-tab.active,
.sub-tab.active {
  color: #e85d3a;
  font-weight: 600;
}

.main-tab.active::after,
.sub-tab.active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 32px;
  height: 3px;
  border-radius: 2px;
  background: #e85d3a;
}

.content-wrap {
  padding: 16px;
}

.empty-box {
  text-align: center;
  color: #999;
  font-size: 17px;
  padding: 80px 20px;
}

.msg-list,
.follow-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.msg-item {
  display: flex;
  gap: 12px;
  background: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  cursor: pointer;
}

.avatar {
  flex-shrink: 0;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.msg-body,
.user-meta {
  flex: 1;
  min-width: 0;
}

.msg-line {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.nickname {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.action {
  font-size: 13px;
  color: #666;
}

.action-like {
  color: #fc6076;
}

.action-comment {
  color: #409eff;
}

.action-favorite {
  color: #f5a623;
}

.msg-route {
  font-size: 14px;
  color: #333;
  margin-top: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.msg-comment {
  font-size: 13px;
  color: #777;
  margin-top: 4px;
  background: #f7f7f7;
  border-radius: 8px;
  padding: 8px 10px;
}

.msg-time,
.stat {
  font-size: 12px;
  color: #bbb;
  margin-top: 5px;
}

.msg-title {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.msg-content {
  font-size: 14px;
  color: #666;
  margin-top: 6px;
}

.follow-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.user-meta {
  cursor: pointer;
}

.desc {
  font-size: 12px;
  color: #999;
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unfollow-btn {
  flex-shrink: 0;
  color: #999;
  border-color: #ddd;
  font-size: 12px;
}

.follow-btn {
  flex-shrink: 0;
  background: linear-gradient(to right, #ff9a44, #fc6076);
  border: none;
  color: #fff;
  font-size: 12px;
}
</style>
