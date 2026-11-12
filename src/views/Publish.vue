<template>
  <div class="publish-container">
    <!-- 顶部返回 -->
    <div class="detail-header">
      <div class="back-btn" @click="handleBack">
        <el-icon><ArrowLeft /></el-icon> 返回
      </div>
      <h2 class="detail-title">创建 · 发布路线</h2>
      <div class="header-placeholder"></div>
    </div>

    <div class="create-form">
      <!-- 发布方式：公开到首页 还是 只记在自己的打卡记录里 -->
      <div class="form-card">
        <h3 class="section-title">🔀 发布方式</h3>
        <div class="scope-options">
          <div class="scope-item" :class="{ active: publishForm.isPublic }" @click="publishForm.isPublic = true">
            <div class="scope-head">
              <span class="scope-radio" :class="{ on: publishForm.isPublic }"></span>
              <span class="scope-title">公开到首页</span>
            </div>
            <p class="scope-desc">提交后进入管理员审核，通过后其他用户在首页也能看到；这条记录在「打卡记录」里显示为「公开记录」。</p>
          </div>
          <div class="scope-item" :class="{ active: !publishForm.isPublic }" @click="publishForm.isPublic = false">
            <div class="scope-head">
              <span class="scope-radio" :class="{ on: !publishForm.isPublic }"></span>
              <span class="scope-title">仅记录，不发布</span>
            </div>
            <p class="scope-desc">只保存到「打卡记录」，显示为「未公开记录」，不会出现在首页，别人看不到。</p>
          </div>
        </div>
      </div>

      <!-- 快捷导入：仅「仅记录，不发布」时可从首页路线复制 -->
      <div v-if="!publishForm.isPublic" class="form-card import-card">
        <h3 class="section-title">✨ 快捷导入</h3>
        <p style="font-size: 13px; color: #909399; margin-bottom: 10px;">
          从首页已上线的路线一键带出名称和点位，不用重新填写。
        </p>
        <div class="import-row">
          <div class="import-controls">
            <el-select v-model="selectedHomeRouteId" placeholder="选择一条首页已上线的路线" filterable style="flex: 1;">
              <el-option
                v-for="item in homeRouteList"
                :key="item.id"
                :label="item.routeName"
                :value="item.id"
              >
                <span>{{ item.routeName }}</span>
                <span style="float: right; color: #C0C4CC; font-size: 12px;">{{ item.city }}</span>
              </el-option>
            </el-select>
            <el-button type="primary" plain @click="importFromHomeRoute" :disabled="!selectedHomeRouteId">
              复制导入
            </el-button>
          </div>
        </div>
      </div>

      <!-- 基础信息 -->
      <div class="form-card">
        <h3 class="section-title">📝 路线基础信息</h3>
        <el-form label-position="top">
          <el-form-item label="路线名称">
            <el-input v-model="publishForm.routeName" placeholder="例如：杭州·西湖漫步"></el-input>
          </el-form-item>
          <el-form-item label="所属城市">
            <el-input v-model="publishForm.city" placeholder="例如：杭州"></el-input>
          </el-form-item>
          <el-form-item label="路线封面图 (URL)">
            <el-input v-model="publishForm.coverImage" placeholder="输入图片链接 (可选)"></el-input>
          </el-form-item>
          <el-form-item label="路线简介 / 游玩提示">
            <el-input type="textarea" v-model="publishForm.description" placeholder="写一点走心推荐吧..."></el-input>
          </el-form-item>
          <el-form-item label="路线标签（可多选）">
            <el-select
              v-model="publishForm.tagIds"
              multiple
              placeholder="选择标签，首页就能按分类筛到它"
              style="width: 100%;"
            >
              <el-option v-for="t in tagOptions" :key="t.id" :label="t.tagName" :value="t.id" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 打卡点列表 (动态添加) -->
      <div class="form-card">
        <h3 class="section-title">📍 途径打卡点</h3>
        
        <div v-for="(point, index) in publishForm.points" :key="index" class="point-edit-item">
          <div class="point-edit-header">
            <span>打卡点 {{ index + 1 }}</span>
            <el-button type="danger" link @click="removePoint(index)" v-if="publishForm.points.length > 1">删除</el-button>
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
            <el-form-item label="看点 / 小贴士 (选填)">
              <el-input v-model="point.tip" placeholder="例如：红树林与候鸟，看日落最好的位置"></el-input>
            </el-form-item>
            <el-form-item label="点位介绍 / 感受 (选填)">
              <el-input type="textarea" :rows="2" v-model="point.description" placeholder="想在这里做什么、有什么感受，写两句..."></el-input>
            </el-form-item>
            <el-form-item label="打卡照片 (URL)">
              <el-input v-model="point.image" placeholder="输入照片链接 (可选)"></el-input>
            </el-form-item>
            <el-form-item label="地点位置">
              <div class="loc-field">
                <el-input
                  v-model="point.address"
                  class="loc-input"
                  placeholder="在这里填写地点或地址，例如：广州市荔湾区中山七路陈家祠"
                  clearable
                  @keyup.enter="locateAddress(point)"
                />
                <div class="loc-actions">
                  <el-button :loading="point.locating" @click="locateAddress(point)">按地址定位</el-button>
                  <el-button class="map-pick-btn" @click="openMapPicker(index)">在地图上选点</el-button>
                </div>
                <div class="loc-status" :class="{ 'loc-ok': hasCoord(point) }">
                  <span v-if="hasCoord(point)">📍 已定位：{{ point.address || coordText(point) }}（{{ coordText(point) }}）</span>
                  <span v-else>还未定位：在上面输入框填好地址后点「按地址定位」；也可以点「在地图上选点」直接在地图上标记</span>
                </div>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <el-button class="add-point-btn" @click="addPoint">
          + 添加新的打卡点
        </el-button>
      </div>

      <!-- 地图选点弹窗 -->
      <el-dialog v-model="mapDialogVisible" title="在地图上选择位置" width="90%" class="map-pick-dialog" destroy-on-close @closed="onMapDialogClosed">
        <div class="map-pick-toolbar">
          <el-input
            v-model="mapSearchKeyword"
            placeholder="搜索地点，例如：陈家祠"
            clearable
            @keyup.enter="searchOnMap"
          ></el-input>
          <el-button type="primary" plain :loading="mapSearching" @click="searchOnMap">搜索</el-button>
        </div>
        <div ref="mapPickRef" class="map-pick-canvas"></div>
        <div class="map-pick-tip">
          <span v-if="tempPick.hasCoord">📍 {{ tempPick.address || '已选择位置' }}（{{ tempPick.lng }}, {{ tempPick.lat }}）</span>
          <span v-else>在地图上点击或拖动标记，选择打卡点位置</span>
        </div>
        <template #footer>
          <el-button @click="mapDialogVisible = false">取消</el-button>
          <el-button type="primary" :disabled="!tempPick.hasCoord" @click="confirmMapPick">用这个位置</el-button>
        </template>
      </el-dialog>

      <!-- 提交按钮 -->
      <div class="submit-bar">
        <el-button type="primary" class="submit-btn" :loading="submitting" @click="submitPublish">
          {{ publishForm.isPublic ? '提交审核并公开到首页' : '保存为未公开记录' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { load } from '@amap/amap-jsapi-loader'
import request from '@/utils/request'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

// 1. 从首页路线复制来的记录 id（保存时更新这条记录，不再新建）
const selectedRecordId = ref(null)
// 首页已上线路线（复制导入用）
const homeRouteList = ref([])
const selectedHomeRouteId = ref(null)
const submitting = ref(false)

// 2. 发布表单数据
const publishForm = ref({
  routeName: '',
  city: '',
  coverImage: '',
  description: '',
  tagIds: [],
  isPublic: true,
  points: [
    { name: '', time: '09:00', transport: '', tip: '', description: '', image: '', address: '', longitude: '', latitude: '' }
  ]
})

// 点位是否已经有坐标
const hasCoord = (point) => {
  const lng = parseFloat(point.longitude)
  const lat = parseFloat(point.latitude)
  return Number.isFinite(lng) && Number.isFinite(lat)
}
const coordText = (point) => `${Number(point.longitude).toFixed(4)}, ${Number(point.latitude).toFixed(4)}`

// ==================== 地点定位 / 地图选点 ====================
let AMapLib = null
let mapPickInstance = null
let mapPickMarker = null
let mapPickGeocoder = null

const mapDialogVisible = ref(false)
const mapSearchKeyword = ref('')
const mapSearching = ref(false)
const mapPickRef = ref(null)
const pickIndex = ref(-1)
// 弹窗里临时选中的位置，点「用这个位置」后才写回表单
const tempPick = ref({ lng: '', lat: '', address: '', hasCoord: false })

const ensureAMap = async () => {
  if (AMapLib) return AMapLib
  window._AMapSecurityConfig = { securityJsCode: import.meta.env.VITE_AMAP_SECRET }
  AMapLib = await load({
    key: import.meta.env.VITE_AMAP_KEY,
    version: '2.0',
    plugins: ['AMap.Geocoder', 'AMap.PlaceSearch', 'AMap.AutoComplete']
  })
  return AMapLib
}

const geocodeText = async (address) => {
  const AMap = await ensureAMap()
  if (!mapPickGeocoder) mapPickGeocoder = new AMap.Geocoder({ city: publishForm.value.city || '全国' })
  const keyword = publishForm.value.city && !address.includes(publishForm.value.city)
    ? `${publishForm.value.city}${address}`
    : address
  const result = await new Promise((resolve, reject) => {
    mapPickGeocoder.getLocation(keyword, (status, res) => {
      if (status === 'complete' && res.geocodes && res.geocodes.length) resolve(res.geocodes[0])
      else reject(new Error('没找到这个地址'))
    })
  })
  return { lng: String(result.location.lng), lat: String(result.location.lat), address: result.formattedAddress || address }
}

// 填地址 → 自动定位（不需要用户知道经纬度）
const locateAddress = async (point) => {
  const address = String(point.address || '').trim()
  if (!address) {
    ElMessage.warning('请先填写地址，或直接点「地图选点」')
    return
  }
  point.locating = true
  try {
    const g = await geocodeText(address)
    point.longitude = g.lng
    point.latitude = g.lat
    point.address = g.address
    ElMessage.success('已定位到该地址')
  } catch (e) {
    ElMessage.warning('没有找到这个地址，换个说法或直接在地图上选点')
  } finally {
    point.locating = false
  }
}

const setTempMarker = (lng, lat) => {
  if (!mapPickInstance) return
  if (!mapPickMarker) {
    mapPickMarker = new AMapLib.Marker({
      position: [lng, lat],
      draggable: true,
      cursor: 'move'
    })
    mapPickMarker.on('dragend', (e) => {
      const pos = e.target.getPosition()
      applyTempPick(pos.lng, pos.lat)
    })
    mapPickInstance.add(mapPickMarker)
  } else {
    mapPickMarker.setPosition([lng, lat])
  }
  tempPick.value = { lng: String(lng), lat: String(lat), address: tempPick.value.address, hasCoord: true }
}

const applyTempPick = (lng, lat) => {
  tempPick.value = { lng: String(lng), lat: String(lat), address: '', hasCoord: true }
  if (mapPickInstance) mapPickInstance.setCenter([lng, lat])
  if (!mapPickGeocoder) mapPickGeocoder = new AMapLib.Geocoder({ city: publishForm.value.city || '全国' })
  mapPickGeocoder.getAddress([lng, lat], (status, res) => {
    if (status === 'complete' && res.regeocode) {
      tempPick.value.address = res.regeocode.formattedAddress || ''
    }
  })
}

const initMapPicker = async () => {
  const AMap = await ensureAMap()
  const point = pickIndex.value >= 0 ? publishForm.value.points[pickIndex.value] : null
  const startLng = point && hasCoord(point) ? parseFloat(point.longitude) : 113.2644
  const startLat = point && hasCoord(point) ? parseFloat(point.latitude) : 23.1291
  mapPickInstance = new AMap.Map(mapPickRef.value, {
    zoom: 16,
    center: [startLng, startLat],
    resizeEnable: true
  })
  if (point && hasCoord(point)) {
    tempPick.value = { lng: String(startLng), lat: String(startLat), address: point.address || '', hasCoord: true }
    setTempMarker(startLng, startLat)
  }
  mapPickInstance.on('click', (e) => {
    applyTempPick(e.lnglat.getLng(), e.lnglat.getLat())
    setTempMarker(e.lnglat.getLng(), e.lnglat.getLat())
  })
}

const openMapPicker = async (index) => {
  pickIndex.value = index
  tempPick.value = { lng: '', lat: '', address: '', hasCoord: false }
  mapDialogVisible.value = true
  try {
    await nextTick()
    await initMapPicker()
  } catch (e) {
    ElMessage.error('地图加载失败，请检查网络后重试')
    mapDialogVisible.value = false
  }
}

// 弹窗内搜索地点
const searchOnMap = async () => {
  const keyword = String(mapSearchKeyword.value || '').trim()
  if (!keyword) return
  mapSearching.value = true
  try {
    const AMap = await ensureAMap()
    const placeSearch = new AMap.PlaceSearch({ city: publishForm.value.city || '全国', pageSize: 5 })
    const result = await new Promise((resolve, reject) => {
      placeSearch.search(keyword, (status, res) => {
        if (status === 'complete' && res.poiList && res.poiList.pois && res.poiList.pois.length) resolve(res.poiList.pois[0])
        else reject(new Error('没搜到'))
      })
    })
    const lng = result.location.lng
    const lat = result.location.lat
    tempPick.value = { lng: String(lng), lat: String(lat), address: result.name || keyword, hasCoord: true }
    mapPickInstance.setZoomAndCenter(17, [lng, lat])
    setTempMarker(lng, lat)
  } catch (e) {
    ElMessage.warning('没有搜到这个地方，换个关键词试试')
  } finally {
    mapSearching.value = false
  }
}

const confirmMapPick = () => {
  if (!tempPick.value.hasCoord) return
  const point = publishForm.value.points[pickIndex.value]
  if (!point) return
  point.longitude = tempPick.value.lng
  point.latitude = tempPick.value.lat
  if (tempPick.value.address) point.address = tempPick.value.address
  mapDialogVisible.value = false
  ElMessage.success('位置已选好')
}

const onMapDialogClosed = () => {
  if (mapPickInstance) {
    mapPickInstance.destroy()
    mapPickInstance = null
  }
  mapPickMarker = null
  mapSearchKeyword.value = ''
  tempPick.value = { lng: '', lat: '', address: '', hasCoord: false }
}

// 可选标签（来自后端 /tag/list，后台标签管理改了这里会同步）
const tagOptions = ref([])
const loadTagOptions = async () => {
  try {
    const res = await request.get('/tag/list')
    if (res && res.code === 200 && Array.isArray(res.data)) {
      tagOptions.value = res.data
    }
  } catch (e) {
    tagOptions.value = []
  }
}

// 首页已上线路线，供「从首页路线复制」导入
const loadHomeRoutes = async () => {
  try {
    const res = await request.get('/route/list', { params: { page: 1, size: 30 } })
    if (res && res.code === 200) {
      homeRouteList.value = (res.data || []).map(r => ({
        id: r.id,
        routeName: r.routeName,
        city: r.city,
        coverImage: /^(http|data:image)/.test(String(r.coverImage || '')) ? r.coverImage : ''
      }))
    }
  } catch (err) {
    console.error('首页路线加载失败', err)
    homeRouteList.value = []
  }
}

onMounted(async () => {
  await loadTagOptions()
  await loadHomeRoutes()
  restoreDraft()
})

// 把点位列表写进表单（统一字段结构）
const applyPointsToForm = (points) => {
  publishForm.value.points = points.map(p => ({
    name: p.name || '',
    time: p.time || p.planTime || '09:00',
    transport: p.transport || '',
    tip: p.tip || p.tag || '',
    description: p.description || '',
    image: p.image || '',
    address: p.address || p.location || '',
    longitude: p.longitude ?? '',
    latitude: p.latitude ?? ''
  }))
}

// 首页点位的 description 是「地址：xxx；建议到达 09:00；通勤：步行；看点：xxx；介绍：xxx」这种拼装文本，
// 这里按同样规则拆回地址 / 计划时间 / 通勤方式 / 看点 / 纯介绍
const parseRoutePoint = (p) => {
  const raw = String(p.description || '').trim()
  let address = ''
  let time = ''
  let transport = ''
  let tip = ''
  let desc = raw
  if (raw.startsWith('地址：')) {
    desc = ''
    raw.split('；').forEach(seg => {
      const s = seg.trim()
      if (!s) return
      if (s.startsWith('地址：')) {
        address = s.substring(3).trim()
      } else if (s.startsWith('建议到达')) {
        const t = s.replace('建议到达', '').trim()
        const idx = t.indexOf('，通勤：')
        if (idx > 0) {
          time = t.substring(0, idx).trim()
          transport = t.substring(idx + 4).trim()
        } else {
          time = t
        }
      } else if (s.startsWith('通勤：')) {
        transport = s.substring(3).trim()
      } else if (s.startsWith('看点：')) {
        tip = s.substring(3).trim()
      } else if (s.startsWith('介绍：')) {
        const d = s.substring(3).trim()
        desc = desc ? `${desc}；${d}` : d
      } else {
        desc = desc ? `${desc}；${s}` : s
      }
    })
  }
  return {
    name: p.pointName || '',
    time: time || '09:00',
    transport,
    tip: tip || p.tag || '',
    description: desc,
    image: p.imageUrl || '',
    address,
    longitude: p.longitude ?? '',
    latitude: p.latitude ?? ''
  }
}

// 从首页路线复制：只读详情把内容填进表单，不落库；用户点下面保存后才会生成打卡记录
const importFromHomeRoute = async () => {
  const route = homeRouteList.value.find(item => item.id === selectedHomeRouteId.value)
  if (!route) return
  try {
    const res = await request.get('/route/detailFull', { params: { routeId: route.id } })
    const vo = res && res.data
    if (!res || res.code !== 200 || !vo || !vo.route) {
      ElMessage.error('读取路线失败，请稍后再试')
      return
    }
    const r = vo.route
    publishForm.value.routeName = r.routeName || route.routeName
    publishForm.value.city = r.city || route.city || ''
    publishForm.value.coverImage = /^(http|data:image)/.test(String(r.coverImage || '')) ? r.coverImage : ''
    publishForm.value.description = r.description || ''
    applyPointsToForm((vo.points || []).map(parseRoutePoint))
    // 路线级标签名 → 标签 id
    const names = Array.isArray(vo.tags) ? vo.tags : []
    publishForm.value.tagIds = tagOptions.value
      .filter(t => names.includes(t.tagName))
      .map(t => t.id)
    // 只是填了表单，还没保存，所以不关联任何已存在的记录
    selectedRecordId.value = null
    ElMessage.success('已复制首页路线内容，确认后点下面按钮保存')
  } catch (e) {
    console.error('复制首页路线失败', e)
    ElMessage.error('复制失败，请稍后再试')
  }
}

// 把缺坐标的点位按地址补上坐标
const fillMissingCoord = async () => {
  const unpinned = []
  for (const p of publishForm.value.points) {
    if (hasCoord(p)) continue
    if (!p.address) {
      unpinned.push(p.name || '某个打卡点')
      continue
    }
    try {
      const g = await geocodeText(p.address)
      p.longitude = g.lng
      p.latitude = g.lat
      p.address = g.address
    } catch (e) {
      unpinned.push(p.name || p.address)
    }
  }
  if (unpinned.length) {
    ElMessage.warning(`「${unpinned.join('、')}」还定位不到，请补一下地址或地图选点（仅记录模式可以先不定位）`)
  }
}

// 添加打卡点
const addPoint = () => {
  publishForm.value.points.push({ name: '', time: '12:00', transport: '', tip: '', description: '', image: '', address: '', longitude: '', latitude: '' })
}

// 删除打卡点
const removePoint = (index) => {
  publishForm.value.points.splice(index, 1)
}

// 组装打卡记录（points_json）需要的数据
const buildCheckinPayload = (points) => ({
  routeName: publishForm.value.routeName,
  city: publishForm.value.city,
  coverImage: publishForm.value.coverImage,
  description: publishForm.value.description,
  points: points.map(p => ({
    name: p.name,
    location: p.address,
    time: p.time,
    transport: p.transport,
    tip: p.tip,
    description: p.description,
    image: p.image,
    longitude: p.longitude,
    latitude: p.latitude
  }))
})

const submitPublish = async () => {
  // 发布必须登录，后端要按 token 记录发布者
  if (!userStore.token) {
    saveDraft()
    savedOk.value = true
    ElMessage.warning('请先登录后再发布路线')
    router.push('/login')
    return
  }
  if (!userStore.token.startsWith('eyJ')) {
    // 之前登录过管理后台的话，localStorage 里的 token 是假的 admin-token，需要重新登录
    saveDraft()
    savedOk.value = true
    ElMessage.warning('登录状态已失效，请重新登录普通用户账号')
    router.push('/login')
    return
  }
  if (!publishForm.value.routeName || !publishForm.value.city) {
    ElMessage.warning('请至少填写路线名称和城市！')
    return
  }
  const points = publishForm.value.points.filter(p => (p.name || '').trim())
  if (!points.length) {
    ElMessage.warning('请至少填写一个打卡点的地点名称')
    return
  }

  // 只有公开到首页才必须定位：首页详情要在地图上标出来
  if (publishForm.value.isPublic) {
    const missing = points.findIndex(p => !hasCoord(p))
    if (missing >= 0) {
      ElMessage.warning(`第 ${missing + 1} 个打卡点还没定位，请填写地址后点「按地址定位」，或点「在地图上选点」`)
      return
    }
  }

  submitting.value = true
  try {
    // 1. 先存进「我的打卡记录」：已有记录就更新，没有就新建
    const checkinPayload = buildCheckinPayload(points)
    let recordId = selectedRecordId.value
    if (recordId) {
      const upd = await request.put(`/checkin/route/${recordId}`, checkinPayload)
      if (!upd || upd.code !== 200) {
        ElMessage.error('打卡记录保存失败，请稍后再试')
        return
      }
    } else {
      const created = await request.post('/checkin/route/custom', checkinPayload)
      if (!created || created.code !== 200 || !created.data) {
        ElMessage.error('打卡记录保存失败，请稍后再试')
        return
      }
      recordId = created.data.id
      selectedRecordId.value = recordId
    }

    // 2. 只记录：到此结束，不上首页
    if (!publishForm.value.isPublic) {
      savedOk.value = true
      clearDraft()
      ElMessage.success('已保存到「打卡记录」，标记为未公开记录，其他人看不到')
      setTimeout(() => router.push('/record'), 900)
      return
    }

    // 3. 公开：提交到首页（管理员审核），再把这层记录标成「公开记录」
    const postData = {
      routeName: publishForm.value.routeName,
      city: publishForm.value.city,
      coverImage: publishForm.value.coverImage || 'https://images.unsplash.com/photo-1543781737-0d7c1e62c3df?auto=format&fit=crop&w=600&q=80',
      description: publishForm.value.description || '这个作者很懒，什么都没写~',
      tagIds: publishForm.value.tagIds || [],
      points: points.map(p => ({
        name: p.name,
        time: p.time,
        transport: p.transport,
        tip: p.tip,
        description: p.description,
        image: p.image,
        address: p.address,
        longitude: p.longitude,
        latitude: p.latitude
      }))
    }
    const res = await request.post('/route/add', postData)
    const data = res && res.data
    if (res && res.code === 200 && data && data.id) {
      try {
        await request.put(`/checkin/route/${recordId}/public`)
      } catch (e) {
        console.warn('标记打卡记录已公开失败', e)
      }
      selectedRecordId.value = null
      savedOk.value = true
      clearDraft()
      let tip = '🎉 路线已提交，管理员审核通过后就会出现在首页；打卡记录里标记为「公开记录」'
      if (data.skippedPoints > 0) {
        tip += `（有 ${data.skippedPoints} 个点位缺少位置，已跳过）`
      }
      ElMessage.success(tip)
      setTimeout(() => router.push('/my-publish'), 1200)
    } else {
      ElMessage.error('发布失败，请检查内容')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('保存失败，请稍后再试')
  } finally {
    submitting.value = false
  }
}
// ==================== 未保存草稿：离开时询问是否保留 ====================
const DRAFT_KEY = 'citywalk_publish_draft'
// 已经点过保存/提交，离开时就不用再问
const savedOk = ref(false)

// 表单里是否已经填了内容（空表单离开就不用打扰用户）
const hasContent = computed(() => {
  const f = publishForm.value
  if ((f.routeName || '').trim() || (f.city || '').trim() || (f.description || '').trim()) return true
  if ((f.tagIds || []).length) return true
  return (f.points || []).some(p =>
    (p.name || '').trim() || (p.address || '').trim() || (p.tip || '').trim() ||
    (p.description || '').trim() || (p.image || '').trim()
  )
})

const saveDraft = () => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      form: publishForm.value,
      selectedHomeRouteId: selectedHomeRouteId.value
    }))
  } catch (e) {
    console.warn('草稿保存失败', e)
  }
}

