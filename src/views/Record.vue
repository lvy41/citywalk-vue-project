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
          <div class="stat-num">{{ myPublishedCount }}</div>
          <div class="stat-label">我的发布</div>
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
          <div class="publish-action">
            <el-button type="primary" round class="publish-btn" @click="currentView = 'create-record'">
              + 创建我的新打卡路线
            </el-button>
          </div>
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
                <p class="card-desc"><span class="tag-icon">📍</span> 打卡点位：{{ item.pointCount }} 个</p>
                <p class="card-time">完成时间：{{ item.createTime }}</p>
              </div>
            </div>
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

        <!-- 我的发布标签页 -->
        <el-tab-pane label="我的发布" name="published">
          <div class="card-list">
            <div v-for="item in myPublishedList" :key="item.id" class="record-card">
              <img :src="item.coverImage || 'https://images.unsplash.com/photo-1543781737-0d7c1e62c3df?auto=format&fit=crop&w=600&q=80'" class="card-cover" alt="封面">
              <div class="card-info">
                <div class="title-row">
                  <h3 class="card-title link-title" @click="openDetail(item, 'fav-detail')">
                    {{ item.routeName }} <span class="arrow">></span>
                  </h3>
                   <span class="delete-icon" @click.stop="deletePublishedRoute(item.id, item.routeName)">🗑️</span>
                </div>
                <p class="card-desc"><span class="tag-icon">🏙️</span> 城市：{{ item.city }}</p>
                <p class="card-desc"><span class="tag-icon">🕒</span> 发布时间：{{ item.createTime }}</p>
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

    <!-- ================= 创建打卡路线页 ================= -->
    <div v-else-if="currentView === 'create-record'" class="fade-in">
      <div class="detail-header">
        <div class="back-btn" @click="currentView = 'list'">
          <el-icon><ArrowLeft /></el-icon> 返回
        </div>
        <h2 class="detail-title">记录新足迹</h2>
        <div class="header-placeholder"></div>
      </div>

      <div class="create-form">
        <div class="form-card">
          <h3 class="section-title">📝 路线基础信息</h3>
          <el-form label-position="top">
            <el-form-item label="路线名称">
              <el-input v-model="createForm.routeName" placeholder="例如：杭州·西湖漫步"></el-input>
            </el-form-item>
            <el-form-item label="所属城市">
              <el-input v-model="createForm.city" placeholder="例如：杭州"></el-input>
            </el-form-item>
            <el-form-item label="路线封面图 (URL)">
              <el-input v-model="createForm.coverImage" placeholder="输入图片链接 (可选)"></el-input>
            </el-form-item>
          </el-form>
        </div>

        <div class="form-card">
          <h3 class="section-title">📍 途径打卡点</h3>
          <div v-for="(point, index) in createForm.points" :key="index" class="point-edit-item">
            <div class="point-edit-header">
              <span>打卡点 {{ index + 1 }}</span>
              <el-button type="danger" link @click="removePoint(index)" v-if="createForm.points.length > 1">删除</el-button>
            </div>
            
            <el-form label-position="top">
              <el-form-item label="具体地点名称">
                <el-input v-model="point.name" placeholder="例如：断桥残雪"></el-input>
              </el-form-item>
              <el-form-item label="到达时间">
                <el-time-picker v-model="point.time" placeholder="选择时间" format="HH:mm" value-format="HH:mm" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="通勤方式">
                <el-input v-model="point.transport" placeholder="例如：打车 15min / 步行"></el-input>
              </el-form-item>
              <el-form-item label="我的评价">
                <el-input type="textarea" v-model="point.review" placeholder="记录一下你的游玩感受吧..."></el-input>
              </el-form-item>
              <el-form-item label="打卡照片 (URL)">
                <el-input v-model="point.image" placeholder="输入照片链接 (可选)"></el-input>
              </el-form-item>
            </el-form>
          </div>

          <el-button class="add-point-btn" type="dashed" plain @click="addPoint">
            + 添加新的打卡点
          </el-button>
        </div>

        <div class="submit-bar">
          <el-button type="primary" class="submit-btn" @click="submitCreateRoute">保存并生成足迹</el-button>
        </div>
      </div>
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

      <div class="detail-content">
        <div class="timeline-container">
          <div v-for="(point, index) in currentRoute.points" :key="index" class="point-item">
            <div class="timeline-left">
              <div class="time">{{ point.time }}</div>
              <div class="dot"></div>
              <div class="line" v-if="index !== currentRoute.points.length - 1"></div>
            </div>
            <div class="point-card">
              <img :src="point.image" class="point-img" alt="点位图">
              <div class="point-info">
                <h4 class="point-name">{{ point.name }}</h4>
                <div class="point-meta">
                  <span class="meta-tag transport">🚌 {{ point.transport }}</span>
                  <span class="meta-tag location">📍 {{ point.location }}</span>
                </div>
                <p class="point-desc">{{ point.description }}</p>
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
              <p>{{ point.location }}</p>
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

