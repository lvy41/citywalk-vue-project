<template>
  <div class="record-container">
    <!-- ================= 列表页 ================= -->
    <div v-if="currentView === 'list'" class="fade-in">
      <!-- 返回主页按钮 -->
      <div class="list-back-btn" @click="goHome">
        <el-icon><ArrowLeft /></el-icon> 返回
      </div>
      
      <!-- 顶部数据统计卡片 -->
      <div class="stats-card">
        <div class="stat-item">
          <div class="stat-num">{{ checkinList.length }}</div>
          <div class="stat-label">我的路线</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item" @click="currentView = 'all-points'" style="cursor: pointer;">
          <div class="stat-num">{{ allCheckinPoints.length}}</div>
          <div class="stat-label">打卡点位</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-num">{{ completedRoutes.length }}</div>
          <div class="stat-label">我的闯关</div>
        </div>
      </div>

      <!-- 标签页切换 -->
      <el-tabs v-model="activeTab" class="record-tabs">
        <!-- 我的路线 -->
        <el-tab-pane label="我的路线" name="checkin">
          <div class="card-list">
            <div v-for="item in checkinList" :key="item.id" class="record-card">
              <img :src="item.coverImage" class="card-cover" alt="封面">
              <div class="card-info">
                <div class="title-row">
                  <h3 class="card-title link-title" @click="openDetail(item, 'my-detail')">
                    {{ item.routeName }} <span class="arrow">></span>
                  </h3>
                  <span class="delete-icon" @click.stop="deleteMyRoute(item.id, item.routeName)">🗑️</span>
                </div>
                <p class="card-desc"><span class="tag-icon">📍</span> 打卡点位：{{ item.pointCount }} 个<template v-if="item.checkedPoints > 0">（已打卡 {{ item.checkedPoints }} 个）</template></p>
                <p class="card-time">
                  <span class="pub-flag" :class="{ 'pub-yes': item.isPublic }">{{ item.isPublic ? '公开记录' : '未公开记录' }}</span>
                </p>
                <p class="card-time">{{ item.status === 1 ? '完成时间：' + item.createTime : '创建时间：' + item.createTime }}</p>
              </div>
            </div>
          </div>
          <div v-if="checkinList.length === 0" style="text-align:center;color:#909399;padding:30px 0;">
            还没有打卡记录，去「发布路线」页填写一条，保存后会出现在这里～
          </div>
        </el-tab-pane>

        <!-- 收藏路线 -->
        <el-tab-pane label="收藏路线" name="favorite">
          <div class="card-list">
            <div v-for="item in favoriteList" :key="item.id" class="record-card">
              <img :src="item.coverImage" class="card-cover" alt="封面">
              <div class="card-info">
                <h3 class="card-title link-title" @click="openDetail(item, 'fav-detail')">
                  {{ item.routeName }} <span class="arrow">></span>
                </h3>
                <p class="card-desc"><span class="tag-icon">🏙️</span> 城市：{{ item.city }}</p>
                <p class="card-desc"><span class="tag-icon">🚶</span> 距离：{{ item.distance }} | 耗时：{{ item.duration }}</p>
                <div class="btn-group">
                  <el-button type="warning" size="small" round class="action-btn yellow-btn" @click.stop="startCheckin(item)">去打卡</el-button>
                  <el-button type="danger" size="small" round plain class="action-btn pink-btn" @click.stop="cancelFavorite(item.id)">取消收藏</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 我的闯关 -->
        <el-tab-pane label="我的闯关" name="completed">
          <!-- 视图 1：路线列表层 -->
          <div v-if="currentCompletedView === 'list'" class="fade-in">
            <div class="search-bar" style="margin-top: 15px;">
              <el-input 
                v-model="searchCompletedKeyword" 
                placeholder="搜索你通关的城市或路线..." 
                clearable
                class="search-input"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>

            <div class="card-list">
              <div v-for="item in filteredCompletedRoutes" :key="item.id" class="record-card">
                <img :src="item.coverImage" class="card-cover" alt="封面">
                <div class="card-info">
                  <div class="title-row">
                    <h3 class="card-title link-title" @click="openCompletedRoute(item)">
                      {{ item.routeName }} <span class="arrow">></span>
                    </h3>
                    <span class="delete-icon" @click.stop="deleteCompletedRoute(item.id, item.routeName)">🗑️</span>
                  </div>
                  <p class="card-desc"><span class="tag-icon">🏙️</span> 城市：{{ item.city }}</p>
                  <p class="card-desc"><span class="tag-icon">📍</span> 已打卡点：{{ item.points.length }} 个</p>
                  <p class="card-time">通关时间：{{ item.createTime }}</p>
                </div>
              </div>
            </div>
            
            <div v-if="filteredCompletedRoutes.length === 0" style="text-align: center; color: #909399; padding: 40px 0;">
              没有找到相关的通关路线哦~
            </div>
          </div>

          <!-- 视图 2：具体打卡点位层 -->
          <div v-if="currentCompletedView === 'detail'" class="fade-in">
            <div class="detail-header" style="margin-top: 15px;">
              <div class="back-btn" @click="currentCompletedView = 'list'">
                <el-icon><ArrowLeft /></el-icon> 返回
              </div>
              <h2 class="detail-title">{{ currentCompletedRoute.routeName }}</h2>
              <div class="header-placeholder"></div>
            </div>

            <div class="checkin-gallery">
              <div 
                v-for="point in currentCompletedRoute.points" 
                :key="point.id" 
                class="gallery-card"
              >
                <img :src="point.image" class="gallery-img" alt="打卡图">
                <div class="gallery-info">
                  <div class="gallery-header">
                    <h3 class="gallery-name">{{ point.name }}</h3>
                  </div>
                  <p class="gallery-desc"><el-icon><Location /></el-icon> {{ point.location }}</p>
                  <p class="gallery-time">打卡时间：{{ point.time }}</p>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- ================= 我的打卡详情页（时间轴） ================= -->
    <div v-else-if="currentView === 'my-detail'" class="fade-in">
      <div class="detail-header">
        <div class="back-btn" @click="currentView = 'list'">
          <el-icon><ArrowLeft /></el-icon> 返回
        </div>
        <h2 class="detail-title">{{ currentRoute.routeName }}</h2>
        <div class="header-placeholder"></div>
      </div>

      <!-- 路线基本信息：把创建时填的封面/城市/简介都露出来 -->
      <div class="route-hero">
        <img :src="currentRoute.coverImage" class="hero-cover" alt="路线封面">
        <div class="hero-body">
          <div class="hero-title-row">
            <h3 class="hero-title">{{ currentRoute.routeName }}</h3>
            <span class="pub-flag" :class="{ 'pub-yes': currentRoute.isPublic }">
              {{ currentRoute.isPublic ? '公开记录' : '未公开记录' }}
            </span>
          </div>
          <div class="hero-stats">
            <span v-if="currentRoute.city">🏙 {{ currentRoute.city }}</span>
            <span>📍 {{ currentRoute.pointCount }} 个点位</span>
            <span v-if="currentRoute.checkedPoints > 0">✅ 已打卡 {{ currentRoute.checkedPoints }} 个</span>
          </div>
          <p class="hero-desc" v-if="currentRoute.description">{{ currentRoute.description }}</p>
          <p class="hero-time">创建时间：{{ currentRoute.createTime }}</p>
        </div>
      </div>

      <div class="section-subtitle">📍 路线点位（{{ currentRoute.pointCount }} 个）</div>

      <div class="detail-content">
        <div class="timeline-container">
          <div v-for="(point, index) in currentRoute.points" :key="index" class="point-item">
            <div class="timeline-left">
              <div class="time" v-if="point.planTime || point.time">{{ point.planTime || point.time }}</div>
              <div class="dot" :class="{ 'dot-done': point.checked }"></div>
              <div class="line" v-if="index !== currentRoute.points.length - 1"></div>
            </div>
            <div class="point-card">
              <img :src="point.image" class="point-img" v-if="point.hasImage" alt="点位图">
              <div class="point-info">
                <div class="point-title-row">
                  <h4 class="point-name">{{ point.name }}</h4>
                  <span class="checkin-state done" v-if="point.checked">已打卡</span>
                </div>
                <div class="point-meta">
                  <span class="meta-tag transport">🚶 {{ point.transport || '步行' }}</span>
                  <span class="meta-tag tip" v-if="point.tip">💡 {{ point.tip }}</span>
                </div>
                <p class="point-loc" v-if="point.location">📍 地址：{{ point.location }}</p>
                <p class="point-desc" v-if="point.description">{{ point.description }}</p>
                <p class="point-checktime" v-if="point.checked && point.checkTimeText">⏱ 实际打卡：{{ point.checkTimeText }}</p>
                <div class="my-review" v-if="point.review">
                  <div class="review-label">💬 我的评价</div>
                  <div class="review-content">{{ point.review }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= 收藏路线详情页（已抽离为公共组件） ================= -->
    <RouteDetail 
      v-else-if="currentView === 'fav-detail'" 
      :routeData="currentRoute" 
      @back="currentView = 'list'" 
    />

    <!-- ================= 自由闯关打卡页 ================= -->
    <div v-else-if="currentView === 'checkin-play'" class="fade-in">
      <div class="detail-header">
        <div class="back-btn" @click="currentView = 'list'">
          <el-icon><ArrowLeft /></el-icon> 返回
        </div>
        <h2 class="detail-title">{{ currentPlayRoute.routeName }}</h2>
        <div class="header-placeholder"></div>
      </div>

      <div class="game-map" style="padding-top: 10px;">
        <p class="progress-text" style="text-align: left; margin-bottom: 15px;">
          已打卡：<span style="color: #FF7A45; font-weight: bold; font-size: 18px;">{{ checkedCount }}</span> / {{ currentPlayRoute.points.length }} 个点位
        </p>

        <div class="levels-container">
          <div 
            v-for="(point, index) in currentPlayRoute.points" 
            :key="index"
            class="level-node is-active"
            @click="handlePointClick(point, index)"
          >
            <div class="level-icon" :style="{ background: point.isChecked ? '#67C23A' : '#FF9A44' }">
              <span v-if="point.isChecked">✔</span>
              <span v-else>📍</span>
            </div>
            <div class="level-info" style="flex: 1;">
              <h4>{{ point.name }}</h4>
              <p v-if="point.location">{{ point.location }}</p>
            </div>
            <div class="level-status">
              <el-button v-if="!point.isChecked" type="primary" size="small" round @click.stop="doCheckin(point)">打卡</el-button>
              <el-tag v-else type="success" round effect="dark">已完成</el-tag>
            </div>
          </div>
        </div>

        <div class="action-footer" v-if="checkedCount === currentPlayRoute.points.length && currentPlayRoute.points.length > 0">
          <el-button type="success" class="checkin-btn" @click="finishGame">🎉 恭喜通关！查看通关凭证</el-button>
        </div>
      </div>
    </div>

    <!-- ================= 所有打卡点位汇总页 ================= -->
    <div v-else-if="currentView === 'all-points'" class="fade-in">
      <div class="detail-header">
        <div class="back-btn" @click="currentView = 'list'">
          <el-icon><ArrowLeft /></el-icon> 返回
        </div>
        <h2 class="detail-title">我的打卡足迹</h2>
        <div class="header-placeholder"></div>
      </div>

      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索城市或打卡点，如：广州、玉林..."
          clearable
          class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="checkin-gallery">
        <div
          v-for="point in filteredCheckinPoints"
          :key="point.id"
          class="gallery-card"
        >
          <img :src="point.image" class="gallery-img" alt="打卡图">
          <div class="gallery-info">
            <div class="gallery-header">
              <h3 class="gallery-name">{{ point.name }}</h3>
              <span class="gallery-city">{{ point.city }}</span>
            </div>
            <p class="gallery-desc"><el-icon><Location /></el-icon> {{ point.location }}</p>
            <p class="gallery-time">打卡时间：{{ point.time }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部导航栏：与 Home / Map 一致 -->
    <div class="tab-bar">
      <div class="tab-item" :class="{active: $route.path === '/home'}" @click="router.push('/home')">
        <div class="tab-icon">🏠</div>
        <div class="tab-text">首页</div>
      </div>
      <div class="tab-item" :class="{active: $route.path === '/map'}" @click="router.push('/map')">
        <div class="tab-icon">🗺</div>
        <div class="tab-text">探索地图</div>
      </div>
      <div class="tab-item" :class="{active: $route.path === '/publish'}" @click="router.push('/publish')">
        <div class="tab-icon">✏️</div>
        <div class="tab-text">发布路线</div>
      </div>
      <div class="tab-item" :class="{active: $route.path === '/record'}" @click="router.push('/record')">
        <div class="tab-icon">📝</div>
        <div class="tab-text">打卡记录</div>
      </div>
      <div class="tab-item" :class="{active: $route.path === '/my'}" @click="router.push('/my')">
        <div class="tab-icon">👤</div>
        <div class="tab-text">我的</div>
      </div>
    </div>
  </div>

  <!-- 通关奖励弹窗 -->
  <el-dialog 
    v-model="showTrophyDialog" 
    title="🎉 恭喜通关！" 
    width="80%" 
    center
    :show-close="false"
    class="trophy-dialog"
  >
    <div class="trophy-content">
      <div class="trophy-icon">🏆</div>
      <h3>{{ currentTitle }}</h3>
      <p>恭喜你完成了一次 CityWalk 闯关！</p>
      <p class="trophy-count-text">当前累计奖杯：<span>{{ trophyCount }}</span> 个</p>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" round @click="closeTrophyDialog">收下奖杯</el-button>
      </span>
    </template>
  </el-dialog>

</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Search, Location } from '@element-plus/icons-vue'
// 👇 引入刚才抽离的详情页组件
import RouteDetail from '@/components/RouteDetail.vue'
import request from '@/utils/request'
import { useUserStore } from '@/store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const goHome = () => {
  router.push('/home') 
}

