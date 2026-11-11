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
      <div v-if="list.length > 0" class="route-list">
        <div class="route-item" v-for="item in list" :key="item.id" @click="goDetail(item.id)">
          <div class="route-img">
            <img :src="item.cover || defaultImg" alt="">
          </div>
          <div class="route-info">
            <div class="route-name">
              {{ item.title }}
              <span class="status-tag" :class="statusClass(item.auditStatus)">{{ statusText(item.auditStatus) }}</span>
            </div>
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
import { getUserPublishRouteAPI } from '@/api/route'
const router = useRouter()

const list = ref([])
const defaultImg = ref('https://picsum.photos/id/1039/300/200')

// 跳转到路线详情
const goDetail = (id) => {
  console.log('点击路线id：', id)
  router.push(`/detail/${id}`)
}

// 获取我的发布列表（后端返回 /route/list 同款 Route 字段，这里统一成页面字段）
const getList = async () => {
  const res = await getUserPublishRouteAPI()
  if (res.code === 200 && Array.isArray(res.data)) {
    list.value = res.data.map(r => ({
      id: r.id,
      title: r.routeName,
      content: r.description || '',
      cover: r.coverImage && r.coverImage !== 'xxx' ? r.coverImage : defaultImg.value,
      createTime: r.createTime ? String(r.createTime).replace('T', ' ').substring(0, 16) : '',
      auditStatus: r.auditStatus
    }))
  }
}

// 审核状态：0=待审核 1=已通过 2=已下架
const statusText = (s) => (s === 1 ? '已通过' : s === 2 ? '已下架' : '待审核')
const statusClass = (s) => (s === 1 ? 'is-pass' : s === 2 ? 'is-off' : 'is-wait')

onMounted(() => {
  getList()
})
</script>


<style scoped>
.status-tag {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 8px;
  font-size: 11px;
  border-radius: 10px;
  font-weight: normal;
  vertical-align: middle;
}
.status-tag.is-wait { background: #fff1d6; color: #b26a00; }
.status-tag.is-pass { background: #e6f7e9; color: #1f9d55; }
.status-tag.is-off { background: #f1f1f1; color: #8a8a8a; }

.page-my-publish {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff7ed 0%, #ffe4c7 45%, #ffd2a8 100%);
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
.page-header h2 {
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