const router = useRouter()
const route = useRoute()

const goHome = () => {
  router.push('/home') 
}

const currentView = ref('list')
const activeTab = ref('checkin')
const currentRoute = ref({})
const searchKeyword = ref('')

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

// 假数据：已完成通关的路线集合
const completedRoutes = ref([
  {
    id: 'route-1',
    routeName: '成都·玉林路的小酒馆',
    coverImage: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=600&q=80',
    city: '成都',
    createTime: '2026-11-05 21:00',
    points: [
      {
        id: 'p1',
        name: '玉林西路',
        location: '武侯区玉林西路',
        time: '2026-11-05 19:30',
        image: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=800&q=80'
      }
    ]
  }
])

// 删除通关记录
const deleteCompletedRoute = (id, routeName) => {
  ElMessageBox.confirm(`确定要删除「${routeName}」的通关记录吗？`, '删除打卡足迹', {
    confirmButtonText: '确定删除',
    cancelButtonText: '再想想',
    type: 'warning',
    confirmButtonClass: 'el-button--danger'
  }).then(() => {
    const index = completedRoutes.value.findIndex(item => item.id === id)
    if (index > -1) {
      completedRoutes.value.splice(index, 1)
      ElMessage.success('通关记录已删除')
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
  playData.points = playData.points.map(pt => ({ ...pt, isChecked: false }))
  currentPlayRoute.value = playData
  checkedCount.value = 0
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
  }).then(() => {
    point.isChecked = true
    checkedCount.value += 1
    ElMessage.success(`「${point.name}」打卡成功！`)
  }).catch(() => {})
}

const finishGame = () => {
  const newCompletedRoute = {
    id: `completed-${Date.now()}`,
    routeName: currentPlayRoute.value.routeName,
    coverImage: currentPlayRoute.value.coverImage,
    city: currentPlayRoute.value.city || currentPlayRoute.value.routeName.split('·')[0],
    createTime: new Date().toLocaleString(),
    points: currentPlayRoute.value.points.map((pt, index) => ({
      id: `pt-${Date.now()}-${index}`,
      name: pt.name,
      location: pt.location,
      time: new Date().toLocaleTimeString(),
      image: pt.image
    }))
  }
  completedRoutes.value.unshift(newCompletedRoute)

  // 奖杯记录
  trophyCount.value += 1
  localStorage.setItem('citywalk_trophies', trophyCount.value.toString())
  currentTitle.value = `获得第 ${trophyCount.value} 个奖杯`
  showTrophyDialog.value = true
  
  currentView.value = 'list'
  activeTab.value = 'completed'
  currentCompletedView.value = 'list' 
}

const closeTrophyDialog = () => {
  showTrophyDialog.value = false
}

// ======= 我的发布列表逻辑 =======
const myPublishedCount = ref(0)
const myPublishedList = ref([])

const loadPublishedList = () => {
  const publishedData = localStorage.getItem('citywalk_published_list')
  if (publishedData) {
    myPublishedList.value = JSON.parse(publishedData)
    myPublishedCount.value = myPublishedList.value.length
  } else {
    myPublishedList.value = []
    myPublishedCount.value = 0
  }
}
loadPublishedList()

const deletePublishedRoute = (id, routeName) => {
  ElMessageBox.confirm(`确定要撤回并删除发布的路线「${routeName}」吗？`, '撤回发布', {
    confirmButtonText: '确定删除', cancelButtonText: '再想想', type: 'warning', confirmButtonClass: 'el-button--danger'
  }).then(() => {
    const index = myPublishedList.value.findIndex(item => item.id === id)
    if (index > -1) {
      myPublishedList.value.splice(index, 1)
      localStorage.setItem('citywalk_published_list', JSON.stringify(myPublishedList.value))
      myPublishedCount.value = myPublishedList.value.length
      ElMessage.success('已成功撤回发布')
    }
  }).catch(() => {})
}

// ======= 创建打卡路线逻辑 =======
const createForm = ref({
  routeName: '', city: '', coverImage: '',
  points: [{ name: '', time: '09:00', transport: '', review: '', image: '' }]
})

const addPoint = () => {
  createForm.value.points.push({ name: '', time: '12:00', transport: '', review: '', image: '' })
}

const removePoint = (index) => {
  createForm.value.points.splice(index, 1)
}

const submitCreateRoute = () => {
  if (!createForm.value.routeName || !createForm.value.city) {
    ElMessage.warning('请至少填写路线名称和城市！')
    return
  }

  const newRoute = {
    id: Date.now(),
    routeName: `${createForm.value.city}·${createForm.value.routeName}`,
    coverImage: createForm.value.coverImage || 'https://images.unsplash.com/photo-1543781737-0d7c1e62c3df?auto=format&fit=crop&w=600&q=80',
    pointCount: createForm.value.points.length,
    createTime: new Date().toLocaleString(),
    points: createForm.value.points.map(pt => ({
      name: pt.name || '未知打卡点',
      time: pt.time || '12:00',
      location: createForm.value.city,
      transport: pt.transport || '步行',
      image: pt.image || 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
      description: '这是我的打卡足迹。',
      review: pt.review || '暂无评价'
    }))
  }

  checkinList.value.unshift(newRoute)
  
  createForm.value = {
    routeName: '', city: '', coverImage: '',
    points: [{ name: '', time: '09:00', transport: '', review: '', image: '' }]
  }
  currentView.value = 'list'
  ElMessage.success('足迹记录成功！（仅自己可见）')
}

// ======= 删除我的打卡路线逻辑 =======
const deleteMyRoute = (id, routeName) => {
  ElMessageBox.confirm(`确定要删除打卡记录「${routeName}」吗？删除后不可恢复哦。`, '删除打卡足迹', {
    confirmButtonText: '确定删除', cancelButtonText: '再想想', type: 'warning', confirmButtonClass: 'el-button--danger'
  }).then(() => {
    const index = checkinList.value.findIndex(item => item.id === id)
    if (index > -1) {
      checkinList.value.splice(index, 1)
      ElMessage.success('打卡路线已删除')
    }
  }).catch(() => {})
}

// ======= 假数据 =======
const checkinList = ref([
  {
    id: 1,
    routeName: '广州·珠江夜景漫步',
    coverImage: 'https://images.unsplash.com/photo-1543781737-0d7c1e62c3df?auto=format&fit=crop&w=600&q=80', 
    pointCount: 3,
    createTime: '2026-11-01 20:30',
    points: [
      {
        name: '珠江琶醍啤酒文化创意艺术区',
        time: '19:30',
        location: '海珠区阅江西路',
        transport: '打车 15min',
        image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
        description: '傍晚的江风吹着很舒服，很多有格调的酒吧和餐厅，适合拍照打卡。',
        review: '人稍微有点多，但是江景绝美！随便找个清吧喝杯精酿，极度治愈。'
      },
      {
        name: '广州塔（小蛮腰）',
        time: '20:30',
        location: '海珠区阅江西路222号',
        transport: '步行 20min',
        image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
        description: '广州地标建筑，夜景灯光非常绚丽，可以在下面找好角度拍全貌。',
        review: '没上去，就在下面拍了照，灯光变色的瞬间很出片，旁边的海心沙公园也很适合散步。'
      }
    ]
  },
  {
    id: 2,
    routeName: '上海·武康路梧桐区漫游',
    coverImage: 'https://images.unsplash.com/photo-1548625361-ec847ef18515?auto=format&fit=crop&w=600&q=80',
    pointCount: 3,
    createTime: '2026-10-15 14:00',
    points: [
      {
        name: '武康大楼',
        time: '14:00',
        location: '徐汇区淮海中路1850号',
        transport: '地铁10/11号线交通大学站',
        image: 'https://images.unsplash.com/photo-1543169829-9ee2a2a0e7e9?auto=format&fit=crop&w=800&q=80',
        description: '上海标志性的历史建筑，船型外观极具辨识度，路口永远不缺拍照的人。',
        review: '人真的超级多！但是建筑确实好看，在对面买个冰淇淋合影是不错的体验。'
      }
    ]
  },
  {
    id: 3,
    routeName: '北京·胡同里的秋日北平',
    coverImage: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80',
    pointCount: 3,
    createTime: '2026-10-02 09:00',
    points: [
       {
        name: '南锣鼓巷',
        time: '09:00',
        location: '东城区南锣鼓巷胡同',
        transport: '地铁6/8号线南锣鼓巷站',
        image: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=800&q=80',
        description: '北京最古老的街区之一，现在商业化比较严重，但依然保留着胡同的肌理。',
        review: '早上来人比较少，吃个老北京糖油饼，逛逛旁边的小店，感觉还不错。'
      }
    ]
  },
  {
    id: 4,
    routeName: '深圳·从海边到繁华的穿梭',
    coverImage: 'https://images.unsplash.com/photo-1522040969966-403bdf379843?auto=format&fit=crop&w=600&q=80',
    pointCount: 3,
    createTime: '2026-09-20 15:00',
    points: [
      {
        name: '深圳湾公园',
        time: '15:00',
        location: '南山区滨海大道',
        transport: '地铁9号线深圳湾公园站',
        image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80',
        description: '沿着海岸线骑行或散步，对面就是香港，海风很舒服。',
        review: '租个共享单车沿着海边骑，傍晚还能看到绝美的晚霞，可以看到远处的深圳湾大桥。'
      }
    ]
  }
])

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

// 把所有路线里的点位拆解出来，变成一个总的打卡点列表
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

// 从首页跳转过来自动触发打卡
onMounted(() => {
  if (route.query.playRouteId) {
    const targetRoute = favoriteList.value.find(item => item.id == route.query.playRouteId)
    if (targetRoute) {
      startCheckin(targetRoute)
    } else {
      ElMessage.error('找不到该路线的详细数据')
    }
  }
})

const cancelFavorite = (id) => { ElMessage.warning(`取消收藏路线 ID: ${id}`) }
</script>

<style scoped>
/* ================= 基础样式 ================= */
.record-container {
  padding: 20px 15px;
  background: linear-gradient(180deg, #FFF6F0 0%, #F5F7FA 100%);
  min-height: 100vh;
  padding-bottom: 80px;
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

/* ================= 详情页公共 ================= */
.detail-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px dashed #FFE4D6; }
.back-btn { display: flex; align-items: center; gap: 4px; font-size: 15px; color: #FF7A45; font-weight: bold; cursor: pointer; background: #FFF0F3; padding: 6px 12px; border-radius: 20px; }
.detail-title { margin: 0; font-size: 18px; color: #303133; font-weight: 800; }
.header-placeholder { width: 70px; }
.section-title { font-size: 16px; font-weight: bold; color: #303133; margin: 20px 0 10px 0; padding-left: 5px; border-left: 4px solid #FF7A45; }

/* 时间轴 */
.timeline-container { padding: 10px 0; }
.point-item { display: flex; margin-bottom: 10px; }
.timeline-left { display: flex; flex-direction: column; align-items: center; width: 60px; margin-right: 10px; }
.timeline-left .time { font-size: 12px; font-weight: bold; color: #FF7A45; margin-bottom: 5px; }
.timeline-left .dot { width: 12px; height: 12px; background: #FF7A45; border: 3px solid #FFE4D6; border-radius: 50%; z-index: 1; }
.timeline-left .line { width: 3px; flex: 1; background: #FFE4D6; margin: 5px 0; }
.point-card { flex: 1; background: #fff; border-radius: 16px; padding: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); margin-bottom: 15px; }
.point-img { width: 100%; height: 160px; object-fit: cover; border-radius: 12px; margin-bottom: 12px; }
.point-name { margin: 0 0 10px 0; font-size: 17px; color: #303133; }
.point-meta { display: flex; gap: 10px; margin-bottom: 10px; }
.meta-tag { font-size: 12px; padding: 4px 8px; border-radius: 6px; font-weight: 500; }
.transport { background: #FFF0F3; color: #FC6076; }
.location { background: #F0F9EB; color: #67C23A; }
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
.publish-action { margin-top: 10px; margin-bottom: 10px; display: flex; justify-content: flex-end; }
.publish-btn { background: linear-gradient(to right, #FF9A44, #FC6076); border: none; font-weight: bold; box-shadow: 0 4px 10px rgba(252, 96, 118, 0.3); }

/* 创建打卡路线页 */
.create-form { padding-bottom: 80px; }
.form-card { background: #fff; border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.point-edit-item { background: #F9F9F9; border: 1px dashed #DCDFE6; border-radius: 12px; padding: 15px; margin-bottom: 15px; position: relative; }
.point-edit-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; color: #FF7A45; margin-bottom: 10px; }
.add-point-btn { width: 100%; height: 44px; border-radius: 10px; border-color: #FF9A44; color: #FF7A45; background: #FFF9F0; font-weight: bold; }
.add-point-btn:hover { background: #FFF0F3; }
.submit-bar { position: fixed; bottom: 0; left: 0; width: 100%; background: #fff; padding: 10px 15px; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); z-index: 100; box-sizing: border-box; }
.submit-btn { width: 100%; border-radius: 20px; background: linear-gradient(to right, #FF9A44, #FC6076); border: none; font-size: 16px; font-weight: bold; padding: 12px 0; }

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
</style>