const currentView = ref('list')
const activeTab = ref('checkin')
const currentRoute = ref({})
const searchKeyword = ref('')

// ======= 我的打卡路线：数据来自后端 /checkin/route/my =======
const defaultCover = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80'

const fmtTime = (v) => {
  if (!v) return ''
  return String(v).replace('T', ' ').slice(0, 16)
}

const pickImage = (url) => (/^(http|data:image)/.test(String(url || '')) ? url : defaultCover)

// 点位地址兼容两种来源：自建记录直接存地址；从首页路线复制的存的是「地址：xxx；建议到达…」
const cleanLocation = (loc) => String(loc || '')
  .replace(/^地址[:：]/, '')
  .split('；')[0]
  .trim()

// 老数据的 location 里有时放的是看点文案而不是地址，靠行政区/道路字样区分，避免地址行和介绍行重复
const looksLikeAddress = (text) => /(省|市|区|县|镇|村|路|街|巷|号|大道|广场|公园|岛)/.test(String(text || ''))

const mapRoute = (r) => ({
  id: r.id,
  sourceRouteId: r.sourceRouteId,
  routeName: r.routeName,
  city: r.city,
  coverImage: pickImage(r.coverImage),
  pointCount: r.totalPoints || 0,
  checkedPoints: r.checkedPoints || 0,
  status: r.status,
  isPublic: r.isPublic === 1,
  tags: r.tags || '',
  description: r.description || '',
  createTime: fmtTime(r.finishTime || r.createTime),
  points: (r.points || []).map((p, i) => {
    const rawLoc = cleanLocation(p.location)
    const locIsAddress = rawLoc && looksLikeAddress(rawLoc)
    return {
      id: p.pointId || `${r.id}-${i}`,
      name: p.name,
      location: locIsAddress ? rawLoc : '',
      image: pickImage(p.image),
      hasImage: /^(http|data:image)/.test(String(p.image || '')),
      time: p.checked && p.checkTime ? fmtTime(p.checkTime).slice(11) : (p.planTime || ''),
      planTime: p.planTime || '',
      longitude: p.longitude,
      latitude: p.latitude,
      checked: !!p.checked,
      isChecked: !!p.checked,
      transport: p.transport || '步行',
      tip: p.tag || '',
      description: p.description || (!locIsAddress && rawLoc ? rawLoc : ''),
      checkTimeText: p.checked && p.checkTime ? fmtTime(p.checkTime) : ''
    }
  })
})

