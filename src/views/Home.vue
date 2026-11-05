<template>
  <div class="home-container">
    <!-- 顶部搜索栏，外层白色背景，和Map页面header统一 -->
    <div class="home-header">
      <el-input
        v-model="searchKey"
        placeholder="搜索路线、地点、标签"
        prefix-icon="Search"
        @keyup.enter="handleSearch"
      ></el-input>
      <el-button type="primary" @click="getLocation">定位</el-button>
    </div>
    <!-- 横向分类标签 -->
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
    <!-- 推荐路线标题 -->
    <div class="section-title">为你推荐路线</div>
    <!-- 路线卡片列表：一行2个横向排布 -->
    <div class="route-list">
      <div class="route-card" v-for="route in routeList" :key="route.id" @click="goDetail(route.id)">
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
    <!-- ========== 新版底部Tab导航 ========== -->
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
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
// 搜索关键词
const searchKey = ref('')
// 当前选中标签
const activeTag = ref('全部')
// 标签模拟数据
const tagList = ref(['全部', '老街', '美食', '博物馆', '公园', '夜景', '短途徒步'])
// 路线模拟假数据，一共4条，图片路径指向public/pictures
const routeList = ref([
  {
    id: 1,
    name: '老城街巷漫步路线',
    city: '广州',
    duration: '2小时',
    cover: '/pictures/1.png',
    tags: ['老街', '人文'],
    likeNum: 128,
    collectNum: 66
  },
  {
    id: 2,
    name: '珠江夜景散步',
    city: '广州',
    duration: '1.5小时',
    cover: '/pictures/2.png',
    tags: ['夜景'],
    likeNum: 256,
    collectNum: 120
  },
  {
    id: 3,
    name: '东山口文艺打卡线',
    city: '广州',
    duration: '3小时',
    cover: '/pictures/3.png',
    tags: ['美食', '文艺'],
    likeNum: 310,
    collectNum: 189
  },
  {
    id: 4,
    name: '越秀公园休闲徒步',
    city: '广州',
    duration: '2.5小时',
    cover: '/pictures/4.png',
    tags: ['公园','短途徒步'],
    likeNum: 196,
    collectNum: 92
  }
])
// 标签点击筛选
const handleTagClick = (tag) => {
  activeTag.value = tag
  console.log('选中标签：', tag)
}
// 搜索
const handleSearch = () => {
  console.log('搜索内容：', searchKey.value)
}
// 获取定位
const getLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((res) => {
      console.log('定位成功', res.coords)
    })
  }
}
// 跳转到详情页
const goDetail = (id) => {
  router.push({ path: '/detail', query: { id } })
}
</script>
<style scoped>
.home-container {
  background-color: #f7f8fa;
  min-height: 100vh;
  padding-bottom:70px;
}
/* 顶部header白色背景，和Map页面header完全一致 */
.home-header {
  background:#fff;
  padding:14px;
  display: flex;
  gap:12px;
}
.tag-scroll{
  background:#fff;
  display:flex;
  gap:8px;
  overflow-x:auto;
  padding:6px 14px;
  margin-bottom:16px;
}
.section-title{
  font-size:18px;
  font-weight:bold;
  margin:12px 14px;
}
/* 关键：网格布局，一行2个卡片 */
.route-list{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap:14px;
  padding:0 14px;
}
.route-card{
  background:#fff;
  border-radius:12px;
  overflow:hidden;
}
/* 图片高度保留250px */
.card-img img{
  width:100%;
  height:250px;
  object-fit:cover;
}
.card-info{
  padding:12px;
}
.route-name{
  font-size:15px;
  font-weight:bold;
}
.route-meta{
  margin:6px 0;
  color:#666;
  font-size:13px;
  display:flex;
  gap:12px;
}
.route-tags{
  margin:6px 0;
}
.route-stats{
  color:#777;
  font-size:13px;
  display:flex;
  gap:16px;
}
/* ==========新版底部Tab栏样式【Home和Map共用一套】========== */
.tab-bar{
  position:fixed;
  bottom:0;
  left:0;
  width:100%;
  height:64px;
  background:#ffffff;
  display:flex;
  border-top:1px solid #e8e8e8;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.04);
  z-index: 999;
}
.tab-item{
  flex:1;
  display:flex;
  flex-direction: column;
  justify-content:center;
  align-items:center;
  gap:3px;
  font-size:12px;
  color:#868686;
  cursor: pointer;
}
.tab-icon{
  font-size:20px;
}
.tab-item.active{
  color:#409eff;
}
.blank-bottom{
  height:70px;
}
</style>
