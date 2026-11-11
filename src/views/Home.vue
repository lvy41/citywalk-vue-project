<template>
  <div class="home-container">
    <!-- 首页顶部单一搜索框 -->
    <div class="search-bar" @click="openSearchPanel">
      <span class="search-icon">🔍</span>
      <span class="search-placeholder">搜索路线、地点、城市</span>
    </div>
    <!-- ========== 搜索弹窗 ========== -->
    <div class="mask" v-if="showSearchPanel" @click="closeSearchPanel"></div>
    <div class="search-panel" v-if="showSearchPanel">
      <!-- 顶部搜索栏 -->
      <div class="search-header-row">
        <el-button text @click="closeSearchPanel" class="back-icon">
          <span class="back-btn-style">＜</span>
        </el-button>
        <div class="search-input-wrap">
          <input
            ref="searchInputRef"
            v-model="searchText"
            type="text"
            placeholder="输入路线/地点/城市"
            @keyup.enter="onSearch"
          />
          <el-button type="primary" @click="onSearch" class="search-submit-btn">搜索</el-button>
        </div>
        <span class="cancel-text" @click="closeSearchPanel">取消</span>
      </div>
      <!-- Tab栏：历史搜索 / 国内城市 -->
      <div class="tab-header">
        <span
          class="tab-item"
          :class="{active:currentTab === 'history'}"
          @click="currentTab='history'"
        >历史搜索</span>
        <span
          class="tab-item"
          :class="{active:currentTab === 'city'}"
          @click="currentTab='city'"
        >国内城市</span>
      </div>
      <!-- Tab1：历史搜索 -->
      <div v-show="currentTab === 'history'" class="tab-content">
        <div class="history-header">
          <span class="title">历史搜索</span>
          <span class="clear-all" @click="clearAllHistory">清空全部</span>
        </div>
        <div class="history-list">
          <div class="history-item" v-for="(item, idx) in historyList" :key="idx">
            <span @click="selectHistory(item)">{{ item }}</span>
            <span class="del-icon" @click.stop="deleteOneHistory(idx)">🗑️</span>
          </div>
        </div>
      </div>
      <!-- Tab2：国内城市【字母栏放到右侧 + 新增热门城市】 -->
      <div v-show="currentTab === 'city'" class="tab-content city-tab">
        <div class="city-list-wrap" ref="cityListRef">
          <!-- =====新增热门城市区域===== -->
          <div class="hot-city-block">
            <div class="hot-city-title">热门城市</div>
            <div class="hot-city-row">
              <div
                class="hot-city-item"
                v-for="hotCity in hotCityList"
                :key="hotCity"
                @click="clickCity(hotCity)"
              >
                {{ hotCity }}
              </div>
            </div>
          </div>
          <!-- 原有字母分组城市列表 -->
          <div
            class="letter-group"
            v-for="group in allCityGroup"
            :key="group.letter"
            :ref="el=>{if(el) letterRefMap[group.letter]=el}"
          >
            <div class="letter-title">{{group.letter}}</div>
            <div class="city-item" v-for="city in group.list" :key="city" @click="clickCity(city)">
              {{city}}
            </div>
          </div>
        </div>
        <div class="letter-sidebar">
          <span
            v-for="g in allCityGroup"
            :key="g.letter"
            @click="scrollToLetter(g.letter)"
          >{{g.letter}}</span>
        </div>
      </div>
    </div>
    <!-- 轮播Banner -->
    <div class="banner-wrap">
      <div class="banner-item" v-for="(banner,idx) in bannerList" :key="idx" v-show="currentBannerIndex === idx">
        <img :src="banner.img" alt="">
        <div class="banner-text">{{banner.title}}</div>
      </div>
      <div class="banner-dots">
        <span v-for="(item,idx) in bannerList" :key="idx" :class="{active:currentBannerIndex===idx}" @click="currentBannerIndex=idx"></span>
      </div>
    </div>
    <!-- 热门排行榜：固定热度前5 -->
    <div class="rank-title">🔥热门排行榜</div>
    <div class="rank-wrap">
      <div
        class="rank-item"
        v-for="(item, idx) in rankList"
        :key="item.id"
        @click="goDetail(item.id)"
      >
        <span class="rank-num">{{ idx + 1 }}</span>
        <span class="rank-name">{{ item.name }}</span>
        <span class="rank-city">{{ item.city }} | 热度:{{ item.hot }}</span>
      </div>
    </div>
    <!-- 分类标签 -->
    <div class="tag-wrap">
      <span
        class="tag-item"
        v-for="tag in tagList"
        :key="tag"
        :class="{ active: activeTag === tag }"
        @click="activeTag = tag"
      >
        {{ tag }}
      </span>
    </div>
    <!-- 为你推荐路线 -->
    <div class="recommend-title">为你推荐路线</div>
    <div class="card-container">
      <div
        class="route-card"
        v-for="route in filterList"
        :key="route.id"
        @click="goDetail(route.id)"
      >
        <img class="card-img" :src="route.cover" alt="" />
        <div class="card-name">{{ route.name }}</div>
        <div class="card-info">{{ route.city }} · {{ route.duration }}</div>
        <div class="card-tags">
          <span class="tag-small" v-for="t in route.tags" :key="t">{{ t }}</span>
        </div>
        <div class="card-stat">
          <span class="like-btn-card" :class="{active:route.isLiked}" @click.stop="routeStore.toggleLike(route)">
            {{ route.isLiked ? '❤️' : '🤍' }} {{ route.likeNum }}
          </span>
          <span class="collect-btn-card" :class="{active:route.isCollected}" @click.stop="routeStore.toggleCollect(route)">
            {{ route.isCollected ? '⭐' : '☆' }} {{ route.starNum }}
          </span>
        </div>
      </div>
    </div>
    <!-- 底部导航栏 -->
    <div class="tab-bar">
      <div class="tab-item" @click="$router.push('/home')" :class="{active:$route.path==='/home'}">
        <div>🏠</div>
        <div>首页</div>
      </div>
      <div class="tab-item" @click="$router.push('/map')" :class="{active:$route.path==='/map'}">
        <div>🗺️</div>
        <div>探索地图</div>
      </div>
      <div class="tab-item" @click="$router.push('/publish')" :class="{active:$route.path==='/publish'}">
        <div>✏️</div>
        <div>发布路线</div>
      </div>
      <div class="tab-item" @click="$router.push('/my')" :class="{active:$route.path==='/my'}">
        <div>👤</div>
        <div>我的</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useRouteStore } from '@/store/routeStore'
