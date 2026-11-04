<!-- src/views/Map.vue 探索地图页【成员C】 -->
<template>
  <div class="map-page">
    <!-- 顶部筛选栏 -->
    <div class="map-filter">
      <el-select v-model="selectTag" placeholder="标签筛选" size="small" clearable @change="handleTagChange">
        <el-option label="全部" value="" />
        <el-option label="老街" value="老街" />
        <el-option label="美食" value="美食" />
        <el-option label="人文" value="人文" />
        <el-option label="夜景" value="夜景" />
      </el-select>
      <el-input v-model.number="mockLng" placeholder="模拟经度" size="small" v-if="openMockLoc"></el-input>
      <el-input v-model.number="mockLat" placeholder="模拟纬度" size="small" v-if="openMockLoc"></el-input>
      <el-switch v-model="openMockLoc" active-text="模拟定位"></el-switch>
    </div>
    <!-- 地图容器 -->
    <div id="container" class="map-container"></div>
    <!-- 加载遮罩 -->
    <div class="map-loading" v-if="isLoading">
      <div>地图加载中...</div>
    </div>
    <!-- 定位悬浮按钮 -->
    <div class="map-locate-btn" @click="getCurrentLocation">
      <el-icon><Location /></el-icon>
    </div>
    <!-- 附近路线浮窗 -->
    <div class="near-panel" v-if="nearRouteList.length>0">
      <div class="panel-title">附近3km路线</div>
      <div class="route-item" v-for="item in nearRouteList" :key="item.id" @click="selectRoute(item.id)">
        <div>{{item.routeName}}</div>
        <div class="tip">{{item.city}} · {{item.duration}}</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import { Location } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { load } from "@amap/amap-jsapi-loader"
