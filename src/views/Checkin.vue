<template>
  <div class="checkin-page">
    <!-- 顶部 -->
    <div class="ck-header">
      <button class="ck-back" @click="goBack" aria-label="返回">
        <el-icon><ArrowLeft /></el-icon>
      </button>
      <div class="ck-head-main">
        <div class="ck-title">{{ routeName }}</div>
        <div class="ck-sub">{{ routeCity }} · 共 {{ points.length }} 个点位</div>
      </div>
    </div>

    <!-- 进度 -->
    <div class="ck-progress">
      <div class="ck-progress-text">
        <span>已打卡 <b>{{ checkedIds.length }}</b> / {{ points.length }}</span>
        <span class="ck-percent">{{ progressPercent }}%</span>
      </div>
      <div class="ck-progress-bar">
        <div class="ck-progress-inner" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <div class="ck-tip">到达点位附近（200 米内）才能打卡，全部完成后获得奖杯</div>
    </div>

    <!-- 点位列表 -->
    <div v-if="loading" class="ck-loading">加载中...</div>
    <div v-else class="ck-list">
      <div
        v-for="(p, index) in points"
        :key="p.id"
        class="ck-item"
        :class="{ done: checkedIds.includes(p.id) }"
      >
        <div class="ck-index" :class="{ done: checkedIds.includes(p.id) }">
          {{ checkedIds.includes(p.id) ? '✓' : index + 1 }}
        </div>
        <div class="ck-main">
          <div class="ck-name">{{ p.pointName }}</div>
          <div class="ck-desc">{{ p.description || '暂无简介' }}</div>
          <div class="ck-actions">
            <el-button size="small" @click="goToMap(p, index)">前往地图</el-button>
            <el-button
              size="small"
              type="success"
              :disabled="checkedIds.includes(p.id)"
              :loading="checkingId === p.id"
              @click="onCheckin(p)"
            >{{ checkedIds.includes(p.id) ? '已打卡' : '到此打卡' }}</el-button>
            <span v-if="distanceTip[p.id]" class="ck-distance">{{ distanceTip[p.id] }}</span>
            <span
              v-if="!checkedIds.includes(p.id)"
              class="ck-demo"
              @click="demoCheckin(p)"
            >演示打卡</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部结算 -->
    <div class="ck-footer">
      <el-button
        type="primary"
        round
        class="ck-finish"
        :disabled="checkedIds.length < points.length"
        @click="finish"
      >
        {{ checkedIds.length < points.length ? `还差 ${points.length - checkedIds.length} 个点位` : (finished ? '查看打卡记录' : '完成并结算') }}
      </el-button>
    </div>

    <!-- 奖杯弹窗 -->
    <el-dialog v-model="trophyVisible" width="80%" class="trophy-dialog" :show-close="false">
      <div class="trophy-body">
        <div class="trophy-emoji">🎉</div>
        <div class="trophy-title">恭喜通关！</div>
        <div class="trophy-medal">🏆 获得第 {{ trophyNo }} 个奖杯</div>
        <div class="trophy-desc">恭喜你完成了「{{ routeName }}」CityWalk 闯关！<br />当前累计奖杯：{{ trophyNo }} 个</div>
        <el-button type="primary" round class="trophy-btn" @click="closeTrophy">收下奖杯</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRouteDetailFullAPI } from '@/api/route'
import { submitCheckinAPI, getCheckinStatusAPI, getTrophyAPI } from '@/api/checkin'

const route = useRoute()
const router = useRouter()
const routeId = computed(() => Number(route.params.id))

const routeName = ref('')
const routeCity = ref('')
const points = ref([])
const checkedIds = ref([])
const loading = ref(true)
const checkingId = ref(null)
const distanceTip = ref({})
const finished = ref(false)
const trophyVisible = ref(false)
const trophyNo = ref(1)

const progressPercent = computed(() => {
  if (!points.value.length) return 0
  return Math.round((checkedIds.value.length / points.value.length) * 100)
})