import request from '@/utils/request'
const router = useRouter()
const route = useRoute()
const routeStore = useRouteStore()

const searchInputRef = ref(null)
const cityListRef = ref(null)
const letterRefMap = reactive({})

// 弹窗状态
const showSearchPanel = ref(false)
const searchText = ref('')
const currentTab = ref('history')

// ✅新增：热门城市列表，共6个，包含广州
const hotCityList = ref(['广州', '成都', '长沙', '南京', '上海', '厦门'])

// 历史搜索 localStorage持久化
const HIST_KEY = 'search_city_history'
const historyList = ref(JSON.parse(localStorage.getItem(HIST_KEY)) || [])
const saveHistoryStorage = ()=>{
  localStorage.setItem(HIST_KEY, JSON.stringify(historyList.value))
}

// ========= 城市分组数据 =========
const allCityGroup = ref([
  { letter:'A', list:['阿坝','阿城区','阿克苏','阿拉尔','阿拉善盟'] },
  { letter:'B', list:['北京','保定','包头','巴彦淖尔','白山'] },
  { letter:'C', list:['成都','重庆','长沙','常州','沧州'] },
  { letter:'D', list:['达拉特旗','达州','大安市','大厂回族自治县','大丰','大理','大连','大庆','大同'] },
  { letter:'F', list:['福州','佛山','阜阳','抚顺'] },
  { letter:'G', list:['广州','贵阳','桂林','赣州','广元'] },
  { letter:'H', list:['杭州','合肥','海口','哈尔滨','惠州'] },
  { letter:'J', list:['济南','嘉兴','金华','九江','荆州'] },
  { letter:'K', list:['昆明','开封','喀什'] },
  { letter:'L', list:['洛阳','丽江','拉萨','兰州','连云港'] },
  { letter:'M', list:['马鞍山','茂名','梅州'] },
  { letter:'N', list:['南京','宁波','南宁','南昌'] },
  { letter:'P', list:['莆田','盘锦','平顶山'] },
  { letter:'Q', list:['青岛','泉州','衢州','秦皇岛'] },
  { letter:'R', list:['日照','日喀则'] },
  { letter:'S', list:['上海','苏州','三亚','汕头','邵阳'] },
  { letter:'T', list:['天津','太原','唐山','泰安','台州'] },
  { letter:'W', list:['武汉','无锡','威海','潍坊','温州'] },
  { letter:'X', list:['西安','厦门','襄阳','孝感','西宁'] },
  { letter:'Y', list:['烟台','扬州','盐城','银川','宜宾'] },
  { letter:'Z', list:['郑州','珠海','漳州','湛江','淄博'] },
])