const mapCompleted = (r) => ({
  id: r.id,
  routeName: r.routeName,
  coverImage: pickImage(r.coverImage),
  city: r.city,
  createTime: fmtTime(r.finishTime || r.createTime),
  points: (r.points || []).map((p, i) => ({
    id: p.pointId || `${r.id}-${i}`,
    name: p.name,
    location: p.location || r.city,
    image: pickImage(p.image),
    time: p.checkTime ? fmtTime(p.checkTime) : ''
  }))
})

const loadMyRoutes = async () => {
  try {
    const res = await request.get('/checkin/route/my')
    if (res && res.code === 200) {
      const rows = res.data || []
      checkinList.value = rows.map(mapRoute)
      completedRoutes.value = rows.filter(r => r.status === 1).map(mapCompleted)
    }
  } catch (err) {
    console.error('打卡路线加载失败', err)
  }
}



// ======= 奖杯与通关记录逻辑 =======
const trophyCount = ref(0)
const showTrophyDialog = ref(false)
const currentTitle = ref('初出茅庐')

const currentPlayRoute = ref({})
const checkedCount = ref(0)

const currentCompletedView = ref('list') 
const currentCompletedRoute = ref({})
const searchCompletedKeyword = ref('')

// 读取奖杯数量
const loadTrophyCount = () => {
  const savedTrophies = localStorage.getItem('citywalk_trophies')
  if (savedTrophies) {
    trophyCount.value = parseInt(savedTrophies)
  }
}
loadTrophyCount()

