<template>
  <div class="map-page">
    <!-- 地图容器 -->
    <div id="amap-container" class="amap-container"></div>
    <!-- 移动端筛选面板 -->
    <div class="map-filter-panel">
      <!-- 地区选择按钮，点击唤起底部级联弹窗 -->
      <div class="area-btn" @click="openAreaDrawer">
        {{ selectedAreaLabel || '选择地区' }}
        <el-icon><ArrowDown /></el-icon>
      </div>
      <el-select
        v-model="selectedTag"
        placeholder="标签"
        @change="fetchNearRoute"
        clearable
        size="default"
      >
        <el-option v-for="tag in tagList" :key="tag.id" :label="tag.tagName" :value="tag.tagName" />
      </el-select>
      <el-select
        v-model="radius"
        size="default"
        :disabled="!!selectedCityId"
        @change="fetchNearRoute"
      >
        <el-option label="1km" :value="1000"></el-option>
        <el-option label="3km" :value="3000"></el-option>
        <el-option label="5km" :value="5000"></el-option>
      </el-select>
    </div>
    <!-- 底部弹出：省市区三级级联（美团风格） -->
    <el-drawer
      v-model="areaDrawerVisible"
      direction="btt"
      size="85%"
      :close-on-click-modal="true"
      destroy-on-close
    >
      <template #header>
        <div class="drawer-header">
          <span @click="cancelArea">取消</span>
          <span class="title">选择地区</span>
          <span @click="confirmArea">确定</span>
        </div>
      </template>
      <!-- 单列逐级下钻，按拼音排序，避免三列并排超出屏宽 -->
      <div class="area-picker">
        <div class="area-breadcrumb">
          <span :class="{ current: areaLevel === 0 }" @click="backToLevel(0)">省份</span>
          <template v-if="tempProvince">
            <span class="sep">›</span>
            <span :class="{ current: areaLevel === 1 }" @click="backToLevel(1)">{{ tempProvince.label }}</span>
          </template>
          <template v-if="tempCity">
            <span class="sep">›</span>
            <span :class="{ current: areaLevel === 2 }" @click="backToLevel(2)">{{ tempCity.label }}</span>
          </template>
        </div>

        <div class="area-body">
          <div class="area-list" ref="areaListRef">
            <div
              v-for="group in groupedLevelList"
              :key="group.letter"
              class="area-group"
              :ref="el => { if (el) letterRefMap[group.letter] = el }"
            >
              <div class="area-group-letter">{{ group.letter }}</div>
              <div
                v-for="item in group.list"
                :key="item.id"
                class="area-row"
                :class="{ active: isLevelActive(item) }"
                @click="pickAreaItem(item)"
              >
                <span class="area-row-name">{{ item.label }}</span>
                <el-icon v-if="hasChildren(item)" class="area-row-arrow"><ArrowRight /></el-icon>
                <el-icon v-else-if="isLevelActive(item)" class="area-row-check"><Check /></el-icon>
              </div>
            </div>
            <div v-if="currentLevelList.length === 0" class="area-empty">
              {{ areaLevel === 0 ? '暂无省份数据' : '该地区暂无下级区县，可直接点“确定”' }}
            </div>
          </div>
        
          <!-- 右侧字母索引栏，微信通讯录那种：可点、可按住拖动 -->
          <div
            class="area-index"
            @touchstart.stop.prevent="onIndexTouch"
            @touchmove.stop.prevent="onIndexTouch"
            @touchend.stop="onIndexTouchEnd"
            @touchcancel.stop="onIndexTouchEnd"
          >
            <span
              v-for="letter in levelLetters"
              :key="letter"
              @click.stop="scrollToLetter(letter)"
            >{{ letter }}</span>
          </div>
        </div>

      </div>
    </el-drawer>
    <!-- 路线推荐浮层 -->
    <div class="route-list-panel" v-if="nearRouteList.length > 0">
      <div class="panel-title">
        {{ panelTitle }}
        <span class="panel-count">{{ nearRouteList.length }} 条</span>
      </div>
      <div class="panel-hint" v-if="panelHint">{{ panelHint }}</div>
      <div class="panel-hint" v-if="listTruncated">
        共 {{ nearRouteList.length }} 条，仅展示前 {{ visibleRoutes.length }} 条；选择地区可精确查看
      </div>
      <div
        class="route-item"
        :class="{ active: selectedRouteId === item.id }"
        v-for="item in visibleRoutes"
        :key="item.id"
        @click="selectRoute(item)"
      >
        <div class="route-head">
          <div class="route-name">{{ item.routeName }}</div>
          <span class="route-link" @click.stop="goRouteDetail(item.id)">详情 ›</span>
        </div>
        <div class="route-meta">
          {{ item.city }} · {{ item.duration }} · {{ item.distance }}
        </div>
      </div>
      <div class="panel-foot" v-if="selectedRouteId">
        已在地图展开该路线，点击地图上的数字地标可进入详情
      </div>
    </div>
    <div class="route-list-panel empty-panel" v-else>
      <div class="empty-tip">{{ emptyTip }}</div>
    </div>
    <!-- 定位、刷新按钮 -->
    <div class="location-btn" :class="{ locating }" @click="getCurrentLocation">
      <el-icon><Location /></el-icon>
    </div>
    <div class="refresh-btn" @click="refreshNearRoute">
      <el-icon><Refresh /></el-icon>
    </div>
    <!-- ========== 底部Tab ========== -->
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
import { pinyin } from 'pinyin-pro'
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Location, Refresh, ArrowDown, ArrowRight, Check } from '@element-plus/icons-vue'
import { load } from '@amap/amap-jsapi-loader'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()
let map = null
let geocoder = null
let AMap = null
let routeOverlays = []
let myLocationMarker = null
// 路线点位缓存：routeId -> points[]，避免反复请求 /map/routePath
const routePointsCache = {}