// 打开关闭弹窗
const openSearchPanel = async ()=>{
  showSearchPanel.value = true
  currentTab.value = 'history'
  await nextTick()
  searchInputRef.value?.focus()
}
const closeSearchPanel = ()=>{
  showSearchPanel.value = false
}

// 添加历史记录
const addHistoryItem = (kw)=>{
  const trimKw = kw.trim()
  if(!trimKw) return
  const idx = historyList.value.findIndex(item=>item === trimKw)
  if(idx !== -1) historyList.value.splice(idx,1)
  historyList.value.unshift(trimKw)
  if(historyList.value.length>8) historyList.value.pop()
  saveHistoryStorage()
}
// 删除单条历史
const deleteOneHistory = (index)=>{
  historyList.value.splice(index,1)
  saveHistoryStorage()
}
// 清空全部历史
const clearAllHistory = ()=>{
  historyList.value = []
  saveHistoryStorage()
}

// 点击历史项
const selectHistory = (cityName)=>{
  goJumpCity(cityName)
}
// 点击国内城市列表项 / 热门城市项
const clickCity = (cityName)=>{
  goJumpCity(cityName)
}
// 输入框搜索
const onSearch = ()=>{
  const kw = searchText.value.trim()
  if(!kw) return
  goJumpCity(kw)
}

// ✅ 使用命名路由，params参数名 cityName 和router/index.js保持一致
const goJumpCity = (cityName)=>{
  addHistoryItem(cityName)
  closeSearchPanel()
  searchText.value = ''
  router.push({
    name: 'CityRoute',
    params: {
      cityName: cityName
    },
    query: { fromSearch: 'true' }
  })
}

// 字母滚动定位
const scrollToLetter = (letter)=>{
  const dom = letterRefMap[letter]
  if(dom && cityListRef.value){
    cityListRef.value.scrollTop = dom.offsetTop
  }
}

// 轮播
const bannerList = ref([
  { img:'/pictures/11.jpg', title:'老城区一日漫步' },
  { img:'/pictures/22.jpg', title:'江边夜景路线' },
  { img:'/pictures/33.jpg', title:'文艺街巷打卡之旅' }
])
const currentBannerIndex = ref(0)
let bannerTimer = null
const autoBanner = ()=>{
  bannerTimer = setInterval(()=>{
    currentBannerIndex.value = (currentBannerIndex.value +1) % bannerList.value.length
  },3000)
}
onMounted(()=>autoBanner())
onUnmounted(()=>clearInterval(bannerTimer))

// ========== 真实路线数据：来自后端 /route/list（只含已公开 + 审核通过的路线） ==========
const apiRoutes = ref([])
const loadingRoutes = ref(false)

const toCardItem = (r) => ({
  id: r.id,
  name: r.routeName,
  city: r.city,
  duration: r.duration || '',
  cover: r.coverImage && r.coverImage !== 'xxx'
    ? r.coverImage
    : `https://picsum.photos/seed/cw${r.id}/600/400`,
  tags: (r.tags || []).map(t => t.tagName),
  likeNum: r.likeCount || 0,
  starNum: r.collectCount || 0,
  isLiked: false,
  isCollected: false,
  hot: (r.likeCount || 0) * 3 + (r.collectCount || 0),
  onlyCityPage: false
})