const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch (e) {
    // ignore
  }
}

const restoreDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return
    const draft = JSON.parse(raw)
    if (draft && draft.form && Array.isArray(draft.form.points) && draft.form.points.length) {
      publishForm.value = { ...publishForm.value, ...draft.form }
      selectedHomeRouteId.value = draft.selectedHomeRouteId ?? null
      ElMessage.info('已恢复上次没保存的内容，确认后点下面按钮保存')
    } else {
      localStorage.removeItem(DRAFT_KEY)
    }
  } catch (e) {
    console.warn('草稿读取失败', e)
    localStorage.removeItem(DRAFT_KEY)
  }
}

// 点「返回」离开页面：有没保存的内容就问一下「保留 / 不保留」
const handleBack = async () => {
  if (savedOk.value || !hasContent.value) {
    clearDraft()
    router.back()
    return
  }
  try {
    await ElMessageBox.confirm(
      '这次填写的内容还没保存。选择「保留」下次进入会恢复；选择「不保留」会直接清空。',
      '离开页面',
      {
        confirmButtonText: '保留',
        cancelButtonText: '不保留',
        distinguishCancelAndClose: true,
        type: 'warning'
      }
    )
    saveDraft()
    router.back()
  } catch (action) {
    // 'cancel' = 点了「不保留」；其它（点右上角关闭 / Esc）= 留在当前页面
    if (action === 'cancel') {
      clearDraft()
      router.back()
    }
  }
}
</script>