// 弹窗控制
const areaDrawerVisible = ref(false)
// 弹窗内的逐级下钻状态：0=省 1=市 2=区县
const areaLevel = ref(0)
const tempProvince = ref(null)
const tempCity = ref(null)
const tempDistrict = ref(null)
// 最终选中，格式：[provinceId] 或 [provinceId, cityId] 或 [provinceId, cityId, districtId]
const selectedArea = ref(null)
const areaOptions = ref([])
const selectedTag = ref(null)
const tagList = ref([])
const nearRouteList = ref([])
const radius = ref(3000)
const currentLng = ref(null)
const currentLat = ref(null)
// 当前在地图上展开的路线
const selectedRouteId = ref(null)
// 是否已经拿到真实定位
const located = ref(false)
const locating = ref(false)
// 区县没有专属路线时，是否回退成城市全部路线
const districtFallback = ref(false)

// 拼音排序：zh-Hans-CN 的排序规则即按拼音，多音字按常用读音
const sortByPinyin = (list = []) =>
  [...list].sort((a, b) => String(a.label || '').localeCompare(String(b.label || ''), 'zh-Hans-CN'))

const hasChildren = (item) => !!(item && item.children && item.children.length)

// 当前层级要展示的列表
const currentLevelList = computed(() => {
  if (areaLevel.value === 0) return sortByPinyin(areaOptions.value)
  if (areaLevel.value === 1) return sortByPinyin(tempProvince.value?.children || [])
  if (areaLevel.value === 2) return sortByPinyin(tempCity.value?.children || [])
  return []
})

const getInitial = (name = '') => {
  const first = pinyin(name.trim().slice(0, 2), { pattern: 'first', toneType: 'none', type: 'array' })[0] || ''
  const letter = first.charAt(0).toUpperCase()
  return /[A-Z]/.test(letter) ? letter : '#'
}

// 把当前层级的列表按首字母分组：{ A:[...], B:[...] }
const groupedLevelList = computed(() => {
  const groups = {}
  currentLevelList.value.forEach(item => {
    const letter = getInitial(item.label)
    if (!groups[letter]) groups[letter] = []
    groups[letter].push(item)
  })
  return Object.keys(groups).sort().map(letter => ({ letter, list: groups[letter] }))
})

// 右侧索引栏只显示有内容的字母
const levelLetters = computed(() => groupedLevelList.value.map(g => g.letter))

