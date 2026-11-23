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
        <span v-if="unreadSystemCount > 0" class="tab-badge">{{ unreadSystemCount > 99 ? '99+' : unreadSystemCount }}</span>
      </div>
      <div
        class="main-tab"
        :class="{ active: mainTab === 'interaction' }"
        @click="mainTab = 'interaction'"
      >
        互动通知
        <span v-if="unreadInteractionCount > 0" class="tab-badge">{{ unreadInteractionCount > 99 ? '99+' : unreadInteractionCount }}</span>
      </div>
    </div>

    <!-- 系统通知 -->
    <div v-if="mainTab === 'system'" class="content-wrap">
      <div v-if="systemList.length === 0" class="empty-box">
        <p>暂无系统通知</p>
      </div>
      <div v-else class="msg-list">
        <div class="msg-item sys-item" v-for="item in systemList" :key="item.id" @click="openSystem(item)">
          <div class="sys-head">
            <div class="msg-title">{{ item.title }}</div>
            <span v-if="systemTag(item.type)" class="sys-tag" :class="`sys-tag-${item.type}`">{{ systemTag(item.type) }}</span>
            <div class="msg-time">{{ formatTime(item.createTime) }}</div>
          </div>
          <div class="msg-content">{{ item.content }}</div>
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
                <span class="action" :class="`action-${item.type}`">{{ actionText(item.type, item) }}</span>
              </div>
              <div class="msg-route">{{ item.routeName }}</div>
              <div v-if="item.content" class="msg-comment">{{ item.content }}</div>
              <div v-if="item.type === 'comment' || item.type === 'reply'" class="msg-actions">
                <span class="msg-action-btn" @click.stop="replyComment(item)">回复</span>
                <span class="msg-action-btn" :class="{ liked: item.liked }" @click.stop="toggleCommentLike(item)">
                  {{ item.liked ? '❤️' : '🤍' }} {{ item.likeCount || 0 }}
                </span>
              </div>
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

    <div v-if="replyVisible" class="reply-sheet">
      <div class="reply-quote" v-if="replyTarget">
        <div class="reply-quote-main">
          <span class="reply-quote-user">回复 @{{ replyTarget.nickname || '匿名用户' }}</span>
          <span class="reply-quote-content">{{ replyTarget.content }}</span>
        </div>
        <span class="reply-close" @click="closeReply">取消</span>
      </div>
      <div class="reply-input-row">
        <el-input
          ref="replyInputRef"
          v-model="replyText"
          type="textarea"
          :rows="2"
          autosize
          :placeholder="replyTarget ? `回复 @${replyTarget.nickname}...` : '回复内容...'"
          @keydown.enter.prevent="submitReply"
        />
        <el-button class="reply-send" type="primary" round @click="submitReply">发送</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onActivated, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import {
  getInteractionNotificationsAPI,
  getSystemNotificationsAPI
} from '@/api/notification'
import { followUserAPI, unfollowUserAPI } from '@/api/follow'
import { toggleCommentLikeAPI, addRouteCommentAPI } from '@/api/route'

const router = useRouter()
const userStore = useUserStore()

const mainTab = ref('interaction')
const subTab = ref('messages')

// 顶部 tab 未读气泡（进入页面时计算，切到对应 tab 后清零并写基线）
const unreadSystemCount = ref(0)
const unreadInteractionCount = ref(0)

const systemList = ref([])
const likesList = ref([])
const commentsList = ref([])
const repliesList = ref([])
const favoritesList = ref([])
const followsList = ref([])
const replyVisible = ref(false)
const replyTarget = ref(null)
const replyText = ref("")
const replyInputRef = ref(null)

const messages = computed(() => {
  const merged = [
    ...likesList.value.map(item => ({ ...item, type: 'like' })),
    ...commentsList.value.map(item => ({ ...item, type: 'comment' })),
    ...repliesList.value.map(item => ({ ...item, type: 'reply' })),
    ...favoritesList.value.map(item => ({ ...item, type: 'favorite' }))
  ]
  return merged.sort((a, b) => compareTime(b.createTime, a.createTime))
})

const actionText = (type, item) => {
  if (type === 'like') return '点赞了你的路线'
  if (type === 'comment') return '评论了你的路线'
  if (type === 'reply') return `回复了 ${item?.replyToNickname || '对方'}`
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
  const d = new Date(typeof time === 'string' ? time.replace(' ', 'T') : time)
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
      repliesList.value = res.data.replies || []
      favoritesList.value = res.data.favorites || []
      followsList.value = res.data.follows || []
      const total = likesList.value.length + commentsList.value.length + repliesList.value.length + favoritesList.value.length + followsList.value.length
      // 计算未读增量（不立即写基线，等用户切到互动 tab 才标记已读）
      const readTotal = Number(localStorage.getItem('citywalk_msg_read_total') || 0)
      unreadInteractionCount.value = Math.max(0, total - readTotal)
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
      // 计算未读增量（不立即写基线，等用户切到系统 tab 才标记已读）
      const readIds = JSON.parse(localStorage.getItem('citywalk_sys_read_ids') || '[]')
      unreadSystemCount.value = systemList.value.filter(i => i.type !== 'version' && !readIds.includes(i.id)).length
    }
  } catch (e) {
    console.warn('系统通知加载失败', e)
  }
}