const completedRoutes = ref([])

// 删除通关记录
const deleteCompletedRoute = (id, routeName) => {
  ElMessageBox.confirm(`确定要删除「${routeName}」的通关记录吗？`, '删除打卡足迹', {
    confirmButtonText: '确定删除',
    cancelButtonText: '再想想',
    type: 'warning',
    confirmButtonClass: 'el-button--danger'
  }).then(async () => {
    try {
      await request.delete(`/checkin/route/${id}`)
      await loadMyRoutes()
      ElMessage.success('通关记录已删除')
    } catch (err) {
      console.error(err)
    }
  }).catch(() => {})
}

// 点击进入路线的具体点位页
const openCompletedRoute = (route) => {
  currentCompletedRoute.value = route
  currentCompletedView.value = 'detail'
}

// 根据搜索框过滤“通关路线列表”
const filteredCompletedRoutes = computed(() => {
  if (!searchCompletedKeyword.value) return completedRoutes.value
  const keyword = searchCompletedKeyword.value.toLowerCase()
  return completedRoutes.value.filter(route => 
    route.routeName.toLowerCase().includes(keyword) || route.city.toLowerCase().includes(keyword)
  )
})

// 闯关打卡逻辑
const startCheckin = (item) => {
  if (!item.points || item.points.length === 0) {
    ElMessage.warning('这条路线还没有打卡点位哦~')
    return
  }
  const playData = JSON.parse(JSON.stringify(item))
  playData.points = playData.points.map(pt => ({ ...pt, isChecked: !!pt.checked }))
  currentPlayRoute.value = playData
  checkedCount.value = playData.points.filter(pt => pt.isChecked).length
  currentView.value = 'checkin-play'
}