// 点字母 → 滚到对应分组（用 rect 差值算，不受嵌套定位影响）
// 这里用普通对象存 DOM，不要用 ref：模板里 ref 会被自动解包，写 .value 反而会报 undefined
const letterRefMap = {}
const areaListRef = ref(null)
const scrollToLetter = (letter) => {
  const el = letterRefMap[letter]
  const list = areaListRef.value
  if (!el || !list) return
  const offset = el.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop
  list.scrollTop = Math.max(0, offset)
}

// 右侧索引栏按住拖动时连续定位（微信通讯录那种手感）
let lastLetterIdx = -1
const locateByPointerY = (clientY, rect) => {
  const total = levelLetters.value.length
  if (!total) return
  const step = rect.height / total
  const idx = Math.min(total - 1, Math.max(0, Math.floor((clientY - rect.top) / step)))
  if (idx !== lastLetterIdx) {
    lastLetterIdx = idx
    scrollToLetter(levelLetters.value[idx])
  }
}
const onIndexTouch = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  locateByPointerY(e.touches[0].clientY, rect)
}
const onIndexTouchEnd = () => {
  lastLetterIdx = -1
}

// 切换层级 / 打开抽屉时，列表回到顶部，索引手势状态重置
watch([areaLevel, areaDrawerVisible], () => {
  lastLetterIdx = -1
  nextTick(() => {
    if (areaListRef.value) areaListRef.value.scrollTop = 0
  })
})
// 当前层级里被选中的那一项
const isLevelActive = (item) => {
  if (areaLevel.value === 0) return tempProvince.value?.id === item.id
  if (areaLevel.value === 1) return tempCity.value?.id === item.id
  if (areaLevel.value === 2) return tempDistrict.value?.id === item.id
  return false
}

// 弹窗里的临时选择，回填 / 确认都用它
const tempSelectedArea = computed(() => {
  const ids = []
  if (tempProvince.value) ids.push(tempProvince.value.id)
  if (tempCity.value) ids.push(tempCity.value.id)
  if (tempDistrict.value) ids.push(tempDistrict.value.id)
  return ids.length ? ids : null
})

// 清空弹窗内的临时下钻状态
const resetTempArea = () => {
  tempProvince.value = null
  tempCity.value = null
  tempDistrict.value = null
  areaLevel.value = 0
}

// 点某一项：省 → 进市；市 → 进区县（没有区县就停在市）；区县 → 选中
const pickAreaItem = (item) => {
  if (areaLevel.value === 0) {
    tempProvince.value = item
    tempCity.value = null
    tempDistrict.value = null
    areaLevel.value = hasChildren(item) ? 1 : 0
    return
  }
  if (areaLevel.value === 1) {
    tempCity.value = item
    tempDistrict.value = null
    if (hasChildren(item)) {
      areaLevel.value = 2
    }
    return
  }
  if (areaLevel.value === 2) {
    tempDistrict.value = item
  }
}

// 面包屑回退
const backToLevel = (level) => {
  if (level === 0) {
    tempProvince.value = null
    tempCity.value = null
    tempDistrict.value = null
    areaLevel.value = 0
    return
  }
  if (level === 1 && tempProvince.value) {
    tempCity.value = null
    tempDistrict.value = null
    areaLevel.value = 1
    return
  }
  if (level === 2 && tempCity.value) {
    tempDistrict.value = null
    areaLevel.value = 2
  }
}

// 回显：拼接省 / 市 / 区县名称
const selectedAreaLabel = computed(() => {
  if (!selectedArea.value?.length || !areaOptions.value.length) return ''
  const ids = selectedArea.value
  const nameArr = []
  const findName = (list, targetIds, depth = 0) => {
    for (const item of list) {
      if (item.id === targetIds[depth]) {
        nameArr.push(item.label)
        if (targetIds[depth + 1] && item.children) {
          findName(item.children, targetIds, depth + 1)
        }
        break
      }
    }
  }
  findName(areaOptions.value, ids)
  return nameArr.join(' / ')
})

