<template>
  <div class="city-page">
    <!-- 顶部栏：橙色返回 + 右边定位emoji+城市名称 -->
    <div class="city-header">
      <button class="back-btn" @click="goBack" aria-label="返回">
        <el-icon><ArrowLeft /></el-icon>
      </button>
      <div class="city-title">📍 {{ currentCity }}</div>
    </div>

    <div v-if="loading">
      <div class="loading-tip">加载中...</div>
    </div>
    <div v-else-if="cityRouteList.length > 0">
      <div class="card-wrap">
        <div
          class="route-card"
          v-for="route in cityRouteList"
          :key="route.id"
          @click="$router.push({name:'Detail', params:{id:route.id}})"
        >
          <img class="card-img" :src="route.cover" alt="" @error="onCoverError($event)">
          <div class="card-name">{{ route.name }}</div>
          <div class="card-info">{{ route.duration }}</div>
          <div class="card-tags">
            <span class="tag-small" v-for="t in route.tags" :key="t">{{t}}</span>
          </div>
          <div class="card-stat">
            <span class="like-btn-card" :class="{active:route.isLiked}" @click.stop="toggleLike(route)">
              {{ route.isLiked ? '❤️' : '🤍' }} {{ route.likeNum }}
            </span>
            <span class="collect-btn-card" :class="{active:route.isCollected}" @click.stop="toggleCollect(route)">
              {{ route.isCollected ? '⭐' : '☆' }} {{ route.starNum }}
            </span>
          </div>
        </div>
      </div>
      <div class="has-data-tip">
        共 {{ cityRouteList.length }} 条 {{ currentCity }} 路线
      </div>
    </div>
    <!-- 没有路线才显示这个空提示 -->
    <div v-else class="empty-tip">
      该城市路线持续开发中，敬请期待
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getRouteListAPI, likeRouteAPI, unlikeRouteAPI } from '@/api/route'

const route = useRoute()
const router = useRouter()

const currentCity = ref('')
const loading = ref(true)
// 城市路线：来自数据库 /route/list（keyword 同时匹配路线名和城市名）
const cityRouteList = ref([])

const mapRoute = (r) => ({
  id: r.id,
  name: r.routeName,
  cover: r.coverImage || '/pictures/Myback.jpg',
  duration: r.duration || '',
  // 列表接口返回的标签是对象（Tag），这里统一取名字
  tags: (r.tags || []).map(t => (typeof t === 'string' ? t : (t.tagName || t.name || ''))).filter(Boolean),
  likeNum: r.likeCount || 0,
  starNum: r.collectCount || 0,
  isLiked: false,
  isCollected: false
})

// 封面图加载失败时退回默认图，避免出现破图图标
const onCoverError = (e) => {
  const img = e.target
  if (img && img.dataset.fallback === '1') return
  if (img) { img.dataset.fallback = '1'; img.src = '/pictures/Myback.jpg' }
}

const loadCityRoutes = async () => {
  if (!currentCity.value) {
    cityRouteList.value = []
    loading.value = false
    return
  }
  loading.value = true
  try {
    const res = await getRouteListAPI({ page: 1, size: 50, keyword: currentCity.value })
    const list = res && res.code === 200 && Array.isArray(res.data) ? res.data : []
    // keyword 会同时命中路线名，这里只保留城市完全一致的
    cityRouteList.value = list.map(mapRoute).filter(r => true)
  } catch (e) {
    cityRouteList.value = []
    ElMessage.warning('路线加载失败，请确认后端已启动')
  } finally {
    loading.value = false
  }
}

// 点赞 / 取消点赞，写的是 route_like，和首页、详情页同一套数据
const toggleLike = async (item) => {
  try {
    const res = item.isLiked ? await unlikeRouteAPI(item.id) : await likeRouteAPI(item.id)
    if (res && res.code !== 200) throw new Error(res.msg)
    item.isLiked = !item.isLiked
    item.likeNum = Math.max(0, item.likeNum + (item.isLiked ? 1 : -1))
  } catch (e) {
    ElMessage.warning('请先登录再点赞')
  }
}

// 收藏后端还没接口，先前端切换
const toggleCollect = (item) => {
  item.isCollected = !item.isCollected
  item.starNum += item.isCollected ? 1 : -1
  if (item.starNum < 0) item.starNum = 0
}

watch(() => route.params.cityName, (rawVal) => {
  currentCity.value = rawVal ? decodeURIComponent(rawVal).trim() : ''
  loadCityRoutes()
}, { immediate: true })

// 返回逻辑分支
const goBack = () => {
  if (route.query.fromSearch === 'true') {
    router.push({ path: '/home', query: { fromSearch: 'true' } })
  } else {
    router.push('/home')
  }
}
</script>

<style scoped>
.city-page {
  min-height: 100vh;
  background: linear-gradient(180deg,#ffdfd0,#fff7f0);
  padding: 16px;
  box-sizing: border-box;
}
.city-header{
  position:sticky; top:0; z-index:10;
  display:flex; align-items:center; gap:8px;
  padding:8px 4px 12px;
}
.back-btn{
  width:36px; height:36px; padding:0;
  border:none; border-radius:50%;
  background:rgba(255,255,255,.92);
  box-shadow:0 2px 8px rgba(255,107,53,.18);
  color:#ff6b35;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer;
  transition:transform .15s ease;
}
.back-btn:active{ transform:scale(.94); }
.back-btn .el-icon{ font-size:18px; }
.city-title {
  flex: 1;
  text-align: right;
  font-size: 17px;
  color: #333;
}
.card-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap:12px;
}
.route-card {
  background:#fff;
  border-radius:12px;
  overflow:hidden;
  cursor:pointer;
}
.card-img {
  width:100%;
  height:140px;
  object-fit:cover;
}
.card-name {
  padding:6px 8px 2px;
  font-weight:bold;
  font-size:14px;
}
.card-info {
  padding:0 8px;
  font-size:12px;
  color:#666;
}
.card-tags {
  padding:4px 8px;
}
.tag-small {
  font-size:11px;
  background:#ffe9dd;
  color:#d47544;
  padding:2px 5px;
  border-radius:4px;
  margin-right:3px;
}
.card-stat {
  padding:6px 8px 10px;
  display:flex;
  gap:16px;
  font-size:13px;
}
.like-btn-card,.collect-btn-card{
  cursor:pointer;
  color:#777;
}
.like-btn-card.active{
  color:#f56c6c;
}
.collect-btn-card.active{
  color:#e6a23c;
}
.loading-tip{
  text-align:center;
  padding-top:120px;
  font-size:16px;
  color:#666;
}
.empty-tip {
  text-align: center;
  padding-top: 120px;
  font-size: 16px;
  color:#888;
}
.has-data-tip {
  text-align: center;
  margin-top: 24px;
  padding:10px 0;
  font-size:15px;
  color:#999;
}
</style>