const goBack = () => {
  if (window.history.length > 1) router.back()
  else router.push(`/detail/${routeId.value}`)
}

const loadDetail = async () => {
  try {
    const res = await getRouteDetailFullAPI(routeId.value)
    if (res.code === 200 && res.data) {
      routeName.value = res.data.route.routeName
      routeCity.value = res.data.route.city
      points.value = res.data.points || []
    }
  } catch (e) {
    ElMessage.error('路线加载失败')
  } finally {
    loading.value = false
  }
}

const loadStatus = async () => {
  try {
    const res = await getCheckinStatusAPI(routeId.value)
    if (res.code === 200 && res.data) {
      checkedIds.value = res.data.checkedPointIds || []
      finished.value = checkedIds.value.length >= points.value.length && points.value.length > 0
    }
  } catch (e) {
    checkedIds.value = []
  }
}

// 浏览器定位（10 秒超时），失败返回 null
const getPosition = () => new Promise((resolve) => {
  if (!navigator.geolocation) return resolve(null)
  let done = false
  const timer = setTimeout(() => {
    if (!done) { done = true; resolve(null) }
  }, 10000)
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      if (done) return
      done = true
      clearTimeout(timer)
      resolve({ lng: pos.coords.longitude, lat: pos.coords.latitude, accuracy: pos.coords.accuracy })
    },
    () => {
      if (done) return
      done = true
      clearTimeout(timer)
      resolve(null)
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
})

const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371000
  const rad = (d) => (d * Math.PI) / 180
  const dLat = rad(lat1 - lat2)
  const dLng = rad(lng1 - lng2)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * Math.asin(Math.sqrt(a)) * R
}

const onCheckin = async (p) => {
  if (checkedIds.value.includes(p.id)) return
  if (p.longitude == null || p.latitude == null) {
    ElMessage.warning('该点位缺少坐标，无法打卡')
    return
  }
  checkingId.value = p.id
  try {
    const pos = await getPosition()
    let lng = p.longitude
    let lat = p.latitude

    if (pos) {
      const dist = haversine(pos.lat, pos.lng, Number(p.latitude), Number(p.longitude))
      if (dist > 200) {
        distanceTip.value[p.id] = `距该点位约 ${Math.round(dist)} 米`
        ElMessage.warning(`距「${p.pointName}」约 ${Math.round(dist)} 米，请到达点位附近再打卡`)
        return
      }
      distanceTip.value[p.id] = `距该点位约 ${Math.round(dist)} 米`
      lng = pos.lng
      lat = pos.lat
    } else {
      await ElMessageBox.confirm(
        '无法获取当前定位。是否使用演示模式打卡（不校验位置）？',
        '定位不可用',
        { confirmButtonText: '演示打卡', cancelButtonText: '取消', type: 'warning' }
      )
    }

    const res = await submitCheckinAPI({
      pointId: p.id,
      checkinLng: lng,
      checkinLat: lat
    })
    if (res.code === 200 && res.data) {
      checkedIds.value = res.data.checkedPointIds || checkedIds.value
      ElMessage.success(`「${p.pointName}」打卡成功`)
      if (res.data.finished) {
        finished.value = true
        trophyNo.value = res.data.trophyNo || trophyNo.value
        trophyVisible.value = true
      }
    }
  } catch (e) {
    if (e && e !== 'cancel' && e !== 'close') {
      // 业务错误信息已由请求拦截器提示
    }
  } finally {
    checkingId.value = null
  }
}