// 选中的城市 id / 区县 id，来自级联的层级位置，而不是“数组最后一项”
const selectedCityId = computed(() => {
  const ids = selectedArea.value
  return ids && ids.length >= 2 ? Number(ids[1]) : null
})
const selectedDistrictId = computed(() => {
  const ids = selectedArea.value
  return ids && ids.length >= 3 ? Number(ids[2]) : null
})
const areaNameParts = computed(() => selectedAreaLabel.value.split(' / '))
const selectedCityLabel = computed(() => {
  const parts = areaNameParts.value
  return parts.length >= 2 ? parts[1] : (parts[0] || '')
})
const selectedDistrictLabel = computed(() => {
  const parts = areaNameParts.value
  return parts.length >= 3 ? parts[2] : ''
})

const isCityMode = computed(() => !!selectedCityId.value)

// 库里现在 244 条路线，无定位无选区时一次性拉全量点位太重，列表和绘图都做限流
const LIST_LIMIT = 20
const DRAW_LIMIT = 12
const visibleRoutes = computed(() => nearRouteList.value.slice(0, LIST_LIMIT))
const listTruncated = computed(() => nearRouteList.value.length > LIST_LIMIT)

const panelTitle = computed(() => {
  if (selectedDistrictId.value) return `${selectedDistrictLabel.value || '该区县'} · 路线推荐`
  if (selectedCityId.value) return `${selectedCityLabel.value || '该城市'} · 路线推荐`
  if (located.value) return `我附近 ${radius.value / 1000}km 路线`
  return '全部路线'
})

const panelHint = computed(() => {
  if (districtFallback.value) {
    return `${selectedDistrictLabel.value}暂无专属路线，已展示${selectedCityLabel.value}全部路线`
  }
  if (isCityMode.value) {
    return '点任意路线可在地图上展开轨迹与地标'
  }
  if (located.value) {
    return '已定位到你的位置，也可点“选择地区”切换城市'
  }
  return '未获取到定位，当前展示全部路线，可点右下角定位或选择地区'
})

const emptyTip = computed(() => {
  if (selectedDistrictId.value) return `${selectedDistrictLabel.value}暂无路线数据`
  if (selectedCityId.value) return `${selectedCityLabel.value}暂无路线数据，换个城市或叠加标签试试`
  if (located.value) return `附近 ${radius.value / 1000}km 内暂无路线，试试放大半径`
  return '暂无路线数据'
})

// 打开地区弹窗时，用当前已选地区回填下钻层级
const openAreaDrawer = () => {
  tempProvince.value = null
  tempCity.value = null
  tempDistrict.value = null
  areaLevel.value = 0

  const ids = selectedArea.value
  if (ids && ids.length) {
    const province = areaOptions.value.find(item => item.id === ids[0])
    if (province) {
      tempProvince.value = province
      areaLevel.value = hasChildren(province) ? 1 : 0
      const city = ids[1] ? (province.children || []).find(item => item.id === ids[1]) : null
      if (city) {
        tempCity.value = city
        const district = ids[2] ? (city.children || []).find(item => item.id === ids[2]) : null
        if (district) {
          tempDistrict.value = district
          areaLevel.value = 2
        } else if (hasChildren(city)) {
          areaLevel.value = 2
        }
      }
    }
  }
  areaDrawerVisible.value = true
}

// 取消地区选择：丢弃弹窗里的临时选择
const cancelArea = () => {
  areaDrawerVisible.value = false
}

// 确认地区选择：选地区就走城市/区县维度，不再用定位半径
const confirmArea = () => {
  if (!tempSelectedArea.value) {
    ElMessage.warning('请先选择一个地区')
    return
  }
  selectedArea.value = [...tempSelectedArea.value]
  areaDrawerVisible.value = false
  currentLng.value = null
  currentLat.value = null
  fetchNearRoute()
}

// 跳转路线详情
const goRouteDetail = (routeId) => {
  router.push(`/detail/${routeId}`)
}

// 加载省市区树形数据 /area/tree
const loadAreaTree = async () => {
  try {
    const res = await request.get('/area/tree')
    if (res && res.code === 200) {
      const handlerTree = (list) => {
        if (!list || list.length === 0) return
        list.forEach(item => {
          if (item.provinceName) item.label = item.provinceName
          else if (item.cityName) item.label = item.cityName
          else if (item.districtName) item.label = item.districtName
          else item.label = '未知地区'
          if (item.children && item.children.length > 0) {
            handlerTree(item.children)
          }
        })
      }
      handlerTree(res.data)
      areaOptions.value = res.data
    }
  } catch (err) {
    console.error('地区树形加载异常', err)
    ElMessage.error('地区数据加载失败')
  }
}

