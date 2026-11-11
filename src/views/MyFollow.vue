<template>
  <div class="page-follow">
    <div class="page-header">
      <div class="back-icon" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="page-title">我的关注</div>
      <div class="count-tag" v-if="followList.length">{{ followList.length }}</div>
    </div>

    <div class="content-wrap">
      <div v-if="followList.length === 0" class="empty-box">
        <p class="empty-main">还没有关注任何人</p>
        <p class="empty-sub">去首页逛逛，看到喜欢的漫步者就关注一下</p>
        <el-button round class="go-btn" @click="goHome">去首页逛逛</el-button>
      </div>

      <div v-else class="follow-list">
        <div v-for="item in followList" :key="item.id" class="follow-item">
          <el-avatar :size="48" :src="item.avatar" class="avatar">
            {{ (item.nickname || '用').slice(0, 1) }}
          </el-avatar>
          <div class="user-meta" @click="goUserHome(item)">
            <div class="nickname">{{ item.nickname }}</div>
            <div class="desc">{{ item.desc || '这位漫步者还没写签名' }}</div>
            <div class="stat">
              {{ item.routeCount || 0 }} 条路线 · {{ item.fansCount || 0 }} 粉丝
            </div>
          </div>
          <el-button size="small" round plain class="unfollow-btn" @click.stop="unfollow(item)">
            已关注
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getFollowListAPI, unfollowUserAPI } from '@/api/follow'

const router = useRouter()
const followList = ref([])

// 走后端 /api/follow/list；接口不可用时退回本地存档，页面不至于空白
const loadFollowList = async () => {
  try {
    const res = await getFollowListAPI()
    if (res && res.code === 200 && Array.isArray(res.data)) {
      followList.value = res.data
      return
    }
    throw new Error('返回数据格式异常')
  } catch (e) {
    console.warn('关注列表接口不可用，改用本地数据', e)
    try {
      const raw = localStorage.getItem('citywalk_follow_list')
      followList.value = raw ? JSON.parse(raw) : []
    } catch (err) {
      followList.value = []
    }
  }
}

// 取关：先请求后端，成功后再从列表移除
const unfollow = async (item) => {
  try {
    await unfollowUserAPI(item.id)
    followList.value = followList.value.filter(u => u.id !== item.id)
    ElMessage.success(`已取消关注「${item.nickname}」`)
  } catch (e) {
    ElMessage.error('取关失败，请稍后重试')
  }
}

const goUserHome = (item) => {
  ElMessage.info(`「${item.nickname}」的个人主页还没有开放`)
}
const goHome = () => router.push('/home')
const goBack = () => router.back()

onMounted(loadFollowList)
</script>

<style scoped>
.page-follow {
  background-color: #f8f8f8;
  min-height: 100vh;
  padding-bottom: 24px;
  box-sizing: border-box;
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
  color: #222;
}
.count-tag {
  margin-left: auto;
  font-size: 13px;
  color: #999;
}
.content-wrap {
  padding: 16px;
}
.empty-box {
  text-align: center;
  padding: 80px 20px;
}
.empty-main {
  color: #666;
  font-size: 17px;
  margin-bottom: 8px;
}
.empty-sub {
  color: #bbb;
  font-size: 13px;
  margin-bottom: 22px;
}
.go-btn {
  background: linear-gradient(to right, #ff9a44, #fc6076);
  border: none;
  color: #fff;
  padding: 10px 26px;
}
.follow-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
.avatar {
  flex-shrink: 0;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}
.user-meta {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}
.nickname {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.desc {
  font-size: 12px;
  color: #999;
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.stat {
  font-size: 12px;
  color: #bbb;
  margin-top: 4px;
}
.unfollow-btn {
  flex-shrink: 0;
  color: #999;
  border-color: #ddd;
  font-size: 12px;
}
</style>