import { getMapPoints, getNearRoute, getRoutePath } from "@/api/map"
import { useRouter } from "vue-router"
const router = useRouter()
let map = null
let markerUser = null // 用户当前定位标记
let polyline = null //路线轨迹线
let geolocation = null //定位实例
let allMarkers = [] // 保存所有点位marker，用于筛选显隐
const selectTag = ref("")
const openMockLoc = ref(false)
const mockLng = ref(113.2644)
const mockLat = ref(23.1291)
const nearRouteList = ref([])
const isLoading = ref(true)
// 模拟测试数据（后端还没写完的时候兜底，自动代替接口返回）
const mockPoints = [
  { id:1, pointName:"陈家祠", longitude:113.2401, latitude:23.1375, tag:"人文", desc:"岭南古建筑群", imageUrl:"https://picsum.photos/id/24/240/140", routeId:1001 },
  { id:2, pointName:"北京路", longitude:113.2704, latitude:23.1234, tag:"老街", desc:"广州老牌步行街", imageUrl:"https://picsum.photos/id/25/240/140", routeId:1001 },
  { id:3, pointName:"上下九", longitude:113.2362, latitude:23.1176, tag:"美食", desc:"广式小吃聚集地", imageUrl:"https://picsum.photos/id/26/240/140", routeId:1002 },
]
const mockNearRoute = [
  { id:1001, routeName:"老城人文漫步", city:"广州", duration:"2小时" },
  { id:1002, routeName:"西关美食路线", city:"广州", duration:"1.5小时" },
]
const mockRoutePath = [
  { longitude:113.2401, latitude:23.1375 },
  { longitude:113.2510, latitude:23.1300 },
  { longitude:113.2704, latitude:23.1234 },
]
//跳转路线详情
const goDetail = (routeId) => {
  router.push({ path: "/detail", query: { id: routeId } })
}
// 选中附近路线，绘制轨迹
const selectRoute = async (routeId) => {
  await drawRouteTrace(routeId)
}
//初始化地图
const initMap = async () => {
  try {
    // ✅ 安全密钥必须写在load之前！！
    window._AMapSecurityConfig = {
      securityJsCode: import.meta.env.VITE_AMAP_SECRET,
    }
    const AMap = await load({
      key: import.meta.env.VITE_AMAP_KEY,
      version: "2.0",
      plugins: ['AMap.ToolBar', 'AMap.Geolocation']
    })
    map = new AMap.Map("container", {
      zoom: 13,
      center: [mockLng.value, mockLat.value]
    })
    geolocation = new AMap.Geolocation({
      enableHighAccuracy: true,
      timeout: 6000
    })
    const toolbar = new AMap.ToolBar()
    map.addControl(toolbar)
    getCurrentLocation()
    await loadAllPointMark()
  } catch (err) {
    console.error("高德加载错误详情：", err)
    ElMessage.error("地图初始化失败，请检查高德Key/安全密钥")
  } finally {
    isLoading.value = false
  }
}
// 获取当前定位
const getCurrentLocation = () => {
  if (openMockLoc.value) {
    const mockPos = [mockLng.value, mockLat.value]
    setUserMarker(mockPos)
    map.setCenter(mockPos)
    fetchNearRoute(mockPos[0], mockPos[1])
    return
  }
  geolocation.getCurrentPosition((status, result) => {
    if (status === 'complete') {
      const pos = [result.position.lng, result.position.lat]
      setUserMarker(pos)
      map.setCenter(pos)
      fetchNearRoute(pos[0], pos[1])
    } else {
      ElMessage.warning("获取GPS失败，请打开【模拟定位】演示功能")
    }
  })
}
// 设置用户蓝色定位标记
const setUserMarker = (pos) => {
  if (markerUser) markerUser.remove()
  markerUser = new window.AMap.Marker({
    position: pos,
    icon: "https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-blue.png",
    map: map
  })
}
//加载全部打卡点位标记（增加mock兜底）
const loadAllPointMark = async () => {
  let pointList = []
  try {
    const res = await getMapPoints()
    pointList = res.data
  } catch (e) {
    e.__skipGlobalMsg = true
    ElMessage.info("后端点位接口未就绪，使用模拟数据演示")
    pointList = mockPoints
  }
  allMarkers.forEach(m => m.remove())
  allMarkers = []
  pointList.forEach(p => {
    const m = new window.AMap.Marker({
      position: [p.longitude, p.latitude],
      title: p.pointName,
      map: map
    })
    m.pointData = p
    allMarkers.push(m)
    m.on("click", () => {
      const imgSrc = p.imageUrl || "https://picsum.photos/id/24/240/140"
      const infoContent = `
      <div style="padding:4px;max-width:240px;">
        <img src="${imgSrc}" style="width:100%;height:120px;object-fit:cover;border-radius:4px;">
        <h4 style="margin:6px 0;">${p.pointName}</h4>
        <p style="font-size:13px;color:#555;">${p.desc || "暂无简介"}</p>
        <button id="goRouteBtn_${p.routeId}" style="margin-top:6px;padding:4px 8px;background:#0099ff;color:#fff;border:none;border-radius:4px;">查看归属路线</button>
      </div>`
      const infoWin = new window.AMap.InfoWindow({ content: infoContent })
      infoWin.open(map, m.getPosition())
      setTimeout(() => {
        document.getElementById(`goRouteBtn_${p.routeId}`)?.addEventListener("click", () => {
          goDetail(p.routeId)
          infoWin.close()
        })
      }, 100)
    })
  })
}
//标签筛选切换
const handleTagChange = () => {
  allMarkers.forEach(marker => {
    const point = marker.pointData
    if (!selectTag.value || point.tag === selectTag.value) {
      marker.show()
    } else {
      marker.hide()
    }
  })
}
// 查询附近路线（mock兜底）
const fetchNearRoute = async (lng, lat) => {
  if(lng === undefined || lat === undefined) return
  try {
    const res = await getNearRoute(lng, lat, 3000)
    nearRouteList.value = res.data
  } catch (e) {
    e.__skipGlobalMsg = true
    ElMessage.info("附近路线接口未就绪，加载模拟路线")
    nearRouteList.value = mockNearRoute
  }
}
//选中某条路线ID，绘制轨迹折线（mock兜底）
const drawRouteTrace = async (routeId) => {
  try {
    if (polyline) polyline.remove()
    const res = await getRoutePath(routeId)
    const pathArr = res.data.map(item => [item.longitude, item.latitude])
    polyline = new window.AMap.Polyline({
      path: pathArr,
      strokeColor: "#0099ff",
      strokeWeight: 5,
      map: map
    })
    map.setFitView(polyline)
    ElMessage.success("已加载路线轨迹")
  } catch (err) {
    err.__skipGlobalMsg = true
    ElMessage.info("轨迹接口未就绪，加载模拟行走轨迹")
    if (polyline) polyline.remove()
    const pathArr = mockRoutePath.map(item => [item.longitude, item.latitude])
    polyline = new window.AMap.Polyline({
      path: pathArr,
      strokeColor: "#0099ff",
      strokeWeight: 5,
      map: map
    })
    map.setFitView(polyline)
  }
}
onMounted(() => {
  initMap()
})
onUnmounted(() => {
  if (map) map.destroy()
})
</script>
<style scoped>
.map-page {
  width: 100%;
  height: 100vh;
  position: relative;
}
.map-filter {
  position: absolute;
  z-index: 99;
  top: 10px;
  left: 10px;
  right: 10px;
  background: #fff;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  box-shadow: 0 2px 10px rgba(0,0,0,0.12);
}
.map-container {
  width: 100%;
  height: 100%;
}
.map-loading {
  position: absolute;
  z-index: 100;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap:10px;
  font-size:16px;
}
.map-locate-btn {
  width: 44px;
  height: 44px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  bottom: 100px;
  right: 14px;
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 2px 8px #00000022;
}
.near-panel {
  position: absolute;
  z-index: 99;
  bottom: 140px;
  left: 10px;
  width: 220px;
  background: #fff;
  border-radius: 8px;
  padding: 10px;
  max-height: 240px;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0,0,0,0.12);
}
.panel-title {
  font-weight: bold;
  margin-bottom: 6px;
}
.route-item {
  padding: 6px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}
.route-item:hover {
  color:#0099ff;
}
.tip {
  font-size: 12px;
  color: #666;
}
</style>
