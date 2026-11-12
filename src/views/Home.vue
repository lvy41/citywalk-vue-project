<template>
  <div class="home-container">
    <!-- 顶部：城市选择 + 搜索框同一行并排 -->
    <div class="top-row">
      <div class="city-picker" @click="openCityPicker">
        <span class="city-pin">📍</span>
        <span class="city-name">{{ currentCity ? currentCity.label : (locating ? '定位中…' : '选择城市') }}</span>
        <span class="city-caret">▾</span>
        <span v-if="currentCity" class="city-reset" @click.stop="clearCityFilter">×</span>
      </div>
      <div class="search-bar" @click="openSearchPanel">
        <span class="search-icon">🔍</span>
        <span class="search-placeholder">搜索路线、地点、城市</span>
      </div>
    </div>
    <!-- ========== 搜索弹窗 ========== -->
    <div class="mask" v-if="showSearchPanel" @click="closeSearchPanel"></div>
    <div class="search-panel" v-if="showSearchPanel">
      <!-- 顶部搜索栏 -->
      <div class="search-header-row">
        <el-button text @click="closeSearchPanel" class="back-icon">
          <el-icon class="back-chevron"><ArrowLeft /></el-icon>
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
      <!-- Tab2：国内城市【数据来自数据库 /area/tree，单列下钻 + 拼音排序 + 右侧字母索引】 -->
      <div v-show="currentTab === 'city'" class="tab-content city-tab">
        <div class="city-main">
        <!-- 面包屑：和 Map 的地区选择一致的逐级下钻 -->
        <div class="city-breadcrumb">
          <span :class="{current: areaLevel === 0}" @click="backToLevel(0)">全部省份</span>
          <template v-if="areaLevel >= 1 && tempProvince">
            <span class="crumb-sep">›</span>
            <span :class="{current: areaLevel === 1}" @click="backToLevel(1)">{{ tempProvince.label }}</span>
          </template>
          <template v-if="areaLevel >= 2 && tempCity">
            <span class="crumb-sep">›</span>
            <span class="current">{{ tempCity.label }}</span>
          </template>
          <span class="city-see-all" v-if="areaLevel >= 1" @click="jumpCurrentCity">
            看 {{ areaLevel >= 2 ? tempCity.label : tempProvince.label }} 全部路线 ›
          </span>
        </div>
        <!-- 热门城市：取库里首页已加载路线出现过的城市 -->
        <div class="hot-city-block" v-if="areaLevel === 0 && hotCityList.length">
          <div class="hot-city-title">热门城市</div>
          <div class="hot-city-row">
            <div
              class="hot-city-item"
              v-for="hotCity in hotCityList"
              :key="hotCity"
              @click="clickCity(hotCity)"
            >{{ hotCity }}</div>
          </div>
        </div>
        <div class="city-list-wrap" ref="cityListRef">
          <div
            class="letter-group"
            v-for="group in cityGroups"
            :key="group.letter"
            :ref="el=>{if(el) letterRefMap[group.letter]=el}"
          >
            <div class="letter-title">{{group.letter}}</div>
            <div
              class="city-item city-row"
              v-for="item in group.list"
              :key="item.id || item.label"
              @click="clickAreaRow(item)"
            >
              <span class="city-row-name">{{ item.label }}</span>
              <span class="city-row-arrow" v-if="hasCityChildren(item)">›</span>
            </div>
          </div>
          <div v-if="!currentCityList.length" class="city-empty">地区数据加载中…</div>
        </div>
        </div>
        <div
          class="letter-sidebar"
          v-if="cityLetters.length"
          @touchstart.prevent="onIndexTouch($event)"
          @touchmove.prevent="onIndexTouch($event)"
          @touchend="onIndexTouchEnd"
        >
          <span
            v-for="letter in cityLetters"
            :key="letter"
            @click.stop="scrollToCityLetter(letter)"
          >{{ letter }}</span>
        </div>
      </div>
    </div>
    <!-- 轮播Banner -->
    <div class="banner-wrap">
      <div
        class="banner-item"
        v-for="(banner,idx) in bannerList"
        :key="idx"
        v-show="currentBannerIndex === idx"
        @click="goDetail(banner.routeId)"
      >
        <img :src="banner.img" alt="">
        <div class="banner-text">{{banner.title}}</div>
        <div class="banner-enter">查看路线 ›</div>
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
        <img class="card-img" :src="route.cover" alt="" @error="onCoverError($event)" />
        <div class="card-name">{{ route.name }}</div>
        <div class="card-info">{{ route.city }} · {{ route.duration }}</div>
        <div class="card-tags">
          <span class="tag-small" v-for="t in route.tags" :key="t">{{ t }}</span>
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
      <div class="list-tip" v-if="loading">加载中…</div>
      <div class="list-tip" v-else-if="!filterList.length">这个分类下暂时没有路线</div>
      <div class="list-tip" v-else-if="!hasMore && filterList.length">没有更多了</div>
    </div>
    <!-- 底部导航栏：与 Map.vue 完全一致的 5 个入口 -->
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { pinyin } from 'pinyin-pro'
import { getRouteListAPI, likeRouteAPI, unlikeRouteAPI } from '@/api/route'
import { getAreaTreeAPI } from '@/api/map'
import { load } from '@amap/amap-jsapi-loader'
const router = useRouter()
const route = useRoute()