const handlePointClick = (point, index) => {
  if (point.isChecked) {
    ElMessage.info(`你已经在这个地方打过卡啦！`)
  }
}

const doCheckin = (point) => {
  ElMessageBox.confirm(`确认你已经到达「${point.name}」了吗？`, '打卡确认', {
    confirmButtonText: '确认打卡', cancelButtonText: '还没到', type: 'success'
  }).then(async () => {
    const index = currentPlayRoute.value.points.findIndex(pt => pt.id === point.id)
    if (index < -1) return
    try {
      const res = await request.post(`/checkin/route/${currentPlayRoute.value.id}/point`, { index })
      if (res && res.code === 200) {
        const data = res.data || {}
        point.isChecked = true
        checkedCount.value = data.checkedPoints ?? (checkedCount.value + 1)
        currentPlayRoute.value.status = data.status
        ElMessage.success(`「${point.name}」打卡成功！`)
        loadMyRoutes()
      }
    } catch (err) {
      console.error(err)
    }
  }).catch(() => {})
}

const finishGame = () => {
  // 后端在最后一个点位打卡时已把 status 置为「已通关」，这里只负责庆祝和刷新
  trophyCount.value += 1
  localStorage.setItem('citywalk_trophies', trophyCount.value.toString())
  currentTitle.value = `获得第 ${trophyCount.value} 个奖杯`
  showTrophyDialog.value = true

  loadMyRoutes()
  currentView.value = 'list'
  activeTab.value = 'completed'
  currentCompletedView.value = 'list'
}

const closeTrophyDialog = () => {
  showTrophyDialog.value = false
}

// ======= 删除我的打卡路线逻辑（删除后进「我的垃圾站」，可恢复） =======
const RECYCLE_KEY = 'citywalk_recycle_list'
const pushToRecycle = (item) => {
  try {
    const list = JSON.parse(localStorage.getItem(RECYCLE_KEY) || '[]')
    list.unshift({ ...item, deletedTime: new Date().toLocaleString() })
    localStorage.setItem(RECYCLE_KEY, JSON.stringify(list.slice(0, 20)))
  } catch (e) {
    console.warn('写入垃圾站失败', e)
  }
}

const deleteMyRoute = (id, routeName) => {
  ElMessageBox.confirm(`确定要删除打卡记录「${routeName}」吗？`, '删除打卡足迹', {
    confirmButtonText: '确定删除', cancelButtonText: '再想想', type: 'warning', confirmButtonClass: 'el-button--danger'
  }).then(async () => {
    try {
      const res = await request.delete(`/checkin/route/${id}`)
      if (res && res.code === 200) {
        await loadMyRoutes()
        ElMessage.success('打卡路线已删除')
      }
    } catch (err) {
      console.error(err)
    }
  }).catch(() => {})
}

const checkinList = ref([])

const favoriteList = ref([
  {
    id: 5,
    routeName: '成都·玉林路的小酒馆',
    coverImage: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=600&q=80',
    city: '成都',
    distance: '2.5km',
    duration: '1.5h',
    points: [
      {
        name: '玉林西路',
        location: '武侯区玉林西路',
        image: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=800&q=80',
        description: '赵雷歌里的玉林路，充满文艺气息的老街区，很多涂鸦墙和小酒馆。'
      },
      {
        name: '小酒馆（玉林店）',
        location: '武侯区玉林西路55号',
        image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
        description: '《成都》这首歌里唱的那个小酒馆，门口永远有人在拍照打卡。'
      }
    ],
    comments: [
      {
        id: 101,
        username: 'CityWalk爱好者',
        avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80',
        time: '5天前',
        content: '这条路线很适合下午慢慢逛，周边有很多好吃的串串，推荐！',
        isMine: false,
        isAuthor: true,
        likes: 8,
        isLiked: true
      }
    ]
  }
])

const openDetail = (item, viewName) => {
  if (!item.points || item.points.length === 0) {
    ElMessage.warning('该路线暂无详细打卡记录哦~')
    return
  }
  currentRoute.value = item
  currentView.value = viewName
}