// 演示打卡：不校验定位，直接用点位坐标提交，方便没有到现场时演示流程
const demoCheckin = async (p) => {
  if (checkedIds.value.includes(p.id)) return
  checkingId.value = p.id
  try {
    const res = await submitCheckinAPI({
      pointId: p.id,
      checkinLng: p.longitude,
      checkinLat: p.latitude
    })
    if (res.code === 200 && res.data) {
      checkedIds.value = res.data.checkedPointIds || checkedIds.value
      ElMessage.success(`「${p.pointName}」演示打卡成功`)
      if (res.data.finished) {
        finished.value = true
        trophyNo.value = res.data.trophyNo || trophyNo.value
        trophyVisible.value = true
      }
    }
  } catch (e) {
    /* 错误提示由请求拦截器处理 */
  } finally {
    checkingId.value = null
  }
}

const goToMap = (p, index) => {  router.push({
    path: '/map',
    query: {
      targetLng: p.longitude,
      targetLat: p.latitude,
      from: 'detail',
      detailId: routeId.value,
      pointIndex: index,
      routeName: routeName.value || ''
    }
  })
}

const closeTrophy = () => {
  trophyVisible.value = false
  router.push('/record')
}

const finish = () => {
  if (checkedIds.value.length < points.value.length) return
  router.push('/record')
}

onMounted(async () => {
  await loadDetail()
  await loadStatus()
  if (finished.value) {
    try {
      const res = await getTrophyAPI()
      if (res.code === 200 && res.data) trophyNo.value = res.data.trophyCount
    } catch (e) { /* ignore */ }
  }
})
</script>

<style scoped>
.checkin-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 88px;
}
.ck-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 14px 10px;
  background: #fff;
}
.ck-back {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #fff1e6;
  color: #ff6b35;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
.ck-back:active { transform: scale(.94); }
.ck-head-main { flex: 1; min-width: 0; }
.ck-title {
  font-size: 17px;
  font-weight: 600;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ck-sub { margin-top: 2px; font-size: 12px; color: #999; }

.ck-progress {
  margin: 10px 14px;
  padding: 12px 14px;
  background: #fff;
  border-radius: 14px;
}
.ck-progress-text {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 13px;
  color: #666;
}
.ck-progress-text b { font-size: 18px; color: #ff6b35; }
.ck-percent { color: #ff6b35; font-weight: 600; }
.ck-progress-bar {
  margin-top: 8px;
  height: 8px;
  border-radius: 4px;
  background: #f0f1f3;
  overflow: hidden;
}
.ck-progress-inner {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #ffab6b, #ff6b35);
  transition: width .25s ease;
}
.ck-tip { margin-top: 8px; font-size: 12px; color: #aaa; }

.ck-loading { text-align: center; color: #999; padding: 30px 0; }
.ck-list { padding: 0 14px; }
.ck-item {
  display: flex;
  gap: 10px;
  padding: 14px;
  margin-bottom: 10px;
  background: #fff;
  border-radius: 14px;
}
.ck-item.done { opacity: .92; }
.ck-index {
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #1677ff;
  color: #fff;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ck-index.done { background: #12a150; }
.ck-main { flex: 1; min-width: 0; }
.ck-name { font-size: 15px; font-weight: 600; color: #222; }
.ck-desc { margin-top: 3px; font-size: 12px; color: #888; }
.ck-actions {
  margin-top: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.ck-distance { font-size: 11px; color: #999; }
.ck-demo {
  font-size: 11px;
  color: #b0b0b0;
  text-decoration: underline;
  padding: 2px 4px;
}
.ck-demo:active { color: #ff6b35; }

.ck-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, .96);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, .06);
  z-index: 20;
}
.ck-finish {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #ff8a4c, #ff6b35);
  border: none;
}

.trophy-body { text-align: center; padding: 6px 4px 4px; }
.trophy-emoji { font-size: 34px; }
.trophy-title { margin-top: 4px; font-size: 20px; font-weight: 700; color: #222; }
.trophy-medal { margin-top: 12px; font-size: 16px; font-weight: 600; color: #ff6b35; }
.trophy-desc { margin-top: 10px; font-size: 13px; color: #666; line-height: 1.7; }
.trophy-btn { margin-top: 18px; width: 160px; height: 40px; }
</style>