const loadRouteList = async () => {
  loadingRoutes.value = true
  try {
    const res = await request.get('/route/list')
    const arr = res && res.code === 200 && Array.isArray(res.data) ? res.data : []
    apiRoutes.value = arr.map(toCardItem)
  } catch (e) {
    apiRoutes.value = []
    ElMessage.error('路线加载失败，请确认后端已启动')
  } finally {
    loadingRoutes.value = false
  }
}
onMounted(() => {
  loadRouteList()
  loadTagList()
})

// 跳转详情
const goDetail = (id) => {
  router.push({
    name: 'Detail',
    params: { id }
  })
}

// ✅排行榜：用后端真实数据，按热度排序取前 5
const rankList = computed(() => {
  return [...apiRoutes.value]
    .filter(item => !item.onlyCityPage)
    .sort((a, b) => b.hot - a.hot).slice(0, 5)
})
const activeTag = ref('全部')

// 标签来自后端 tag 表，管理员在后台可增删改，首页自动同步
const tagOptions = ref([])
const tagList = computed(() => ['全部', ...tagOptions.value])

const loadTagList = async () => {
  try {
    const res = await request.get('/tag/list')
    if (res && res.code === 200 && Array.isArray(res.data)) {
      tagOptions.value = res.data.map(t => t.tagName)
    }
  } catch (e) {
    tagOptions.value = []
  }
}

// ✅【全部标签展示全部路线，其他标签按路线真实标签过滤】
const filterList = computed(() => {
  let arr = [...apiRoutes.value]
  if (activeTag.value !== '全部') {
    arr = arr.filter(i => i.tags.includes(activeTag.value))
  }
  // 搜索过滤
  const kw = searchText.value.trim().toLowerCase()
  if (kw) {
    arr = arr.filter(i =>
      i.name.toLowerCase().includes(kw) || i.tags.some(t => t.includes(kw))
    )
  }
  return arr
})

// 监听query参数：只有fromSearch=true才自动打开搜索弹窗
watch(()=>route.query.fromSearch, (val)=>{
  if(val === 'true'){
    nextTick(()=>{
      openSearchPanel()
    })
  }
},{immediate:true})
</script>

<style scoped>
.home-container {
  padding: 16px;
  padding-bottom: 70px;
  background: linear-gradient(180deg, #ffdfd0, #fff7f0);
  min-height: 100vh;
  box-sizing: border-box;
}
.search-bar {
  display:flex;
  align-items:center;
  gap:8px;
  background:#fff;
  padding:10px 14px;
  border-radius:24px;
  margin-bottom:12px;
}
.search-icon{
  font-size:16px;
}
.search-placeholder {
  color:#aaa;
  font-size:14px;
}
.mask{
  position:fixed;
  left:0;top:0;right:0;bottom:0;
  background:rgba(0,0,0,0.4);
  z-index:99;
}
.search-panel{
  position:fixed;
  left:0;
  top:0;
  width:100%;
  height:100%;
  background:#fff;
  z-index:100;
  box-sizing:border-box;
  display:flex;
  flex-direction:column;
}
.search-header-row{
  display:flex;
  align-items:center;
  gap:8px;
  padding:12px 16px;
}
.back-icon{
  padding: 6px 4px !important;
}
.back-btn-style{
  color:#ff6b35;
  font-size:17px;
  font-weight:500;
}
.search-input-wrap{
  flex:1;
  display:flex;
  gap:6px;
  align-items:center;
}
.search-input-wrap input{
  flex:1;
  border:1px solid #ddd;
  border-radius:8px;
  padding:9px 12px;
  font-size:15px;
}
.search-submit-btn{
  background-color:#ff6b35;
  border-color:#ff6b35;
}
.cancel-text{
  color:#666;
  font-size:15px;
  cursor:pointer;
  white-space:nowrap;
}
/* Tab 两个标签，橙色主题 */
.tab-header{
  display:flex;
  border-bottom:1px solid #eee;
}
.tab-header .tab-item{
  flex:1;
  text-align:center;
  padding:10px 0;
  font-size:15px;
  cursor:pointer;
  position:relative;
  color:#777;
}
.tab-header .tab-item.active{
  color:#ff6b35;
  font-weight:500;
}
.tab-header .tab-item.active::after{
  content:"";
  position:absolute;
  bottom:0;
  left:0;
  width:100%;
  height:2px;
  background:#ff6b35;
}
.tab-content{
  flex:1;
  overflow-y:auto;
  padding:16px;
}
/* 历史搜索面板 */
.history-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:10px;
}
.title{
  font-size:15px;
  color:#333;
  font-weight:500;
}
.clear-all{
  font-size:13px;
  color:#999;
  cursor:pointer;
}
.history-item{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:10px 0;
  border-bottom:1px solid #f4f4f4;
  font-size:14px;
}
.del-icon{
  color:#999;
  cursor:pointer;
}
/* 国内城市tab：【字母栏放到右侧】 */
.city-tab{
  display:flex;
  padding:0;
  flex-direction: row;
}
.letter-sidebar{
  width:30px;
  background:#f8f8f8;
  display:flex;
  flex-direction:column;
  align-items:center;
  padding:4px 0;
  font-size:12px;
  color:#666;
}
.letter-sidebar span{
  padding:3px 0;
  cursor:pointer;
}
.city-list-wrap{
  flex:1;
  overflow-y:auto;
  padding:10px 12px;
}
/* =====新增热门城市样式===== */
.hot-city-block{
  margin-bottom:16px;
  padding-bottom:12px;
  border-bottom:1px solid #eeeeee;
}
.hot-city-title{
  font-size:14px;
  color:#666;
  margin-bottom:10px;
}
.hot-city-row{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
}
.hot-city-item{
  padding:7px 14px;
  background:#f7f7f7;
  border-radius:6px;
  font-size:14px;
  color:#333;
  cursor:pointer;
}
.hot-city-item:active{
  background:#eaeaea;
}