const searchInputRef = ref(null)
const cityListRef = ref(null)
const letterRefMap = reactive({})

// 弹窗状态
const showSearchPanel = ref(false)
const searchText = ref('')
const currentTab = ref('history')

// 历史搜索 localStorage持久化
const HIST_KEY = 'search_city_history'
const historyList = ref(JSON.parse(localStorage.getItem(HIST_KEY)) || [])
const saveHistoryStorage = ()=>{
  localStorage.setItem(HIST_KEY, JSON.stringify(historyList.value))
}

// ========= 国内城市：数据来自数据库 /area/tree（省 → 市 → 区县，单列下钻） =========
const areaTree = ref([])          // 所有省份（含 children）
const areaLevel = ref(0)          // 0=省 1=市 2=区县
const tempProvince = ref(null)
const tempCity = ref(null)
const areaLoaded = ref(false)

const sortByPinyin = (list = []) =>
  [...list].sort((a, b) => String(a.label || '').localeCompare(String(b.label || ''), 'zh-Hans-CN'))

// 当前层级要展示的列表
const currentCityList = computed(() => {
  if (areaLevel.value === 0) return sortByPinyin(areaTree.value)
  if (areaLevel.value === 1) return sortByPinyin(tempProvince.value?.children || [])
  if (areaLevel.value === 2) return sortByPinyin(tempCity.value?.children || [])
  return []
})

// 首字母：用 pinyin-pro 取每个名字前两字的拼音首字母
const getInitial = (name = '') => {
  const first = pinyin(name.trim().slice(0, 2), { pattern: 'first', toneType: 'none', type: 'array' })[0] || ''
  const letter = first.charAt(0).toUpperCase()
  return /[A-Z]/.test(letter) ? letter : '#'
}

const cityGroups = computed(() => {
  const groups = {}
  currentCityList.value.forEach(item => {
    const letter = getInitial(item.label)
    if (!groups[letter]) groups[letter] = []
    groups[letter].push(item)
  })
  return Object.keys(groups).sort().map(letter => ({ letter, list: groups[letter] }))
})

const cityLetters = computed(() => cityGroups.value.map(g => g.letter))
const hasCityChildren = (item) => !!(item && item.children && item.children.length)

// 加载地区树（省份 → 城市 → 区县），字段名统一成 label
const loadAreaTree = async () => {
  if (areaLoaded.value) return
  try {
    const res = await getAreaTreeAPI()
    if (res && res.code === 200 && Array.isArray(res.data)) {
      const walk = (list) => {
        list.forEach(item => {
          item.label = item.provinceName || item.cityName || item.districtName || '未知地区'
          if (item.children && item.children.length) walk(item.children)
        })
      }
      walk(res.data)
      areaTree.value = res.data
      areaLoaded.value = true
    }
  } catch (e) {
    ElMessage.warning('地区数据加载失败，请确认后端已启动')
  }
}

// 点列表项：省份/城市有下级就下钻，区县或末级城市直接跳城市路线
const clickAreaRow = (item) => {
  if (areaLevel.value === 0) {
    tempProvince.value = item
    tempCity.value = null
    if (hasCityChildren(item)) {
      areaLevel.value = 1
      resetCityScroll()
    } else {
      clickCity(item.label)
    }
    return
  }
  if (areaLevel.value === 1) {
    tempCity.value = item
    // 选城市模式：点城市就直接筛选首页，不再往下钻区县
    if (panelMode.value === 'pick') {
      clickCity(item.label)
      return
    }
    if (hasCityChildren(item)) {
      areaLevel.value = 2
      resetCityScroll()
    } else {
      clickCity(item.label)
    }
    return
  }
  // 区县：跳到所属城市（CityRoute 目前按城市名筛选）
  clickCity(tempCity.value?.label || item.label)
}

