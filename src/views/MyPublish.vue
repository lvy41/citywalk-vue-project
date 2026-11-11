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
            <img :src="item.coverImage || defaultImg" alt="">
          </div>
          <div class="route-info">
            <div class="route-name">
              {{ item.routeName }}
              <el-tag size="small" :type="statusTag(item.auditStatus).type">{{ statusTag(item.auditStatus).text }}</el-tag>
            </div>
            <div class="route-desc">{{ item.description }}</div>
            <div class="route-time">{{ item.city }} · {{ formatTime(item.createTime) }}</div>
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
import { getUserPublishRouteAPI } from '@/api/route'
const router = useRouter()

const list = ref([])
const defaultImg = ref('https://picsum.photos/id/1039/300/200')

// 审核状态 -> 标签
const statusTag = (status) => {
  if (status === 0) return { type: 'info', text: '待审核' }
  if (status === 1) return { type: 'success', text: '已上线' }
  if (status === 2) return { type: 'danger', text: '已下架' }
  return { type: 'info', text: '未知' }
}

const formatTime = (t) => (t ? String(t).replace('T', ' ').substring(0, 16) : '')

// 跳转到路线详情
const goDetail = (id) => {
  router.push(`/detail/${id}`)
}

// 获取我的发布列表（后端直接返回数组）
const getList = async () => {
  try {
    const res = await getUserPublishRouteAPI()
    list.value = Array.isArray(res) ? res : []
  } catch (e) {
    list.value = []
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