// 加载标签
const loadTagList = async () => {
  try {
    const res = await request.get('/tag/list')
    if (res && res.code === 200) {
      tagList.value = res.data
    }
  } catch (err) {
    console.error('标签加载异常', err)
  }
}

/**
 * 获取路线推荐
 * - 选了城市/区县：只传 cityId，区县筛选在前端做（没有专属路线时可回退城市全部路线）
 * - 没选地区：按定位 + 半径，没定位就不带经纬度（返回全部路线）
 */
const fetchNearRoute = async () => {
  const params = {}
  if (selectedCityId.value) {
    params.cityId = selectedCityId.value
  } else {
    params.radius = radius.value
    if (currentLng.value != null && currentLat.value != null) {
      params.lng = currentLng.value
      params.lat = currentLat.value
    }
  }
  if (selectedTag.value) {
    params.tag = selectedTag.value
  }

  let list = []
  try {
    const res = await request.get('/map/nearRoute', { params })
    if (res.code === 200) {
      list = res.data || []
    }
  } catch (err) {
    console.error('附近路线接口异常', err)
    list = []
  }

  // 区县优先：该区县有专属路线就只显示它；没有就回退为该城市的全部路线
  if (selectedDistrictId.value) {
    const matched = list.filter(r => Number(r.districtId) === selectedDistrictId.value)
    if (matched.length) {
      nearRouteList.value = matched
      districtFallback.value = false
    } else {
      nearRouteList.value = list
      districtFallback.value = list.length > 0
    }
  } else {
    nearRouteList.value = list
    districtFallback.value = false
  }

  // 选中态校正：列表只剩一条时自动展开
  if (!nearRouteList.value.some(r => r.id === selectedRouteId.value)) {
    selectedRouteId.value = null
  }
  if (nearRouteList.value.length === 1) {
    selectedRouteId.value = nearRouteList.value[0].id
  }

  await renderRoutesOnMap()
}

// 清空地图上所有路线覆盖物（“我的位置”标记单独管理，不受影响）
const clearMapOverlays = () => {
  routeOverlays.forEach(o => {
    try {
      if (o.remove) o.remove()
      else if (o.setMap) o.setMap(null)
    } catch (e) {
      /* ignore */
    }
  })
  routeOverlays = []
}

// 定位失败/城市无数据时，把地图挪到城市中心
const focusCityOnMap = () => {
  if (!map || !AMap) return
  const name = selectedCityLabel.value
  if (!name) return
  try {
    if (!geocoder) geocoder = new AMap.Geocoder({ city: '全国' })
    geocoder.getLocation(name, (status, result) => {
      if (status === 'complete' && result.geocodes && result.geocodes.length) {
        const lnglat = result.geocodes[0].location
        map.setZoomAndCenter(11, [lnglat.lng, lnglat.lat])
      }
    })
  } catch (e) {
    console.warn('城市定位失败', e)
  }
}

// 批量拿路线点位（带缓存）
const loadPointsForRoutes = async (routes) => {
  const missing = routes.filter(r => !routePointsCache[r.id])
  if (!missing.length) return
  await Promise.all(missing.map(async r => {
    try {
      const res = await request.get('/map/routePath', { params: { routeId: r.id } })
      routePointsCache[r.id] = (res && res.code === 200 && Array.isArray(res.data)) ? res.data : []
    } catch (e) {
      routePointsCache[r.id] = []
    }
  }))
}

const toPath = (points) => points
  .filter(p => p.longitude != null && p.latitude != null)
  .map(p => [Number(p.longitude), Number(p.latitude)])