const backToLevel = (level) => {
  areaLevel.value = level
  if (level === 0) {
    tempProvince.value = null
    tempCity.value = null
  }
  if (level === 1) tempCity.value = null
  resetCityScroll()
}

const jumpCurrentCity = () => {
  const name = areaLevel.value >= 2 ? tempCity.value?.label : tempProvince.value?.label
  if (name) clickCity(name)
}

// 切层级后列表回到顶部
const resetCityScroll = () => {
  lastLetterIdx = -1
  nextTick(() => {
    if (cityListRef.value) cityListRef.value.scrollTop = 0
  })
}

// 热门城市：取首页已加载路线里出现过的城市，库里有路线才会出现
const hotCityList = computed(() => {
  const names = []
  routeRows.value.forEach(r => {
    if (r.city && !names.includes(r.city)) names.push(r.city)
  })
  return names.slice(0, 6)
})

// 打开关闭弹窗
const openSearchPanel = async ()=>{
  panelMode.value = 'search'
  showSearchPanel.value = true
  currentTab.value = 'history'
  await nextTick()
  searchInputRef.value?.focus()
  // 提前把地区树拉下来，切到“国内城市”时不用等
  loadAreaTree()
}
// 点顶部城市胶囊：直接打开“国内城市”列表，选中的城市只用于筛选首页，不跳页
const openCityPicker = async ()=>{
  panelMode.value = 'pick'
  showSearchPanel.value = true
  currentTab.value = 'city'
  areaLevel.value = 0
  tempProvince.value = null
  tempCity.value = null
  await nextTick()
  resetCityScroll()
  loadAreaTree()
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

// 搜索面板有两种用途：search=按关键词找路线；pick=给首页选城市（不跳页，只筛选首页列表）
const panelMode = ref('search')

// 点击国内城市列表项 / 热门城市项
const clickCity = async (cityName)=>{
  if (panelMode.value === 'pick') {
    await applyCityFilter(cityName)
    return
  }
  goJumpCity(cityName)
}

// 在地区树里按城市名找节点（名称可能带/不带“市”）
const findCityNode = (cityName) => {
  const target = normalizeArea(cityName)
  for (const province of areaTree.value) {
    for (const city of province.children || []) {
      if (city.label === cityName || normalizeArea(city.label) === target) {
        return { province, city }
      }
    }
  }
  return null
}

// 把某个城市设为首页筛选条件
const applyCityFilter = async (cityName) => {
  await loadAreaTree()
  const found = findCityNode(cityName)
  if (!found) {
    // 库里没这个城市节点时兜底按城市名查（keyword）
    currentCity.value = { label: cityName, cityId: null, provinceLabel: '', districtLabel: '' }
  } else {
    currentCity.value = {
      label: found.city.label,
      cityId: found.city.id,
      provinceLabel: found.province.label,
      districtLabel: ''
    }
  }
  localStorage.setItem('citywalk_current_city', JSON.stringify(currentCity.value))
  closeSearchPanel()
  await loadRoutes(true)
}

// 取消城市筛选，回到全国
const clearCityFilter = async () => {
  currentCity.value = null
  localStorage.removeItem('citywalk_current_city')
  await loadRoutes(true)
}
// 输入框搜索：先在地区树里把输入解析成真实城市，再把城市名传下去
// 否则输入“广东”这种省名会查不到任何路线（库里 city 存的是“广州市”这种市名）
const normalizeArea = (name = '') =>
  String(name).replace(/[省市自治区特别行政区]/g, '').trim()

const resolveAreaByKeyword = (kw) => {
  const target = normalizeArea(kw)
  if (!target) return null
  let containsCity = null
  let containsDistrict = null
  let containsProvince = null
  for (const province of areaTree.value) {
    if (normalizeArea(province.label) === target) return { type: 'province', item: province }
    if (!containsProvince && normalizeArea(province.label).includes(target)) containsProvince = province
    for (const city of province.children || []) {
      if (normalizeArea(city.label) === target || city.label === kw) {
        return { type: 'city', name: city.label }
      }
      if (!containsCity && normalizeArea(city.label).includes(target)) containsCity = city
      for (const district of city.children || []) {
        if (normalizeArea(district.label) === target || district.label === kw) {
          return { type: 'city', name: city.label }
        }
        if (!containsDistrict && normalizeArea(district.label).includes(target)) {
          containsDistrict = city
        }
      }
    }
  }
  if (containsCity) return { type: 'city', name: containsCity.label }
  if (containsDistrict) return { type: 'city', name: containsDistrict.label }
  if (containsProvince) return { type: 'province', item: containsProvince }
  return null
}

const onSearch = async ()=>{
  const kw = searchText.value.trim()
  if(!kw) return
  await loadAreaTree()
  const matched = resolveAreaByKeyword(kw)
  if (matched && matched.type === 'province') {
    // 只搜到省份：不跳空页面，直接把这个省的市列表展开给用户
    currentTab.value = 'city'
    areaLevel.value = 1
    tempProvince.value = matched.item
    tempCity.value = null
    resetCityScroll()
    return
  }
  if (matched && matched.type === 'city') {
    goJumpCity(matched.name)
    return
  }
  // 地区树里没有，按路线/地点关键词直接查库
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

// 字母滚动定位：用 rect 差值算，不受嵌套定位影响
let lastLetterIdx = -1
const scrollToCityLetter = (letter) => {
  const el = letterRefMap[letter]
  const list = cityListRef.value
  if (!el || !list) return
  const offset = el.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop
  list.scrollTop = Math.max(0, offset)
}

// 右侧字母栏按住拖动连续定位（微信通讯录那种手感）
const locateCityByPointerY = (clientY, rect) => {
  const total = cityLetters.value.length
  if (!total) return
  const step = rect.height / total
  const idx = Math.min(total - 1, Math.max(0, Math.floor((clientY - rect.top) / step)))
  if (idx !== lastLetterIdx) {
    lastLetterIdx = idx
    scrollToCityLetter(cityLetters.value[idx])
  }
}
const onIndexTouch = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  locateCityByPointerY(e.touches[0].clientY, rect)
}
const onIndexTouchEnd = () => {
  lastLetterIdx = -1
}

// 轮播
const bannerList = ref([
  { img:'/pictures/11.jpg', title:'老城区一日漫步', routeId: 1 },
  { img:'/pictures/22.jpg', title:'江边夜景路线', routeId: 10 },
  { img:'/pictures/33.jpg', title:'文艺街巷打卡之旅', routeId: 7 }
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

// 跳转详情
const goDetail = (id) => {
  if (!id) {
    ElMessage.warning('这条路线暂时没有详情数据')
    return
  }
  router.push({
    name: 'Detail',
    params: { id }
  })
}

// ✅ 首页路线改为读数据库：分页接口 /route/list，滚动到底自动加载下一页
const PAGE_SIZE = 10
const routeRows = ref([])     // 已加载的路线
const page = ref(0)           // 已加载页数
const hasMore = ref(true)
const loading = ref(false)
const activeTag = ref('全部')
const tagList = ['全部', '老街', '美食', '人文', '公园', '夜景']

// 后端字段 → 页面字段
const mapRoute = (r) => ({
  id: r.id,
  name: r.routeName,
  city: r.city,
  duration: r.duration,
  cover: r.coverImage || '/pictures/Myback.jpg',
  tags: [],
  likeNum: r.likeCount || 0,
  starNum: r.collectCount || 0,
  isLiked: false,
  isCollected: false
})

// 加载中又要 reset 时先记下，等当前请求结束再重来，避免条件切换后列表是旧数据
let pendingReset = false

const loadRoutes = async (reset = false) => {
  if (loading.value) {
    if (reset) pendingReset = true
    return
  }
  if (!reset && !hasMore.value) return
  if (reset) {
    routeRows.value = []
    page.value = 0
    hasMore.value = true
  }
  loading.value = true
  try {
    const res = await getRouteListAPI({
      page: page.value + 1,
      size: PAGE_SIZE,
      tag: activeTag.value === '全部' ? undefined : activeTag.value,
      cityId: currentCity.value?.cityId || undefined
    })
    const list = res.code === 200 && Array.isArray(res.data) ? res.data : []
    routeRows.value = routeRows.value.concat(list.map(mapRoute))
    page.value += 1
    hasMore.value = list.length === PAGE_SIZE
  } catch (e) {
    hasMore.value = false
    if (page.value === 0) ElMessage.warning('路线加载失败，请确认后端已启动')
  } finally {
    loading.value = false
    if (pendingReset) {
      pendingReset = false
      loadRoutes(true)
    }
  }
}

// 封面图加载失败时退回默认图，避免卡片出现破图图标
const onCoverError = (e) => {
  const img = e.target
  if (img && img.dataset.fallback === '1') return
  if (img) { img.dataset.fallback = '1'; img.src = '/pictures/Myback.jpg' }
}

// 触底加载
const onScrollLoad = () => {
  const gap = document.body.scrollHeight - window.scrollY - window.innerHeight
  if (gap < 200) loadRoutes()
}

// ✅排行榜：按点赞数取前 5（带上 id，点击才能跳详情）
const rankList = computed(() =>
  [...routeRows.value]
    .sort((a, b) => b.likeNum - a.likeNum)
    .slice(0, 5)
    .map(i => ({ id: i.id, name: i.name, city: i.city, hot: i.likeNum }))
)

// ✅分类标签：标签由后端筛选，关键词在前端兜底过滤
const filterList = computed(() => {
  const kw = searchText.value.trim().toLowerCase()
  if (!kw) return routeRows.value
  return routeRows.value.filter(i =>
    (i.name || '').toLowerCase().includes(kw) || (i.city || '').toLowerCase().includes(kw)
  )
})

// 点赞 / 取消点赞（真实接口）
const toggleLike = async (item) => {
  try {
    const res = item.isLiked ? await unlikeRouteAPI(item.id) : await likeRouteAPI(item.id)
    if (res.code !== 200) throw new Error(res.msg)
    item.isLiked = !item.isLiked
    item.likeNum = Math.max(0, item.likeNum + (item.isLiked ? 1 : -1))
  } catch (e) {
    ElMessage.warning('请先登录再点赞')
  }
}

// 收藏后端还没做接口，先在前端切换
const toggleCollect = (item) => {
  item.isCollected = !item.isCollected
  item.starNum += item.isCollected ? 1 : -1
  if (item.starNum < 0) item.starNum = 0
}
const currentCity = ref(null)   // { label, cityId, provinceLabel, districtLabel }
const locating = ref(false)


const locateCurrentCity = async () => {
  if (locating.value) return
  locating.value = true
  // 兜底：高德脚本加载不到或浏览器弹窗卡住时，10 秒后自动结束“定位中”
  const guard = setTimeout(() => {
    if (locating.value) locating.value = false
  }, 10000)
  try {
    const AMap = await load({
      key: '8720bcdd0f7029b7a9ca3f2a3498e505',
      version: '2.0',
      plugins: ['AMap.Geolocation', 'AMap.Geocoder']
    })
    const geo = new AMap.Geolocation({
      enableHighAccuracy: true, timeout: 8000,
      showButton: false, showMarker: false, panToLocation: false
    })
    const { status, result } = await new Promise(res =>
      geo.getCurrentPosition((s, r) => res({ status: s, result: r })))
    if (status !== 'complete' || !result?.position) throw new Error('定位失败')

    const lnglat = [result.position.getLng(), result.position.getLat()]
    const geocoder = new AMap.Geocoder({ city: '全国' })
    const regeo = await new Promise(res =>
      geocoder.getAddress(lnglat, (s, r) => res(s === 'complete' ? r : null)))
    const comp = regeo?.regeocode?.addressComponent
    if (!comp) throw new Error('逆地理失败')

    await loadAreaTree()   // 已有的函数，复用
    const province = areaTree.value.find(p => normalizeArea(p.label) === normalizeArea(comp.province))
    const city = (province?.children || []).find(c => normalizeArea(c.label) === normalizeArea(comp.city))
    if (!city) throw new Error('库里没有当前城市')

    currentCity.value = {
      label: city.label, cityId: city.id,
      provinceLabel: province.label,
      districtLabel: comp.district || ''
    }
    localStorage.setItem('citywalk_current_city', JSON.stringify(currentCity.value))
    await loadRoutes(true)     // 按新城市重新拉第一页
  } catch (e) {
    // 定位失败/拒绝授权：静默用上次城市，没有就保持全国，不弹错误框
    const cached = JSON.parse(localStorage.getItem('citywalk_current_city') || 'null')
    if (cached) { currentCity.value = cached; await loadRoutes(true) }
  } finally {
    clearTimeout(guard)
    locating.value = false
  }
}


watch(activeTag, () => loadRoutes(true))
onMounted(() => {
  // 首屏先出内容（走缓存城市或全国），定位成功后再按当前城市重拉
  const cached = JSON.parse(localStorage.getItem('citywalk_current_city') || 'null')
  if (cached) currentCity.value = cached
  loadRoutes(true)
  locateCurrentCity()
  window.addEventListener('scroll', onScrollLoad)
})
onUnmounted(() => window.removeEventListener('scroll', onScrollLoad))

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
/* 顶部一行：城市胶囊 + 搜索框并排 */
.top-row{
  display:flex;
  align-items:center;
  gap:8px;
  margin-bottom:12px;
}
.city-picker{
  flex:0 0 auto;
  display:flex;
  align-items:center;
  gap:3px;
  height:40px;
  padding:0 10px;
  border-radius:20px;
  background:#fff;
  font-size:13px;
  color:#333;
  box-sizing:border-box;
  cursor:pointer;
  transition:background .15s ease;
}
.city-picker:active{ background:#fff4ee; }
.city-pin{ font-size:13px; }
.city-name{
  max-width:78px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  font-weight:600;
}
.city-caret{ color:#bbb; font-size:10px; }
.city-reset{
  width:16px;
  height:16px;
  line-height:15px;
  text-align:center;
  border-radius:50%;
  background:#f0f0f0;
  color:#999;
  font-size:11px;
}
.search-bar {
  flex:1;
  min-width:0;
  display:flex;
  align-items:center;
  gap:8px;
  background:#fff;
  padding:10px 14px;
  border-radius:24px;
  margin-bottom:0;
  box-sizing:border-box;
  height:40px;
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
  padding:0 !important;
  width:32px;
  height:32px;
  min-width:32px;
  border-radius:50%;
  background:#fff3ec;
  display:flex;
  align-items:center;
  justify-content:center;
  transition:transform .15s ease, background .15s ease;
}
.back-icon:active{
  transform:scale(.94);
  background:#ffe4d6;
}
.back-chevron{
  color:#ff6b35;
  font-size:18px;
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
  width:22px;
  margin:12px 10px 12px 0;
  border-radius:12px;
  background:#fafafa;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:space-around;
  padding:8px 0;
  font-size:11px;
  color:#666;
  box-sizing:border-box;
}
.letter-sidebar span{
  padding:3px 0;
  cursor:pointer;
}
.city-list-wrap{
  flex:1;
  overflow-y:auto;
  padding:0;
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
/* =====国内城市：面包屑 + 单列下钻行样式===== */
.city-breadcrumb{
  display:flex;
  align-items:center;
  gap:4px;
  padding:0 0 8px;
  font-size:13px;
  color:#888;
  flex-wrap:wrap;
}
.city-breadcrumb .current{
  color:#ff6b35;
  font-weight:bold;
}
.city-breadcrumb .crumb-sep{
  color:#bbb;
}
.city-breadcrumb .city-see-all{
  margin-left:auto;
  color:#ff6b35;
  font-size:12px;
  cursor:pointer;
}
.city-row{
  display:flex;
  align-items:center;
  justify-content:space-between;
}
.city-row-name{
  color:#333;
}
.city-row-arrow{
  color:#c8c8c8;
  font-size:14px;
}
.city-empty{
  text-align:center;
  color:#999;
  font-size:13px;
  padding:40px 0;
}
/* 左侧内容 + 右侧字母栏：字母栏紧贴列表右边，纵向贯穿列表高度 */
.city-main{
  flex:1;
  min-width:0;
  display:flex;
  flex-direction:column;
  overflow:hidden;
  padding:10px 12px;
  box-sizing:border-box;
}
.city-tab{
  overflow:hidden;
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
.banner-enter{
  position:absolute;
  right:12px;
  bottom:12px;
  padding:3px 10px;
  border-radius:12px;
  background:rgba(0,0,0,0.35);
  color:#fff;
  font-size:12px;
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
.list-tip {
  grid-column: 1 / -1;
  text-align: center;
  font-size: 13px;
  color: #999;
  padding: 10px 0 4px;
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
/* 底部导航栏：样式与 Map.vue 保持一致，选择器限定在 .tab-bar 内，避免影响搜索面板的 tab */
.tab-bar{
  position:fixed;
  bottom:0;
  left:0;
  width:100%;
  height:60px;
  background:#fff;
  display:flex;
  border-top:1px solid #eee;
  z-index:99;
}
.tab-bar .tab-item{
  flex:1;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  font-size:14px;
  color:#666;
  gap:3px;
  cursor:pointer;
}
.tab-bar .tab-item.active{
  color:#409eff;
}
.tab-bar .tab-icon{
  font-size:20px;
}
.tab-bar .tab-text{
  font-size:14px;
  line-height:1;
}
</style>