const allCheckinPoints = computed(() => {
  let points = []
  checkinList.value.forEach(route => {
    const cityName = route.routeName.split('·')[0] || '未知'
    route.points.forEach((pt, index) => {
      points.push({ ...pt, id: `${route.id}-${index}`, city: cityName })
    })
  })
  return points
})

const filteredCheckinPoints = computed(() => {
  if (!searchKeyword.value) return allCheckinPoints.value
  const keyword = searchKeyword.value.toLowerCase()
  return allCheckinPoints.value.filter(pt =>
    pt.city.toLowerCase().includes(keyword) ||
    pt.name.toLowerCase().includes(keyword) ||
    pt.location.toLowerCase().includes(keyword)
  )
})

// 从首页跳转过来自动触发打卡（playRouteId 是首页真实路线 id）
onMounted(async () => {
  await loadMyRoutes()
  if (route.query.playRouteId) {
    const sourceRouteId = Number(route.query.playRouteId)
    try {
      const res = await request.post('/checkin/route/create', { sourceRouteId })
      if (res && res.code === 200) {
        await loadMyRoutes()
        const target = checkinList.value.find(item => item.sourceRouteId === sourceRouteId)
        if (target) startCheckin(target)
      }
    } catch (err) {
      console.error('从首页路线创建打卡路线失败', err)
    }
  }
})

const cancelFavorite = (id) => { ElMessage.warning(`取消收藏路线 ID: ${id}`) }
</script>