// 画路线：未选中的路线只画淡色轨迹，选中的路线高亮 + 编号地标 + 名称气泡
const renderRoutesOnMap = async ({ fit = true } = {}) => {
  if (!map || !AMap) return
  clearMapOverlays()

  const list = nearRouteList.value
  if (!list.length) {
    focusCityOnMap()
    return
  }
  const selId = selectedRouteId.value
  // 路线太多时只画当前选中那条，避免一次请求上百个 routePath
  const drawList = list.length <= DRAW_LIMIT ? list : list.filter(r => r.id === selId)
  await loadPointsForRoutes(drawList)

  const selectedOverlays = []

  drawList.forEach(r => {
    const points = routePointsCache[r.id] || []
    const path = toPath(points)
    const isSel = r.id === selId

    if (path.length >= 2) {
      const line = new AMap.Polyline({
        path,
        strokeColor: isSel ? '#1677ff' : '#aebccd',
        strokeWeight: isSel ? 6 : 3,
        strokeOpacity: isSel ? 0.95 : 0.55,
        lineJoin: 'round',
        map,
        zIndex: isSel ? 70 : 55,
        cursor: 'pointer'
      })
      line.on('click', () => selectRoute(r))
      routeOverlays.push(line)
      if (isSel) selectedOverlays.push(line)
    } else if (r.startLongitude != null && r.startLatitude != null) {
      const dot = new AMap.Marker({
        position: [Number(r.startLongitude), Number(r.startLatitude)],
        map,
        zIndex: isSel ? 90 : 60,
        offset: new AMap.Pixel(-6, -6),
        content: `<div style="width:12px;height:12px;border-radius:50%;background:${isSel ? '#1677ff' : '#aebccd'};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.25)"></div>`
      })
      dot.on('click', () => selectRoute(r))
      routeOverlays.push(dot)
      if (isSel) selectedOverlays.push(dot)
    }
  })

  // 选中路线的编号地标：点击地标进详情页
  const sel = list.find(r => r.id === selId)
  if (sel) {
    const points = routePointsCache[sel.id] || []
    points.forEach((p, idx) => {
      if (p.longitude == null || p.latitude == null) return
      const marker = new AMap.Marker({
        position: [Number(p.longitude), Number(p.latitude)],
        map,
        zIndex: 95,
        offset: new AMap.Pixel(-13, -13),
        title: p.pointName,
        cursor: 'pointer',
        content: `<div style="width:26px;height:26px;line-height:22px;text-align:center;border-radius:50%;background:#1677ff;color:#fff;font-size:12px;border:2px solid #fff;box-shadow:0 2px 8px rgba(22,119,255,.45)">${idx + 1}</div>`
      })
      marker.on('click', () => goRouteDetail(sel.id))
      routeOverlays.push(marker)
      selectedOverlays.push(marker)
    })

    const path = toPath(points)
    const anchor = path[0] || (sel.startLongitude != null ? [Number(sel.startLongitude), Number(sel.startLatitude)] : null)
    if (anchor) {
      const bubble = new AMap.Text({
        text: sel.routeName,
        position: anchor,
        map,
        zIndex: 120,
        offset: new AMap.Pixel(0, -36),
        style: {
          'padding': '3px 10px',
          'background-color': '#ffffff',
          'border': '1px solid #bcd9ff',
          'border-radius': '12px',
          'font-size': '12px',
          'color': '#1677ff',
          'font-weight': 'bold',
          'box-shadow': '0 2px 6px rgba(0,0,0,0.18)'
        }
      })
      bubble.on('click', () => goRouteDetail(sel.id))
      routeOverlays.push(bubble)
      selectedOverlays.push(bubble)
    }
  }

  if (!fit) return
  if (selectedOverlays.length) {
    map.setFitView(selectedOverlays, false, [80, 40, 300, 40])
  } else if (routeOverlays.length) {
    map.setFitView(routeOverlays, false, [80, 40, 300, 40])
  }
}

// 点击列表里的路线：展开该路线（不再直接跳详情）
const selectRoute = (item) => {
  selectedRouteId.value = item.id
  renderRoutesOnMap({ fit: true })
}

// 标签切换
const onTagChange = () => {
  fetchNearRoute()
}

// 手动刷新
const refreshNearRoute = () => {
  fetchNearRoute()
}

