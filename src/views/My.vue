<template>
  <div class="page-my">
    <!-- 顶部头部区域：头像、昵称、佩戴称号标签、用户ID -->
    <!-- 优先使用用户上传的bgImage，没有就兜底 /pictures/city-bg.png -->
    <div
      class="my-header"
      :style="{backgroundImage: userInfo.bgImage ? `url(${userInfo.bgImage})` : `url(/pictures/city-bg.png)`}"
    >
      <div class="user-profile">
        <el-avatar :size="80" :src="userInfo.avatar" class="avatar">
          <span v-if="!userInfo.avatar">用</span>
        </el-avatar>
        <div class="user-meta">
          <div class="nickname-row">
            <span class="nickname">{{ userInfo.nickname || "匿名用户" }}</span>
            <span class="title-tag">{{ wearTitle.name }}</span>
          </div>
          <div class="user-id">用户ID：{{ userInfo.userNo || userInfo.userId || userInfo.id || '-' }}</div>
          <div class="user-ip" v-if="userInfo.signature">{{ userInfo.signature }}</div>

        </div>
      </div>
      <!-- 数据统计卡片：发布路线数量、总获赞数量、粉丝数量 -->
      <div class="stat-card">
        <div class="stat-item">
          <div class="num">{{ stat.publishCount }}</div>
          <div class="label">发布路线</div>
        </div>
        <div class="divider"></div>
        <div class="stat-item">
          <div class="num">{{ stat.likeTotal }}</div>
          <div class="label">总获赞</div>
        </div>
        <div class="divider"></div>
        <div class="stat-item">
          <div class="num">{{ stat.fansCount }}</div>
          <div class="label">粉丝</div>
        </div>
      </div>
    </div>

    <!-- 奖杯卡片：点击跳转称号页面 -->
    <div class="trophy-card">
      <div class="trophy-left">
        <div class="trophy-title">我的奖杯</div>
        <div class="trophy-num">{{ trophyCount }}</div>
      </div>
      <div class="trophy-right" @click="goTitleList">
        <span>当前称号：{{ wearTitle.name }}</span>
        <el-icon class="arrow"><ArrowRight /></el-icon>
      </div>
    </div>

    <!-- 功能菜单列表 -->
    <div class="menu-group">
      <div class="menu-item" @click="goMyPublish">
        <span>我的发布</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="goMyLike">
        <span>我的点赞</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="goMyFollow">
        <span>我的关注</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="goRecycle">
        <span>我的垃圾站</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="goMessage">
        <span>消息通知</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="goSetting">
        <span>系统设置</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
    </div>

    <!-- 退出登录 -->
    <div class="logout-wrap">
      <el-button class="btn-logout" type="default" plain @click="handleLogout">退出登录</el-button>
    </div>

    <!-- ========== 底部Tab导航，与Home/Publish/Record/Map完全统一 ========== -->
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
import { ref, onMounted, onActivated, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { getUserInfoAPI } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

// 用户信息兜底，避免 store 还没恢复时模板读 undefined 报错
const userInfo = computed(() => userStore.userInfo || {})

// 统计数据
const stat = ref({
  publishCount: 0,
  likeTotal: 0,
  fansCount: 0
})

// 奖杯数量
const trophyCount = ref(0)

// 全部称号配置（need = 需要的奖杯数）
const allTitleList = ref([
  { name: '初入城市', need: 0 },
  { name: '新手行者', need: 1 },
  { name: '打卡爱好者', need: 5 },
  { name: '路线探索达人', need: 10 },
  { name: '资深漫步探险家', need: 20 },
  { name: '城市漫游大师', need: 30 }
])

// 当前称号：由奖杯数推导，奖杯增加时自动跟着变
const wearTitle = computed(() => {
  let current = allTitleList.value[0]
  allTitleList.value.forEach(item => {
    if (trophyCount.value >= item.need) current = item
  })
  return current
})

// 读本地存档（打卡记录 / 已发布路线 / 奖杯数），后端接口不通时用它兜底
const readLocalStat = () => {
  try {
    const published = JSON.parse(localStorage.getItem('citywalk_published_list') || '[]')
    const checkin = JSON.parse(localStorage.getItem('citywalk_checkin_list') || '[]')
    const trophies = parseInt(localStorage.getItem('citywalk_trophies') || '0', 10)
    stat.value.publishCount = (Array.isArray(published) ? published.length : 0) +
      (Array.isArray(checkin) ? checkin.length : 0)
    trophyCount.value = Number.isNaN(trophies) ? 0 : trophies
  } catch (e) {
    console.warn('本地统计数据读取失败', e)
  }
}

// 获取用户信息、奖杯数据：接口不可用时退回本地统计，不弹错误
const getStatInfo = async () => {
  readLocalStat()
  try {
    const res = await getUserInfoAPI()
    if (res && res.code === 200 && res.data) {
      // 头像、背景图、昵称等以服务端为准，回写 store 才能刷新头部
      userStore.setUserInfo(res.data)
      stat.value.publishCount = res.data.publishCount ?? stat.value.publishCount
      stat.value.likeTotal = res.data.likeTotal ?? stat.value.likeTotal
      stat.value.fansCount = res.data.fansCount ?? stat.value.fansCount
      trophyCount.value = res.data.trophyCount ?? trophyCount.value
    }
  } catch (e) {
    console.warn('用户统计接口不可用，已使用本地数据', e)
  }
}

// 进入页面即刷新；若外层加了 keep-alive，再次进入也会刷新
onMounted(getStatInfo)
onActivated(getStatInfo)

const goTitleList = () => {
  ElMessage.info('称号页面尚未创建')
}
const goMyPublish = () => {
  router.push('/my-publish')
}
const goMyLike = () => {
  router.push('/my-like')
}
const goMyFollow = () => {
  router.push('/my-follow')
}
const goRecycle = () => {
  router.push('/recycle')
}
const goMessage = () => {
  router.push('/message')
}
const goSetting = () => {
  router.push('/setting')
}

const handleLogout = () => {
  userStore.clearUser()
  router.replace('/login')
}
</script>

<style scoped>
.page-my {
  background: linear-gradient(180deg, #fff7ed 0%, #ffe4c7 45%, #ffd2a8 100%);
  min-height: 100vh;
  padding-bottom: 76px;
  box-sizing: border-box;
}

/* 头部：背景图 + 兜底橙色渐变 */
.my-header {
  background: linear-gradient(135deg, #e85d3a, #ff8c42);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: #ffffff;
  padding: 44px 20px 24px;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  position: relative;
}

/* 半透明遮罩，保证文字看得清 */
.my-header::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.25);
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  z-index: 1;
}
.user-profile,
.stat-card {
  position: relative;
  z-index: 2;
}
.user-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.avatar {
  border: 2px solid #fff;
  flex-shrink: 0;
}
.user-meta {
  flex: 1;
  min-width: 0;
}
.nickname-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.user-meta .nickname {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
}
.title-tag {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.28);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.45);
  white-space: nowrap;
}
.user-meta .user-id {
  font-size: 13px;
  opacity: 0.85;
  margin-top: 4px;
}
.user-meta .user-ip {
  font-size: 13px;
  opacity: 0.75;
  margin-top: 4px;
}
.stat-card {
  background: rgba(255, 255, 255, 0.22);
  border-radius: 16px;
  display: flex;
  text-align: center;
  padding: 18px 0;
}
.stat-item {
  flex: 1;
}
.divider {
  width: 1px;
  background: rgba(255, 255, 255, 0.35);
}
.stat-item .num {
  font-size: 26px;
  font-weight: bold;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
.stat-item .label {
  font-size: 13px;
  opacity: 0.92;
  margin-top: 4px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 奖杯卡片 */
.trophy-card {
  margin: 16px;
  background: #fff;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}
.trophy-left .trophy-title {
  font-size: 14px;
  color: #666;
}
.trophy-left .trophy-num {
  font-size: 24px;
  font-weight: bold;
  color: #e85d3a;
  margin-top: 4px;
  line-height: 1.2;
}
.trophy-right {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #999;
  font-size: 14px;
  cursor: pointer;
}
.trophy-right:hover {
  color: #e85d3a;
}

.menu-group {
  margin: 16px;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}
.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px;
  font-size: 15px;
  color: #222;
  border-bottom: 1px solid #f2f2f2;
  cursor: pointer;
}
.menu-item:last-child {
  border-bottom: none;
}

.logout-wrap {
  margin: 24px 16px 8px;
}
.btn-logout {
  width: 100%;
  height: 48px;
  border-radius: 14px;
  font-size: 15px;
  color: #e85d3a;
  border-color: #e85d3a;
  transition: 0.2s ease;
}
.btn-logout:hover {
  background-color: #fff2ee;
}
.btn-logout:active {
  transform: scale(0.98);
}

/* =========底部Tab栏：与 Home/Map/Publish/Record 完全统一 ========= */
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
.tab-bar .tab-item.active {
  color: #409eff;
}
.tab-bar .tab-icon {
  font-size: 20px;
}
.tab-bar .tab-text {
  font-size: 14px;
  line-height: 1;
}
</style>
