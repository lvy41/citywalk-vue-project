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
      <!-- 有路线列表 -->
      <div v-if="list.length > 0" class="card-list">
        <div v-for="item in list" :key="item.id" class="record-card" @click="goDetail(item.id)">
          <img :src="item.coverImage || '/pictures/Myback.jpg'" class="card-cover" alt="封面" @error="onImgError($event)">
          <div class="card-info">
            <div class="title-row">
              <h3 class="card-title link-title">
                {{ item.routeName }} <span class="arrow">></span>
              </h3>
            </div>
            <p class="card-desc">
              <span class="pub-flag" :class="{ 'pub-yes': item.auditStatus === 1 }">{{ pubText(item) }}</span>
            </p>
            <p class="card-time">创建时间：{{ fmtTime(item.createTime) }}</p>
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

// 跳转到路线详情
const goDetail = (id) => {
  console.log('点击路线id：', id)
  router.push(`/detail/${id}`)
}

const onImgError = (e) => {
  e.target.style.display = 'none'
}

const pubText = (item) => {
  if (item.auditStatus === 2) return '已下架'
  if (item.auditStatus === 0) return '待审核'
  return item.isPublic ? '公开路线' : '未公开路线'
}

// 兼容后端 ISO / 时间戳，格式化为 YYYY-MM-DD HH:mm
const fmtTime = (t) => {
  if (!t) return '未知时间'
  const d = new Date(t)
  if (Number.isNaN(d.getTime())) return String(t)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 获取我的发布列表：优先后端，接口不可用时退回本地暂存
const getList = async () => {
  try {
    const res = await getUserPublishRouteAPI()
    const data = res && res.data
    list.value = Array.isArray(data) ? data : []
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

.card-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.record-card {
  display: flex;
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease;
  cursor: pointer;
}

.record-card:active {
  transform: scale(0.98);
}

.card-cover {
  width: 110px;
  height: 110px;
  object-fit: cover;
  flex-shrink: 0;
}

.card-info {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.title-row .card-title {
  margin: 0;
  flex: 1;
}

.link-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #303133;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: color 0.2s;
}

.link-title:active {
  color: #FF7A45;
}

.link-title .arrow {
  font-size: 14px;
  color: #C0C4CC;
}

.card-desc,
.card-time {
  margin: 6px 0;
  font-size: 13px;
  color: #606266;
}

.card-time {
  color: #909399;
}

.pub-flag {
  display: inline-block;
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 10px;
  background: #F2F3F5;
  color: #909399;
}

.pub-flag.pub-yes {
  background: #F0F9EB;
  color: #67C23A;
}

.empty-wrap {
  text-align: center;
  padding: 120px 0;
}

.empty-text {
  font-size: 22px;
  color: #999;
}
</style>
