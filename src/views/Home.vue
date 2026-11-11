<template>
  <div class="home-container">
    <!-- 顶部搜索栏 -->
    <div class="home-header">
      <el-input
        v-model="searchKey"
        placeholder="搜索路线、地点、标签"
        prefix-icon="Search"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
      <el-button type="primary" @click="getLocation">定位</el-button>
    </div>
    <!-- 轮播Banner -->
    <div class="banner-wrap">
      <el-carousel height="220px" indicator-position="outside">
        <el-carousel-item v-for="item in bannerList" :key="item.id">
          <img :src="item.img" alt="" class="banner-img" />
          <div class="banner-text">{{ item.title }}</div>
        </el-carousel-item>
      </el-carousel>
    </div>
    <!-- 横向滚动路线分类标签栏 -->
    <div class="tag-scroll">
      <el-tag
        v-for="item in tagList"
        :key="item"
        :type="activeTag === item ? 'primary' : 'info'"
        class="tag-item"
        @click="handleTagClick(item)"
      >
        {{ item }}
      </el-tag>
    </div>
    <!-- 为你推荐路线 -->
    <div class="section-title">为你推荐路线</div>
    <div class="route-list">
      <div class="route-card" v-for="route in filterRouteList" :key="route.id" @click="goDetail(route.id)">
        <div class="card-img">
          <img :src="route.cover" alt="封面" />
        </div>
        <div class="card-info">
          <div class="route-name">{{ route.name }}</div>
          <div class="route-meta">
            <span>{{ route.city }}</span>
            <span>⏱ {{ route.duration }}</span>
          </div>
          <div class="route-tags">
            <el-tag size="small" v-for="t in route.tags" :key="t">{{ t }}</el-tag>
          </div>
          <div class="route-stats">
            <span>❤️ {{ route.likeNum }}</span>
            <span>⭐ {{ route.collectNum }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 无搜索结果提示 -->
    <div v-if="filterRouteList.length === 0" class="empty-tip">
      没有找到匹配的路线，请更换关键词或标签试试
    </div>
    <!-- 热门排行榜板块 -->
    <div class="section-title">🔥 热门排行榜</div>
    <div class="rank-wrap">
      <div class="rank-item" v-for="(item, index) in topRankList" :key="item.id" @click="goDetail(item.id)">
        <div class="rank-num" :class="rankClass(index + 1)">{{ index + 1 }}</div>
        <div class="rank-info">
          <div class="rank-name">{{ item.name }}</div>
          <div class="rank-sub">{{ item.city }} | 热度：{{ item.hotScore }}</div>
        </div>
      </div>
    </div>
    <!-- 底部Tab导航 -->
    <div class="tab-bar">
      <div class="tab-item" :class="{active: $route.path === '/home'}" @click="$router.push('/home')">
        <div class="tab-icon">🏠</div>
        <div class="tab-text">首页</div>
      </div>
      <div class="tab-item" :class="{active: $route.path === '/map'}" @click="$router.push('/map')">
        <div class="tab-icon">🗺</div>
        <div class="tab-text">探索地图</div>
      </div>
      <div class="tab-item" :class="{active: $route.path === '/publish'}" @click="$router.push('/publish')">
        <div class="tab-icon">✏️</div>
        <div class="tab-text">发布路线</div>
      </div>
      <div class="tab-item" :class="{active: $route.path === '/record'}" @click="$router.push('/record')">
        <div class="tab-icon">📝</div>
        <div class="tab-text">打卡记录</div>
      </div>
      <div class="tab-item" :class="{active: $route.path === '/my'}" @click="$router.push('/my')">
        <div class="tab-icon">👤</div>
        <div class="tab-text">我的</div>
      </div>
    </div>
    <div class="blank-bottom"></div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
const router = useRouter()
// 搜索关键词
const searchKey = ref('')
// 当前选中标签
const activeTag = ref('全部')
// 当前定位城市
const currentCity = ref('')
// 标签列表
const tagList = ref(['全部', '老街', '美食', '博物馆', '公园', '夜景', '短途徒步'])
// 路线列表：来自后端 /route/list（已公开 + 审核通过的路线）
const routeList = ref([])
const loading = ref(false)
// 轮播Banner数据
const bannerList = ref([
  {
    id: 1,
    title: '老城区一日漫步，感受老城烟火',
    img: '/pictures/1.png'
  },
  {
    id: 2,
    title: '珠江江边夜景路线，黄昏漫步',
    img: '/pictures/2.png'
  },
  {
    id: 3,
    title: '东山口文艺打卡之旅',
    img: '/pictures/3.png'
  }
])
// 路线数据：从后端读真实数据（/route/list 只返回 已公开 + 审核通过 的路线）
const loadRouteList = async () => {
  loading.value = true
  try {
    const res = await request.get('/route/list')
    const arr = Array.isArray(res) ? res : []
    routeList.value = arr.map(toCardItem)
  } catch (e) {
    routeList.value = []
    ElMessage.error('路线加载失败，请确认后端已启动')
  } finally {
    loading.value = false
  }
}

// 后端字段 -> 首页卡片字段
const toCardItem = (r) => {
  const cover = r.coverImage && r.coverImage !== 'xxx' ? r.coverImage : `https://picsum.photos/seed/cw${r.id}/600/400`
  return {
    id: r.id,
    name: r.routeName,
    city: r.city,
    duration: r.duration || '',
    cover,
    tags: [],
    likeNum: r.likeCount || 0,
    collectNum: r.collectCount || 0,
    hotScore: (r.likeCount || 0) * 3 + (r.collectCount || 0)
  }
}

// 筛选后的推荐路线
const filterRouteList = computed(() => {
  let arr = [...routeList.value]
  if (activeTag.value !== '全部') {
    arr = arr.filter(item => item.tags.includes(activeTag.value))
  }
  if (searchKey.value.trim()) {
    const kw = searchKey.value.trim().toLowerCase()
    arr = arr.filter(item => {
      return (
        (item.name || '').toLowerCase().includes(kw) ||
        (item.city || '').toLowerCase().includes(kw) ||
        (item.tags || []).some(t => t.toLowerCase().includes(kw))
      )
    })
  }
  if (currentCity.value) {
    arr = arr.filter(item => item.city === currentCity.value)
  }
  return arr
})
// 热门排行榜
const topRankList = computed(() => {
  const sortArr = [...routeList.value].sort((a, b) => b.hotScore - a.hotScore)
  return sortArr.slice(0, 5)
})
// 标签点击
const handleTagClick = (tag) => {
  activeTag.value = tag
  searchKey.value = ''
}
// 搜索
const handleSearch = () => {
  if (!searchKey.value.trim()) {
    ElMessage.info('请输入搜索关键词')
    return
  }
  console.log('搜索：', searchKey.value)
}
// 定位
const getLocation = () => {
  if (!navigator.geolocation) {
    ElMessage.warning('当前浏览器不支持定位')
    return
  }
  navigator.geolocation.getCurrentPosition(
    () => {
      currentCity.value = '广州'
      ElMessage.success('定位成功，自动切换为本城路线【广州】')
    },
    () => {
      ElMessage.error('定位失败，请手动浏览')
    }
  )
}
// 跳转详情页
const goDetail = (id) => {
  router.push({ name: 'Detail', params: { id } })
}
// 排行榜序号样式
const rankClass = (num) => {
  if (num === 1) return 'rank-first'
  if (num === 2) return 'rank-second'
  if (num === 3) return 'rank-third'
  return ''
}

onMounted(() => {
  loadRouteList()
})
</script>
<style scoped>
.home-container {
  background: url('/pictures/city-bg.png') no-repeat center center;
  background-size: cover;
  background-attachment: fixed;
  min-height: 100vh;
  padding-bottom: 70px;
  position: relative;
}
.home-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.72);
  z-index: 0;
}
.home-header,
.banner-wrap,
.tag-scroll,
.section-title,
.route-list,
.empty-tip,
.rank-wrap,
.tab-bar {
  position: relative;
  z-index: 1;
}
/* 顶部搜索栏 */
.home-header {
  background: #fff;
  padding: 14px;
  display: flex;
  gap: 12px;
}
.tag-scroll {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding: 16px 14px;
  margin-bottom: 16px;
  background: transparent;
}
.tag-scroll :deep(.tag-item) {
  font-size: 22px;
  font-weight: 500;
  padding: 18px 25px;
  border-radius: 999px;
  white-space: nowrap;
  cursor: pointer;
}
.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 12px 14px;
}
/* 轮播 */
.banner-wrap {
  padding: 0 14px;
  margin-bottom: 12px;
}
.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}
.banner-text {
  position: absolute;
  left: 20px;
  bottom: 20px;
  color: #fff;
  font-size: 17px;
  font-weight: bold;
  text-shadow: 0 0 6px #333;
}
/* 路线卡片 */
.route-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  padding: 0 14px;
}
.route-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.card-img img {
  width: 100%;
  height: 250px;
  object-fit: cover;
}
.card-info {
  padding: 12px;
}
.route-name {
  font-size: 15px;
  font-weight: bold;
}
.route-meta {
  margin: 6px 0;
  color: #666;
  font-size: 13px;
  display: flex;
  gap: 12px;
}
.route-tags {
  margin: 6px 0;
}
.route-stats {
  color: #777;
  font-size: 13px;
  display: flex;
  gap: 16px;
}
.empty-tip {
  text-align: center;
  padding: 30px 0;
  color: #666;
}
/* 排行榜 */
.rank-wrap {
  background: #fff;
  margin: 0 14px 20px;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.rank-item {
  display: flex;
  align-items: center;
  padding: 10px 4px;
  border-bottom: 1px solid #f2f2f2;
  cursor: pointer;
}
.rank-item:last-child {
  border-bottom: none;
}
.rank-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 13px;
  margin-right: 10px;
  background: #999;
}
.rank-first {
  background: #f56c6c;
}
.rank-second {
  background: #e6a23c;
}
.rank-third {
  background: #67c23a;
}
.rank-name {
  font-weight: 500;
}
.rank-sub {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}

/* =========修复后的底部Tab【与Record/Publish/My完全一模一样】 ========= */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background: #fff;
  display: flex;
  border-top: 1px solid #eee;
  z-index: 99;
}
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #666;
  gap: 3px;
  cursor: pointer;
}
.tab-item.active {
  color: #409eff;
}
.tab-icon {
  font-size: 20px;
}
.blank-bottom {
  height: 70px;
}
</style>