<style scoped>
.record-container {
  padding: 20px 15px 150px;
  background: linear-gradient(180deg, #FFF6F0 0%, #F5F7FA 100%);
  min-height: 100vh;
  box-sizing: border-box;
}
.fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* ================= 列表页 ================= */
.stats-card { display: flex; align-items: center; background: linear-gradient(135deg, #FF9A44 0%, #FC6076 100%); color: white; padding: 22px 10px; border-radius: 20px; margin-bottom: 25px; box-shadow: 0 8px 20px rgba(252, 96, 118, 0.25); position: relative; overflow: hidden; }
.stats-card::before { content: ''; position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; }
.stat-item { text-align: center; z-index: 1; flex: 1; min-width: 0; }
.stat-num { font-size: 22px; font-weight: 800; margin-bottom: 4px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
.stat-label { font-size: 13px; opacity: 0.95; }
.stat-divider { width: 1px; height: 28px; background: rgba(255, 255, 255, 0.4); margin: 0 10px; flex-shrink: 0; }

.record-tabs :deep(.el-tabs__nav-wrap::after) { height: 2px; background-color: #FFE4D6; }
.record-tabs :deep(.el-tabs__item) { font-size: 16px; font-weight: 600; color: #909399; }
.record-tabs :deep(.el-tabs__item.is-active) { color: #FF7A45; }
.record-tabs :deep(.el-tabs__active-bar) { background-color: #FF7A45; height: 3px; border-radius: 3px; }

.card-list { display: flex; flex-direction: column; gap: 16px; margin-top: 15px; }
.record-card { display: flex; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04); transition: transform 0.2s ease; }
.record-card:active { transform: scale(0.98); }
.card-cover { width: 110px; height: 110px; object-fit: cover; }
.card-info { flex: 1; padding: 15px; display: flex; flex-direction: column; justify-content: center;}
.link-title { margin: 0; font-size: 17px; font-weight: 700; color: #303133; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: color 0.2s; }
.link-title:active { color: #FF7A45; }
.link-title .arrow { font-size: 14px; color: #C0C4CC; }
.card-desc, .card-time { margin: 6px 0; font-size: 13px; color: #606266; }
.card-time { color: #909399; }
.btn-group { display: flex; gap: 10px; margin-top: 5px;}
.action-btn { font-weight: 600; border: none; padding: 8px 16px; }
.yellow-btn { background: linear-gradient(to right, #FFD15C, #FFA04D); color: #fff; }
.pink-btn { color: #FC6076; border-color: #FFD1D9; background-color: #FFF0F3; }

.detail-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px dashed #FFE4D6; }
.back-btn { display: flex; align-items: center; gap: 4px; font-size: 15px; color: #FF7A45; font-weight: bold; cursor: pointer; background: #FFF0F3; padding: 6px 12px; border-radius: 20px; }
.detail-title { margin: 0; font-size: 18px; color: #303133; font-weight: 800; }
.header-placeholder { width: 70px; }
.section-title { font-size: 16px; font-weight: bold; color: #303133; margin: 20px 0 10px 0; padding-left: 5px; border-left: 4px solid #FF7A45; }

.timeline-container { padding: 10px 0; }
.point-item { display: flex; margin-bottom: 10px; }
.timeline-left { display: flex; flex-direction: column; align-items: center; width: 60px; margin-right: 10px; }
.timeline-left .time { font-size: 12px; font-weight: bold; color: #FF7A45; margin-bottom: 5px; }
.timeline-left .dot { width: 12px; height: 12px; background: #FF7A45; border: 3px solid #FFE4D6; border-radius: 50%; z-index: 1; }
.timeline-left .line { width: 3px; flex: 1; background: #FFE4D6; margin: 5px 0; }
.point-card { flex: 1; background: #fff; border-radius: 16px; padding: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); margin-bottom: 15px; }
.point-img { width: 100%; height: 160px; object-fit: cover; border-radius: 12px; margin-bottom: 12px; }
.point-name { margin: 0 0 10px 0; font-size: 17px; color: #303133; }
.point-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
.meta-tag { font-size: 12px; padding: 4px 8px; border-radius: 6px; font-weight: 500; }
.transport { background: #FFF0F3; color: #FC6076; }
.tip { background: #F0F9EB; color: #529b2e; }
.location { background: #F0F9EB; color: #67C23A; }
.point-loc { font-size: 12px; color: #909399; margin: 0 0 8px 0; line-height: 1.5; }

/* 路线详情顶部信息卡 */
.route-hero {
  margin: 4px 15px 14px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}
.hero-cover { width: 100%; height: 160px; object-fit: cover; display: block; }
.hero-body { padding: 14px 16px 16px; }
.hero-title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.hero-title { margin: 0; font-size: 18px; color: #303133; }
.hero-stats { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 8px; font-size: 12px; color: #909399; }
.hero-desc { margin: 10px 0 0; font-size: 13px; color: #606266; line-height: 1.6; }
.hero-time { margin: 8px 0 0; font-size: 12px; color: #C0C4CC; }
.section-subtitle {
  margin: 0 15px 10px;
  font-size: 14px;
  font-weight: 700;
  color: #303133;
  padding-left: 10px;
  border-left: 4px solid #FF7A45;
  line-height: 1.2;
}
.point-title-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.checkin-state { font-size: 11px; padding: 2px 8px; border-radius: 10px; flex: none; }
.checkin-state.done { background: #F0F9EB; color: #67C23A; }
.checkin-state.todo { background: #F5F7FA; color: #A8ABB2; }
.point-checktime { margin: 8px 0 0; font-size: 12px; color: #67C23A; }
.dot-done { background: #67C23A !important; border-color: #E1F3D8 !important; }
.point-desc { font-size: 13px; color: #606266; line-height: 1.6; margin: 0; }
.my-review { margin-top: 15px; background: #FFF9F0; border: 1px dashed #FFD15C; padding: 10px; border-radius: 10px; }
.review-label { font-size: 12px; font-weight: bold; color: #E6A23C; margin-bottom: 5px; }
.review-content { font-size: 13px; color: #8a6d3b; line-height: 1.5; }

/* ======== 搜索栏与打卡网格 ======== */
.search-bar { margin: 10px 0 20px 0; }
.search-input :deep(.el-input__wrapper) { border-radius: 20px; background-color: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.05); padding: 5px 15px; }
.checkin-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; }
.gallery-card { display: flex; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04); transition: transform 0.2s ease; }
.gallery-card:hover { transform: translateY(-2px); }
.gallery-img { width: 100px; height: 100%; object-fit: cover; }
.gallery-info { flex: 1; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; }
.gallery-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px; }
.gallery-name { margin: 0; font-size: 15px; color: #303133; font-weight: bold; }
.gallery-city { font-size: 11px; color: #FF7A45; background: #FFF0F3; padding: 2px 6px; border-radius: 4px; white-space: nowrap; }
.gallery-desc { margin: 0 0 5px 0; font-size: 12px; color: #909399; display: flex; align-items: center; gap: 3px; }
.gallery-time { margin: 0; font-size: 12px; color: #C0C4CC; }

/* 列表页返回按钮 */
.list-back-btn { display: inline-flex; align-items: center; gap: 4px; font-size: 15px; color: #FF7A45; font-weight: bold; cursor: pointer; background: #FFF0F3; padding: 6px 12px; border-radius: 20px; margin-bottom: 15px; transition: all 0.2s ease; }
.list-back-btn:hover { background: #FFE4D6; }

/* 发布按钮 */
/* 创建打卡记录入口卡片 */
.create-entry { margin: 14px 0 16px; }
.create-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border: 1.5px dashed #FFC7A8;
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(255, 122, 69, 0.06);
  transition: border-color .2s, background .2s, transform .2s, box-shadow .2s;
}
.create-card:hover {
  border-color: #FF9A44;
  background: #FFFBF7;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(255, 122, 69, 0.14);
}
.create-card:active { transform: translateY(0); }
.create-icon {
  flex: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #FF9A44, #FC6076);
  box-shadow: 0 4px 10px rgba(252, 96, 118, 0.28);
}
.create-text { flex: 1; min-width: 0; }
.create-title { font-size: 15px; font-weight: 700; color: #303133; line-height: 1.3; }
.create-sub { margin-top: 3px; font-size: 12px; color: #A8ABB2; }
.create-arrow { flex: none; font-size: 22px; color: #FFB38A; line-height: 1; }
.home-route-link {
  display: block;
  margin: 10px auto 0;
  padding: 6px 10px;
  border: none;
  background: none;
  font-size: 12px;
  color: #909399;
  cursor: pointer;
  transition: color .2s;
}
.home-route-link:hover { color: #FF7A45; }
.pub-flag { display: inline-block; font-size: 11px; padding: 1px 8px; border-radius: 10px; background: #F2F3F5; color: #909399; }
.pub-flag.pub-yes { background: #F0F9EB; color: #67C23A; }

/* 创建打卡路线页 */
.create-form { padding-bottom: 80px; }
.form-card { background: #fff; border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.point-edit-item { background: #F9F9F9; border: 1px dashed #DCDFE6; border-radius: 12px; padding: 15px; margin-bottom: 15px; position: relative; }
.point-edit-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; color: #FF7A45; margin-bottom: 10px; }
.add-point-btn { width: 100%; height: 44px; border-radius: 10px; border: 1px dashed #FF9A44; color: #FF7A45; background: #FFF9F0; font-weight: bold; }
.add-point-btn:hover { background: #FFF0F3; }
.submit-bar { position: fixed; bottom: 60px; left: 0; width: 100%; background: #fff; padding: 10px 15px; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); z-index: 98; box-sizing: border-box; }
.submit-btn { width: 100%; border-radius: 20px; background: linear-gradient(to right, #FF9A44, #FC6076); border: none; font-size: 16px; font-weight: bold; padding: 12px 0; }

/* 底部导航栏：与 Home / Map 一致 */
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
.tab-bar .tab-item {
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
.tab-bar .tab-item.active { color: #409eff; }
.tab-bar .tab-icon { font-size: 20px; }
.tab-bar .tab-text { font-size: 14px; line-height: 1; }

/* 删除图标 */
.title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.title-row .card-title { margin: 0; flex: 1; }
.delete-icon { font-size: 16px; color: #C0C4CC; cursor: pointer; padding: 4px; border-radius: 50%; transition: all 0.2s; }
.delete-icon:hover { color: #F56C6C; background: #FEF0F0; }

/* 闯关地图 */
.game-map { padding: 10px 0; position: relative; }
.progress-text { font-size: 13px; color: #909399; text-align: right; margin-bottom: 30px; }
.levels-container { display: flex; flex-direction: column; gap: 20px; position: relative; padding-left: 20px; }
.level-node { display: flex; align-items: center; gap: 15px; padding: 15px; background: #F5F7FA; border-radius: 16px; border: 2px dashed transparent; opacity: 0.6; transition: all 0.3s; cursor: not-allowed; }
.level-node.is-active { opacity: 1; background: #fff; border-color: #FF9A44; box-shadow: 0 4px 16px rgba(255, 154, 68, 0.2); transform: scale(1.02); cursor: pointer; }
.level-node.is-completed { opacity: 1; background: #F0F9EB; border-color: #67C23A; cursor: pointer; }
.level-icon { width: 44px; height: 44px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 20px; font-weight: bold; background: #DCDFE6; color: #fff; flex-shrink: 0; }
.is-active .level-icon { background: #FF9A44; }
.is-completed .level-icon { background: #67C23A; }
.level-info h4 { margin: 0 0 5px 0; font-size: 16px; color: #303133; }
.level-info p { margin: 0; font-size: 13px; color: #909399; }
.action-footer { margin-top: 30px; padding: 0 10px; }
.checkin-btn { width: 100%; border-radius: 20px; font-size: 16px; font-weight: bold; padding: 12px 0; background: linear-gradient(to right, #FF9A44, #FC6076); border: none; }

/* 从首页路线创建打卡路线的弹窗 */
.pick-search { display: flex; gap: 10px; margin-bottom: 15px; }
.pick-list { max-height: 55vh; overflow-y: auto; }
.pick-item { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 12px; background: #FFF9F0; margin-bottom: 10px; }
.pick-cover { width: 72px; height: 72px; border-radius: 10px; object-fit: cover; flex-shrink: 0; background: #F5F7FA; }
.pick-info { flex: 1; overflow: hidden; }
.pick-name { font-size: 15px; font-weight: bold; color: #303133; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pick-meta { font-size: 12px; color: #909399; }
.pick-empty { text-align: center; color: #909399; padding: 30px 0; }
</style>
