<template>
  <div class="page-search">
    <div class="page-header">
      <div class="back-icon" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="search-box">
        <el-input
          v-model="keyword"
          placeholder="输入用户ID / 昵称 / 用户名"
          clearable
          @keyup.enter="doSearch"
        />
      </div>
      <el-button class="search-btn" type="primary" round @click="doSearch">搜索</el-button>
    </div>

    <div class="content-wrap">
      <div v-if="searched && list.length === 0" class="empty-box">
        <p class="empty-main">没有找到该用户</p>
        <p class="empty-sub">检查一下用户ID是否输入正确</p>
      </div>

      <div v-else-if="list.length > 0" class="user-list">
        <div v-for="item in list" :key="item.id" class="user-item" @click="goUserHome(item)">
          <el-avatar :size="48" :src="item.avatar" class="avatar">
            {{ (item.nickname || '用').slice(0, 1) }}
          </el-avatar>
          <div class="user-meta">
            <div class="nickname">{{ item.nickname }}</div>
            <div class="user-no">ID：{{ item.userNo || item.id }}</div>
            <div class="desc">{{ item.signature || '这位漫步者还没写签名' }}</div>
            <div class="stat">{{ item.routeCount || 0 }} 条路线 · {{ item.fansCount || 0 }} 粉丝</div>
          </div>
          <el-icon class="arrow"><ArrowRight /></el-icon>
        </div>
      </div>

      <div v-else class="empty-box">
        <p class="empty-main">搜索想关注的漫步者</p>
        <p class="empty-sub">支持用户ID、用户名、昵称</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { searchUserAPI } from '@/api/user'

const router = useRouter()
const keyword = ref('')
const list = ref([])
const searched = ref(false)

const doSearch = async () => {
  const kw = keyword.value.trim()
  if (!kw) {
    ElMessage.warning('请输入搜索内容')
    return
  }
  try {
    const res = await searchUserAPI(kw)
    list.value = res && res.code === 200 && Array.isArray(res.data) ? res.data : []
    searched.value = true
  } catch (e) {
    ElMessage.error('搜索失败，请稍后重试')
  }
}

const goUserHome = (item) => router.push(`/user/${item.id}`)
const goBack = () => router.back()
</script>

<style scoped>
.page-search {
  background: #f8f8f8;
  min-height: 100vh;
}
.page-header {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}
.back-icon {
  font-size: 20px;
  cursor: pointer;
  flex-shrink: 0;
}
.search-box {
  flex: 1;
}
.search-btn {
  flex-shrink: 0;
  background: linear-gradient(to right, #ff9a44, #fc6076);
  border: none;
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
}
.user-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  cursor: pointer;
}
.avatar {
  flex-shrink: 0;
}
.user-meta {
  flex: 1;
  min-width: 0;
}
.nickname {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}
.user-no {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
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
.arrow {
  color: #ccc;
  flex-shrink: 0;
}
</style>