<style scoped>
/* 这里直接复用你 Record.vue 里的样式，保证风格统一 */
.publish-container {
  padding: 20px 15px;
  background: linear-gradient(180deg, #FFF6F0 0%, #F5F7FA 100%);
  min-height: 100vh;
  padding-bottom: 80px;
}
.detail-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px dashed #FFE4D6; }
.back-btn { display: flex; align-items: center; gap: 4px; font-size: 15px; color: #FF7A45; font-weight: bold; cursor: pointer; background: #FFF0F3; padding: 6px 12px; border-radius: 20px; }
.detail-title { margin: 0; font-size: 18px; color: #303133; font-weight: 800; }
.header-placeholder { width: 70px; }

.create-form { padding-bottom: 80px; }
.form-card { background: #fff; border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.section-title { font-size: 16px; font-weight: bold; color: #303133; margin: 0 0 15px 0; padding-left: 8px; border-left: 4px solid #FF7A45; }

.import-card { background: #FFF9F0; border: 1px dashed #FFD15C; }
.import-card .section-title { border-left-color: #E6A23C; }
.import-row .import-label { font-size: 13px; color: #606266; margin-bottom: 6px; }
.import-controls { display: flex; gap: 10px; }

/* 发布方式选择 */
.scope-options { display: flex; flex-direction: column; gap: 10px; }
.scope-item { border: 1px solid #EBEEF5; border-radius: 12px; padding: 12px 14px; cursor: pointer; transition: all .2s; }
.scope-item.active { border-color: #FF9A44; background: #FFF9F0; box-shadow: 0 2px 8px rgba(255,154,68,.12); }
.scope-head { display: flex; align-items: center; gap: 8px; }
.scope-radio { width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid #C0C4CC; box-sizing: border-box; position: relative; flex-shrink: 0; }
.scope-radio.on { border-color: #FF7A45; }
.scope-radio.on::after { content: ''; position: absolute; inset: 3px; border-radius: 50%; background: #FF7A45; }
.scope-title { font-size: 14px; font-weight: bold; color: #303133; }
.scope-desc { margin: 6px 0 0 24px; font-size: 12px; color: #909399; line-height: 1.6; }

.point-edit-item { background: #F9F9F9; border: 1px dashed #DCDFE6; border-radius: 12px; padding: 15px; margin-bottom: 15px; }
.point-edit-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; color: #FF7A45; margin-bottom: 10px; }

.add-point-btn { width: 100%; height: 44px; border-radius: 10px; border: 1px dashed #FF9A44; color: #FF7A45; background: #FFF9F0; font-weight: bold; }
.add-point-btn:hover { background: #FFF0F3; }

.submit-bar { position: fixed; bottom: 0; left: 0; width: 100%; background: #fff; padding: 10px 15px; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); z-index: 100; box-sizing: border-box; }
.submit-btn { width: 100%; border-radius: 20px; background: linear-gradient(to right, #FF9A44, #FC6076); border: none; font-size: 16px; font-weight: bold; padding: 12px 0; }

/* 地点位置：地址输入 + 地图选点 */
.loc-field { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.loc-actions { display: flex; gap: 8px; }
.loc-actions .el-button { margin-left: 0; }
.map-pick-btn { flex-shrink: 0; border-radius: 8px; border-color: #FF9A44; color: #FF7A45; background: #FFF9F0; }
.loc-status { font-size: 12px; color: #909399; line-height: 1.5; }
.loc-status.loc-ok { color: #67C23A; }

.map-pick-toolbar { display: flex; gap: 8px; margin-bottom: 10px; }
.map-pick-canvas { width: 100%; height: 46vh; border-radius: 10px; overflow: hidden; background: #f2f3f5; }
.map-pick-tip { margin-top: 10px; font-size: 13px; color: #606266; }
</style>
