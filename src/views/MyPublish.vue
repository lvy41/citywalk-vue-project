<template>
  <div class="page-my-publish">
    <div class="page-header">
      <div class="back-icon" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="page-title">我的发布</div>
    </div>

    <div class="content-wrap">
      <!-- 有路线列表 -->
      <div v-if="list.length > 0" class="route-list">
        <div class="route-item" v-for="item in list" :key="item.id" @click="goDetail(item.id)">
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
      <!-- 空状态 -->
      <div v-else class="empty-wrap">
        <div class="empty-text">暂无发布路线</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getUserPublishRouteAPI } from '@/api/route' // 查询用户发布路线接口
const router = useRouter()

const list = ref([])
const defaultImg = ref('https://picsum.photos/id/1039/300/200')

// 跳转到路线详情
const goDetail = (id) => {
  router.push(`/detail/${id}`)
}

// 获取我的发布列表：优先后端，接口不可用时退回本地暂存
const getList = async () => {
  try {
    const res = await getUserPublishRouteAPI()
    const data = res && res.data
    if (Array.isArray(data)) {
      list.value = data
      return
    }
    list.value = []
  } catch (e) {
    console.warn('我的发布接口不可用，改用本地暂存', e)
    try {
      const raw = localStorage.getItem('citywalk_published_list')
      const local = raw ? JSON.parse(raw) : []
      list.value = Array.isArray(local) ? local : []
    } catch (err) {
      list.value = []
    }
  }
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.page-my-publish {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff7ed 0%, #ffe4c7 45%, #ffd2a8 100%);
}

.page-header {
  display: flex;
  align-items: center;
  height: 48px;
  background: #ffffff;
  border-bottom: 1px solid #f5e7d3;
  padding: 0 16px;
  position: relative;
}

.back-icon {
  font-size: 20px;
  color: #333;
  cursor: pointer;
}

.page-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  font-weight: 600;
  color: #222;
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