// 画“我的位置”蓝点：地图还没完全就绪时高德内部会抛异常，这里单独兜住，不影响定位结果
const drawMyLocation = (pos) => {
  if (!map || !AMap || !pos) return false
  try {
    if (myLocationMarker) {
      myLocationMarker.setPosition(pos)
      return true
    }
    myLocationMarker = new AMap.Marker({
      position: pos,
      map,
      zIndex: 200,
      offset: new AMap.Pixel(-10, -10),
      title: '我的位置',
      content: '<div style="width:14px;height:14px;border-radius:50%;background:#1677ff;border:3px solid #fff;box-shadow:0 0 0 4px rgba(22,119,255,.22)"></div>'
    })
    return true
  } catch (err) {
    console.warn('定位点绘制失败（不影响定位结果）', err)
    return false
  }
}

/**
 * 定位
 * auto = true 表示进页面自动定位，失败时不弹提示，静默退回“全部路线”
 * 高德 Geolocation 会先试浏览器精确定位，失败再走 IP 城市定位
 */
const locateUser = async (auto = false) => {
  if (!map || !AMap) return false
  locating.value = true
  try {
    const geolocation = new AMap.Geolocation({
      enableHighAccuracy: true,
      timeout: 8000,
      GeoLocationFirst: true,
      showButton: false,
      showMarker: false,
      showCircle: false,
      panToLocation: false,
      zoomToAccuracy: false
    })
    const { status, result } = await new Promise(resolve => {
      geolocation.getCurrentPosition((s, r) => resolve({ status: s, result: r }))
    })
    if (status !== 'complete' || !result || !result.position) {
      if (!auto) ElMessage.warning('定位失败，请手动选择地区')
      return false
    }
    const pos = [result.position.getLng(), result.position.getLat()]
    currentLng.value = pos[0]
    currentLat.value = pos[1]
    located.value = true
    // 定位后清掉地区选择，切到“附近”模式
    selectedArea.value = null
    resetTempArea()
    selectedRouteId.value = null
    drawMyLocation(pos)
    try {
      map.setZoomAndCenter(14, pos)
    } catch (err) {
      console.warn('地图视野调整失败（不影响定位结果）', err)
    }
    await fetchNearRoute()
    return true
  } catch (e) {
    console.error('定位失败', e)
    if (!auto) ElMessage.warning('定位失败，请手动选择地区')
    return false
  } finally {
    locating.value = false
  }
}

// 点击定位按钮：清空地区选择，重新定位
const getCurrentLocation = () => {
  if (route.query.targetLng && route.query.targetLat) {
    currentLng.value = Number(route.query.targetLng)
    currentLat.value = Number(route.query.targetLat)
    located.value = true
    selectedArea.value = null
    resetTempArea()
    drawMyLocation([currentLng.value, currentLat.value])
    map.setZoomAndCenter(14, [currentLng.value, currentLat.value])
    fetchNearRoute()
    return
  }
  locateUser(false)
}

// 初始化高德地图
const initMap = async () => {
  try {
    window._AMapSecurityConfig = {
      securityJsCode: import.meta.env.VITE_AMAP_SECRET
    }
    AMap = await load({
      key: import.meta.env.VITE_AMAP_KEY,
      version: '2.0',
      plugins: ['AMap.Geolocation', 'AMap.Geocoder']
    })
    map = new AMap.Map('amap-container', {
      zoom: 12,
      center: [113.24, 23.13]
    })
  } catch (e) {
    console.error('高德地图初始化失败：', e)
    ElMessage.error('地图加载失败，请检查高德key、安全密钥')
  }
}

onMounted(async () => {
  await nextTick()
  await initMap()
  await loadAreaTree()
  await loadTagList()
  // 进页面先自动定位；定位失败也只是退回全部路线，不打扰用户
  const ok = await locateUser(true)
  if (!ok) {
    await fetchNearRoute()
  }
})

onUnmounted(() => {
  clearMapOverlays()
  if (myLocationMarker) {
    try { myLocationMarker.setMap(null) } catch (e) { /* ignore */ }
  }
  if (map) map.destroy()
})
</script>

<style scoped>
.map-page {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}
.amap-container {
  width: 100%;
  height: 100%;
}
/*
 * 高德版权标识（.amap-logo / .amap-copyright）是高德 API 注入的，条款要求必须可见，
 * 这里不隐藏，只整体抬到底部导航栏（60px）之上，避免被压住看不清
 */