// 切到某个 tab 时，把该 tab 标记为已读（写基线 + 清气泡）
watch(mainTab, (val) => {
  if (val === 'system' && unreadSystemCount.value > 0) {
    const sysIds = systemList.value.filter(i => i.type !== 'version').map(i => i.id)
    localStorage.setItem('citywalk_sys_read_ids', JSON.stringify(sysIds))
    unreadSystemCount.value = 0
  }
  if (val === 'interaction' && unreadInteractionCount.value > 0) {
    const total = likesList.value.length + commentsList.value.length + repliesList.value.length + favoritesList.value.length + followsList.value.length
    localStorage.setItem('citywalk_msg_read_total', String(total))
    unreadInteractionCount.value = 0
  }
}, { immediate: false })

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

// 系统通知的状态标记（审核通过 / 重新上线 / 下架 / 删除）
const systemTag = (type) => {
  if (type === 'audit_pass' || type === 'audit_relist') return '已上线'
  if (type === 'audit_offline') return '已下架'
  if (type === 'route_delete') return '已删除'
  return ''
}

// 已下架 / 已删除的路线点进去会 404，这里只提示不跳转
const openSystem = (item) => {
  if (item.type === 'audit_offline' || item.type === 'route_delete') {
    ElMessage.info('该路线已下架，暂时无法查看')
    return
  }
  goRoute(item.routeId)
}

const replyComment = (item) => {
  replyTarget.value = item
  replyText.value = `@${item.nickname || '用户'} `
  replyVisible.value = true
  nextTick(() => replyInputRef.value?.focus?.())
}

const submitReply = async () => {
  const content = replyText.value.trim()
  if (!content) {
    ElMessage.warning('请先写点回复内容')
    return
  }
  if (!replyTarget.value?.routeId) {
    ElMessage.warning('缺少路线信息，无法回复')
    return
  }
  try {
    await addRouteCommentAPI({
      routeId: replyTarget.value.routeId,
      parentId: replyTarget.value.id,
      replyToUserId: replyTarget.value.userId,
      content
    })
    ElMessage.success('回复成功')
    const me = userStore.userInfo || {}
    const now = new Date()
    const newReply = {
      id: `local-reply-${now.getTime()}`,
      userId: me.id || me.userId,
      nickname: me.nickname || '我',
      avatar: me.avatar,
      routeId: replyTarget.value.routeId,
      routeName: replyTarget.value.routeName,
      content: content.replace(/^@[^\s]+\s?/, ''),
      parentId: replyTarget.value.id,
      replyToUserId: replyTarget.value.userId,
      replyToNickname: replyTarget.value.nickname,
      likeCount: 0,
      liked: false,
      createTime: now.toISOString()
    }
    repliesList.value.unshift(newReply)
    replyVisible.value = false
    replyTarget.value = null
    replyText.value = ''
  } catch (e) {
    ElMessage.warning('回复失败，请确认已登录')
  }
}

const closeReply = () => {
  replyVisible.value = false
  replyTarget.value = null
  replyText.value = ''
}

const updateCommentItem = (id, patch) => {
  commentsList.value = commentsList.value.map(c => c.id === id ? { ...c, ...patch } : c)
  repliesList.value = repliesList.value.map(c => c.id === id ? { ...c, ...patch } : c)
}

const toggleCommentLike = async (item) => {
  try {
    const res = await toggleCommentLikeAPI(item.id)
    const data = res && res.data ? res.data : {}
    updateCommentItem(item.id, {
      liked: !!data.liked,
      likeCount: data.likeCount ?? 0
    })
  } catch (e) {
    ElMessage.warning('请先登录后再点赞评论')
  }
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
onActivated(() => {
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

.tab-badge {
  display: inline-block;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  padding: 0 5px;
  margin-left: 4px;
  border-radius: 999px;
  background: #f56c6c;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  vertical-align: middle;
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

.action-comment,
.action-reply {
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

.msg-actions {
  display: flex;
  gap: 14px;
  margin-top: 6px;
  font-size: 12px;
  color: #888;
}

.msg-action-btn {
  cursor: pointer;
}

.msg-action-btn.liked {
  color: #e65b38;
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

/* 系统通知：标题 + 当前状态标记 */
/* 系统通知：标题 + 状态标记 + 时间一行，内容另起一行 */
.sys-item { flex-direction: column; gap: 6px; }
.sys-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.sys-head .msg-title { white-space: nowrap; }
.sys-head .msg-time { margin-left: auto; flex: none; }
.sys-item .msg-content { margin-top: 0; }
.sys-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  line-height: 1.5;
  white-space: nowrap;
  flex: none;
}
.sys-tag-audit_pass,
.sys-tag-audit_relist { color: #2f9e5f; background: #e8f8ee; }
.sys-tag-audit_offline { color: #d9534f; background: #fdecea; }
.sys-tag-route_delete { color: #8a8a8a; background: #f0f0f0; }
.sys-item { cursor: pointer; }

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

.reply-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: #fff;
  border-radius: 18px 18px 0 0;
  box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.12);
  padding: 14px 14px calc(14px + env(safe-area-inset-bottom));
}

.reply-quote {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  background: #f7f8fa;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 10px;
}

.reply-quote-main {
  min-width: 0;
}

.reply-quote-user {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.reply-quote-content {
  display: block;
  font-size: 14px;
  color: #555;
  line-height: 1.5;
}

.reply-close {
  flex-shrink: 0;
  font-size: 13px;
  color: #999;
  cursor: pointer;
}

.reply-input-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.reply-input-row .el-textarea {
  flex: 1;
}

.reply-send {
  flex-shrink: 0;
}
</style>
