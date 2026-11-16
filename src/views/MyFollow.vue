<template>
  <div class="page-follow">
    <div class="page-header">
      <div class="back-icon" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="page-title">我的关注</div>
      <div class="count-tag" v-if="currentList.length">{{ currentList.length }}</div>
    </div>

    <div class="tab-bar">
      <div
        class="tab-item"
        :class="{ active: activeTab === 'following' }"
        @click="activeTab = 'following'"
      >
        关注 {{ followingList.length }}
      </div>
      <div
        class="tab-item"
        :class="{ active: activeTab === 'fans' }"
        @click="activeTab = 'fans'"
      >
        粉丝 {{ fansList.length }}
      </div>
    </div>

    <div class="content-wrap">
      <div v-if="currentList.length === 0" class="empty-box">
        <p class="empty-main">{{ activeTab === 'following' ? '还没有关注任何人' : '还没有粉丝' }}</p>
        <p class="empty-sub">{{ activeTab === 'following' ? '去首页逛逛，看到喜欢的漫步者就关注一下' : '分享你的主页，让更多人认识你' }}</p>
        <el-button v-if="activeTab === 'following'" round class="go-btn" @click="goHome">去首页逛逛</el-button>
      </div>

      <div v-else class="follow-list">
        <div v-for="item in currentList" :key="item.id" class="follow-item">
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

          <!-- 关注列表：已关注，可取关 -->
          <el-button
            v-if="activeTab === 'following'"
            size="small"
            round
            plain
            class="unfollow-btn"
            @click.stop="unfollow(item)"
          >
            已关注
          </el-button>

          <!-- 粉丝列表：未回关显示关注，已回关显示已回关 -->
          <el-button
            v-else-if="!item.followedByMe"
            size="small"
            round
            class="follow-btn"
            @click.stop="followBack(item)"
          >
            关注
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  getFollowListAPI,
  getFansListAPI,
  followUserAPI,
  unfollowUserAPI
} from '@/api/follow'

const router = useRouter()
const activeTab = ref('following')
const followingList = ref([])
const fansList = ref([])

const currentList = computed(() => (activeTab.value === 'following' ? followingList.value : fansList.value))

const loadFollowing = async () => {
  try {
    const res = await getFollowListAPI()
    if (res && res.code === 200 && Array.isArray(res.data)) {
      followingList.value = res.data
    }
  } catch (e) {
    console.warn('关注列表接口不可用', e)
  }
}

const loadFans = async () => {
  try {
    const res = await getFansListAPI()
    if (res && res.code === 200 && Array.isArray(res.data)) {
      fansList.value = res.data
    }
  } catch (e) {
    console.warn('粉丝列表接口不可用', e)
  }
}

const unfollow = async (item) => {
  try {
    await unfollowUserAPI(item.id)
    followingList.value = followingList.value.filter(u => u.id !== item.id)
    fansList.value = fansList.value.map(u => u.id === item.id ? { ...u, followedByMe: false } : u)
    ElMessage.success(`已取消关注「${item.nickname}」`)
  } catch (e) {
    ElMessage.error('取关失败，请稍后重试')
  }
}

const followBack = async (item) => {
  try {
    await followUserAPI(item.id)
    fansList.value = fansList.value.map(u => u.id === item.id ? { ...u, followedByMe: true } : u)
    ElMessage.success(`已关注「${item.nickname}」`)
  } catch (e) {
    ElMessage.error('关注失败，请稍后重试')
  }
}

const goUserHome = (item) => {
  router.push(`/user/${item.id}`)
}
const goHome = () => router.push('/home')
const goBack = () => router.back()

onMounted(() => {
  loadFollowing()
  loadFans()
})
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
.tab-bar {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #eee;
}
.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  position: relative;
}
.tab-item.active {
  color: #e85d3a;
  font-weight: 600;
}
.tab-item.active::after {
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
.follow-btn {
  flex-shrink: 0;
  background: linear-gradient(to right, #ff9a44, #fc6076);
  border: none;
  color: #fff;
  font-size: 12px;
}
</style>