.amap-container :deep(.amap-logo) {
  bottom: 66px !important;
  z-index: 5 !important;
}
.amap-container :deep(.amap-copyright) {
  bottom: 66px !important;
  z-index: 5 !important;
}
.map-filter-panel {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  z-index: 10;
  display: flex;
  gap: 8px;
  background: #fff;
  padding: 10px;
  border-radius: 8px;
  flex-wrap: nowrap;
  align-items: center;
  box-sizing: border-box;
}
.area-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 10px;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  max-width: 46%;
  overflow: hidden;
  text-overflow: ellipsis;
}
.map-filter-panel :deep(.el-select) {
  flex: 1;
  min-width: 90px;
}
.map-filter-panel :deep(.el-input__inner) {
  height: 40px !important;
  font-size: 14px;
}
/* 抽屉头部 */
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  padding:12px 16px;
}
.drawer-header span:first-child,
.drawer-header span:last-child {
  color: #409eff;
}
.drawer-header .title {
  color: #333;
  font-weight: bold;
}
/* 单列逐级下钻地区选择器，适配 APP：不出横向滚动条 */
:deep(.el-drawer__body) {
  padding: 0;
  overflow-x: hidden;
}
.area-picker {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.area-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  font-size: 14px;
  color: #909399;
  border-bottom: 1px solid #f2f2f2;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none;
}
.area-breadcrumb::-webkit-scrollbar { display: none; }
.area-breadcrumb .current { color: #409eff; font-weight: bold; }
.area-breadcrumb .sep { color: #c0c4cc; }
.area-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}
.area-list {
  flex: 1;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 6px 0 16px;
  padding-right: 24px;   /* 给索引栏让位 */
  -webkit-overflow-scrolling: touch;
}
.area-group-letter {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 4px 16px;
  font-size: 12px;
  color: #909399;
  background: #f7f8fa;
}
.area-index {
  width: 24px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 11px;
  color: #409eff;
  background: transparent;
  user-select: none;
  touch-action: none;   /* 拖动索引时不要触发列表滚动 */
  padding: 8px 0;
}
.area-index span {
  flex: 1;                 /* 字母自动均分高度，屏幕越矮越紧 */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  cursor: pointer;
}

.area-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
  padding: 0 16px;
  font-size: 16px;
  color: #303133;
  border-bottom: 1px solid #f7f7f7;
  cursor: pointer;
}
.area-row:active { background: #f5f7fa; }
.area-row.active { color: #409eff; font-weight: 600; }
.area-row-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.area-row-arrow { color: #c0c4cc; font-size: 16px; }
.area-row-check { color: #409eff; font-size: 18px; }
.area-empty {
  padding: 40px 16px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}
.route-list-panel {
  position: absolute;
  top: 75px;
  left: 12px;
  right: 12px;
  max-height: 38vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  z-index: 10;
}
.empty-panel {
  max-height:120px;
  display:flex;
  align-items:center;
  justify-content:center;
}
.empty-tip{
  color:#999;
  font-size:13px;
}
.panel-title {
  font-weight: bold;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.panel-count {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
}
.panel-hint {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
  line-height: 1.5;
}
.panel-foot {
  font-size: 12px;
  color: #1677ff;
  padding-top: 8px;
  border-top: 1px dashed #e4e7ed;
  margin-top: 4px;
}
.route-item {
  padding: 8px 8px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  border-radius: 6px;
  transition: background .15s;
}
.route-item:last-child {
  border-bottom: none;
}
.route-item.active {
  background: #f0f7ff;
}
.route-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.route-name {
  font-size: 15px;
}
.route-item.active .route-name {
  color: #1677ff;
  font-weight: bold;
}
.route-link {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}
.route-link:hover {
  color: #1677ff;
}
.route-meta {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}
.location-btn,
.refresh-btn {
  position: absolute;
  right: 16px;
  width: 44px;
  height: 44px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px #00000022;
  z-index: 10;
  cursor: pointer;
}
.location-btn {
  bottom: 120px;
}
.refresh-btn {
  bottom: 170px;
}
.location-btn.locating {
  color: #1677ff;
  animation: locating-pulse 1.2s ease-in-out infinite;
}
@keyframes locating-pulse {
  0%, 100% { box-shadow: 0 2px 8px #00000022; }
  50% { box-shadow: 0 0 0 6px rgba(22,119,255,.18); }
}
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