.letter-title{
  font-size:14px;
  color:#888;
  margin:8px 0 4px;
}
.city-item{
  padding:8px 0;
  border-bottom:1px solid #f5f5f5;
  font-size:14px;
  cursor:pointer;
}
/* 下方首页原有样式 */
.banner-wrap {
  position: relative;
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom:12px;
}
.banner-item img{
  width:100%;
  height:160px;
  object-fit:cover;
}
.banner-text {
  position:absolute;
  left:12px;
  bottom:12px;
  color:white;
  font-weight:bold;
}
.banner-dots{
  position:absolute;
  bottom:8px;
  right:12px;
  display:flex;
  gap:6px;
}
.banner-dots span{
  width:8px;
  height:8px;
  border-radius:50%;
  background:rgba(255,255,255,0.5);
  cursor:pointer;
}
.banner-dots span.active{
  background:#fff;
}
.rank-title {
  font-size:16px;
  font-weight:bold;
  margin:10px 0 6px;
}
.rank-wrap {
  background: rgba(255,255,255,0.75);
  border-radius:12px;
  padding:10px;
  margin-bottom:14px;
}
.rank-item {
  display:flex;
  align-items:center;
  padding:6px 0;
  cursor:pointer;
}
.rank-num {
  width:22px;
  height:22px;
  border-radius:50%;
  background:#ff9b6a;
  color:white;
  display:flex;
  align-items:center;
  justify-content:center;
  margin-right:8px;
  font-size:12px;
}
.rank-name {
  flex:1;
}
.rank-city {
  color:#777;
  font-size:12px;
}
.tag-wrap {
  display:flex;
  gap:8px;
  overflow-x:auto;
  margin:12px 0;
}
.tag-item {
  padding:6px 12px;
  background:rgba(255,255,255,0.7);
  border-radius:20px;
  font-size:14px;
  cursor:pointer;
  white-space:nowrap;
}
.tag-item.active {
  background:#ff9b6a;
  color:#fff;
}
.recommend-title {
  font-size:16px;
  font-weight:bold;
  margin:12px 0 8px;
}
.card-container {
  display:grid;
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
.tab-bar{
  position:fixed;
  left:0;
  bottom:0;
  width:100%;
  height:60px;
  background:#fff;
  display:flex;
  border-top:1px solid #f3d7c6;
}
.tab-item{
  flex:1;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  font-size:12px;
  color:#888;
  cursor:pointer;
}
.tab-item.active{
  color:#ff9b6a;
}
</style>
