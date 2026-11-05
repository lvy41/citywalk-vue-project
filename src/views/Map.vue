<template>
  <div class="map-page">
    <!-- 顶部筛选栏 -->
    <div class="map-filter">
      <el-select
        v-model="selectedCityId"
        placeholder="选择城市"
        clearable
        size="small"
        style="width:140px"
        @change="handleCityChange"
      >
        <el-option
          v-for="c in cityList"
          :key="c.id"
          :label="c.cityName"
          :value="c.id"
        ></el-option>
      </el-select>

      <el-select v-model="selectTag" placeholder="标签筛选" size="small" clearable @change="handleTagChange">
        <el-option label="全部" value="" />
        <el-option label="老街" value="老街" />
        <el-option label="美食" value="美食" />
        <el-option label="人文" value="人文" />
        <el-option label="夜景" value="夜景" />
      </el-select>
      <!-- 距离筛选 -->
      <el-select v-model="searchRadius" size="small">
        <el-option label="1km" :value="1000"></el-option>
        <el-option label="3km" :value="3000"></el-option>
        <el-option label="5km" :value="5000"></el-option>
      </el-select>
      <el-input v-model.number="mockLng" placeholder="模拟经度" size="small" v-if="openMockLoc"></el-input>
      <el-input v-model.number="mockLat" placeholder="模拟纬度" size="small" v-if="openMockLoc"></el-input>
      <el-switch v-model="openMockLoc" active-text="模拟定位" @change="handleMockLocToggle"></el-switch>
    </div>
    <!-- 地图容器：高度改成 calc(100vh - 64px)，让出底部tab -->
    <div id="container" class="map-container"></div>
    <!-- 加载遮罩 -->
    <div class="map-loading" v-if="isLoading">
      <div>地图加载中...</div>
    </div>
    <!-- 悬浮按钮组：定位按钮 + 重置视图 + 清除轨迹按钮 -->
    <div class="map-btn-group">
      <div class="map-locate-btn" @click="getCurrentLocation" title="回到我的位置">
        <el-icon><Location /></el-icon>
      </div>
      <div class="map-reset-btn" @click="resetMapView" title="重置地图视图">
        <el-icon><Refresh /></el-icon>
      </div>
      <div class="map-clear-btn" v-if="polyline" @click="clearTrace" title="清除路线轨迹">
        <el-icon><Delete /></el-icon>
      </div>
    </div>
    <!-- 附近路线浮窗 -->
    <div class="near-panel" v-if="showNearPanel">
      <div class="panel-title">附近{{searchRadius/1000}}km路线</div>
      <div v-if="nearRouteList.length === 0" class="empty-tip">当前范围内暂无路线</div>
      <div
        class="route-item"
        v-for="item in nearRouteList"
        :key="item.id"
        @click="selectRoute(item)"
        :class="{active: activeRouteId === item.id}"
      >
        <div class="route-name">{{item.routeName}}</div>
        <div class="tip">{{item.city}} · {{item.duration}}</div>
      </div>
    </div>
    <!-- ========== 底部Tab导航 ========== -->
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
import { ref, onMounted, onUnmounted, watch } from "vue"
import { Location, Delete, Refresh } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { load } from "@amap/amap-jsapi-loader"
import { getMapPoints } from "@/api/map"
import request from "@/utils/request"
import { useRouter, useRoute } from "vue-router"
const router = useRouter()
const route = useRoute()
let map = null
let markerUser = null // 用户当前定位标记
let polyline = null //路线轨迹线
let geolocation = null //定位实例
let allMarkers = [] // 保存所有点位marker，用于筛选显隐
let infoWin = null //点位弹窗实例
const selectTag = ref("")
const openMockLoc = ref(true)
const mockLng = ref(113.2644)
const mockLat = ref(23.1291)
const nearRouteList = ref([])
const showNearPanel = ref(true)
const searchRadius = ref(3000)
const isLoading = ref(true)
const activeRouteId = ref(null)
const originCenter = ref([113.2644, 23.1291]) // 记录当前基准中心点（用户定位/选择城市）

// 城市下拉列表
const cityList = ref([])
const selectedCityId = ref(null)

// mock点位（扩充深圳点位，适配多城市）
const mockPoints = [
  { id:1, pointName:"陈家祠", longitude:113.2401, latitude:23.1375, tag:"人文", description:"岭南古建筑群，雕梁画栋极具特色", imageUrl:"https://picsum.photos/id/24/240/140", routeId:1001, city:"广州" },
  { id:2, pointName:"北京路", longitude:113.2704, latitude:23.1234, tag:"老街", description:"广州千年古道，老牌步行街", imageUrl:"https://picsum.photos/id/25/240/140", routeId:1001, city:"广州" },
  { id:3, pointName:"上下九", longitude:113.2362, latitude:23.1176, tag:"美食", description:"广式小吃聚集地，老字号云集", imageUrl:"https://picsum.photos/id/26/240/140", routeId:1002, city:"广州" },
  { id:4, pointName:"沙面岛", longitude:113.2408, latitude:23.1147, tag:"人文", description:"欧式风情小岛，适合散步拍照", imageUrl:"https://picsum.photos/id/27/240/140", routeId:1001, city:"广州" },
  { id:5, pointName:"深圳东门老街", longitude:114.0716, latitude:22.5431, tag:"老街", description:"深圳老牌商业老街", imageUrl:"https://picsum.photos/id/28/240/140", routeId:2001, city:"深圳" },
  { id:6, pointName:"深圳欢乐海岸", longitude:114.0233, latitude:22.5245, tag:"夜景", description:"滨海夜景，水秀表演", imageUrl:"https://picsum.photos/id/29/240/140", routeId:2002, city:"深圳" },
  { id:7, pointName:"深圳蛇口海上世界", longitude:113.9110, latitude:22.4820, tag:"人文", description:"明华轮地标，滨海文艺街区", imageUrl:"https://picsum.photos/id/30/240/140", routeId:2003, city:"深圳" },
]
// mock路线增加cityId字段，匹配后端
const mockNearRoute = [
  { id:1001, routeName:"老城人文漫步", city:"广州", cityId:1, duration:"2小时", tag:"人文" },
  { id:1002, routeName:"西关美食路线", city:"广州", cityId:1, duration:"1.5小时", tag:"美食" },
  { id:1003, routeName:"北京路老街路线", city:"广州", cityId:1, duration:"2.5小时", tag:"老街" },
  { id:1004, routeName:"珠江夜景路线", city:"广州", cityId:1, duration:"2小时", tag:"夜景" },
  { id:2001, routeName:"深圳东门老街漫游", city:"深圳", cityId:2, duration:"1.5小时", tag:"老街" },
  { id:2002, routeName:"深圳滨海夜景线", city:"深圳", cityId:2, duration:"2小时", tag:"夜景" },
  { id:2003, routeName:"蛇口文艺海岸线", city:"深圳", cityId:2, duration:"2小时", tag:"人文" },
]
// 根据标签获取marker颜色
const getMarkerColor = (tag) => {
  const colorMap = {
    "老街": "#9c27b0",
    "美食": "#ffc107",
    "人文": "#4caf50",
    "夜景": "#ff5722"
  }
  return colorMap[tag] || "#f44336"
}
// 创建自定义圆点Marker
const createCircleMarker = (tag, AMap) => {
  const color = getMarkerColor(tag)
  return new AMap.Marker({
    content: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 4px ${color}"></div>`,
    offset: new AMap.Pixel(-7, -7)
  })
}
//【修改！适配params路由 /detail/:id】跳转路线详情
const goDetail = (routeId) => {
  router.push({ name: "Detail", params: { id: routeId } })
  if(infoWin) infoWin.close()
}
//选中附近路线，绘制轨迹
const selectRoute = async (routeItem) => {
  activeRouteId.value = routeItem.id
  showNearPanel.value = false
  await drawRouteTrace(routeItem)
  setMarkerHighlight(routeItem.id)
}
// 设置点位高亮：属于当前routeId高亮，其他置灰
const setMarkerHighlight = (routeId)=>{
  allMarkers.forEach(m=>{
    const p = m.pointData
    if(p.routeId === routeId){
      m.setzIndex(200)
      m.show()
    }else{
      m.setzIndex(10)
    }
  })
}
//清除绘制轨迹
const clearTrace = () => {
  if(polyline){
    polyline.remove()
    polyline = null
  }
  activeRouteId.value = null
  allMarkers.forEach(m=>{
    m.setzIndex(100)
  })
  showNearPanel.value = true
  ElMessage.info("已清除路线轨迹")
}
//重置地图视图：回到当前基准中心点
const resetMapView = () => {
  map.setCenter(originCenter.value)
  map.setZoom(13)
  ElMessage.info("已重置地图至当前位置")
}
//切换模拟定位开关立刻更新定位
const handleMockLocToggle = ()=>{
  getCurrentLocation()
}

// 加载城市列表
const loadCityList = async () => {
  try {
    const res = await request.get("/api/city/list")
    if(res.code === 200){
      cityList.value = res.data
    }
  } catch (e) {
    ElMessage.warning("城市列表加载失败")
  }
}

// 城市下拉切换
const handleCityChange = (cid) => {
  if(!cid){
    // 清空选择，回到定位附近查询
    if(markerUser){
      const pos = markerUser.getPosition()
      fetchNearRoute(pos.lng, pos.lat, null)
    }
    return
  }
  const cityItem = cityList.value.find(item=>item.id === cid)
  if(!cityItem) return
  const pos = [cityItem.centerLng, cityItem.centerLat]
  originCenter.value = pos
  map.setCenter(pos)
  map.setZoom(11)
  setUserMarker(pos)
  fetchNearRoute(pos[0], pos[1], cid)
  ElMessage.success(`已定位到：${cityItem.cityName}`)
}

//初始化地图【✅已完全删除Toolbar相关代码】
const initMap = async () => {
  try {
    window._AMapSecurityConfig = {
      securityJsCode: import.meta.env.VITE_AMAP_SECRET,
    }
    const AMap = await load({
      key: import.meta.env.VITE_AMAP_KEY,
      version: "2.0",
      plugins: ['AMap.Geolocation']
    })
    map = new AMap.Map("container", {
      zoom: 13,
      center: [mockLng.value, mockLat.value],
      showCompass: false,
      showZoomBar: false
    })
    geolocation = new AMap.Geolocation({
      enableHighAccuracy: true,
      timeout: 6000
    })
    // 地图点击空白关闭弹窗
    map.on("click",()=>{
      if(infoWin) infoWin.close()
    })
    getCurrentLocation()
    await loadAllPointMark(AMap)
    // ========== 新增：读取从Detail传过来的经纬度，自动定位点位 ==========
    const targetLng = Number(route.query.targetLng)
    const targetLat = Number(route.query.targetLat)
    if(targetLng && targetLat){
      const targetPos = [targetLng, targetLat]
      map.setCenter(targetPos)
      map.setZoom(15)
      ElMessage.info("已定位到选中打卡点位")
    }
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
    originCenter.value = mockPos
    setUserMarker(mockPos)
    map.setCenter(mockPos)
    fetchNearRoute(mockPos[0], mockLat.value, selectedCityId.value)
    return
  }
  geolocation.getCurrentPosition((status, result) => {
    if (status === 'complete') {
      const pos = [result.position.lng, result.position.lat]
      originCenter.value = pos
      setUserMarker(pos)
      map.setCenter(pos)
      fetchNearRoute(pos[0], pos[1], selectedCityId.value)
    } else {
      ElMessage.warning("获取GPS失败，使用默认广州位置演示")
      const fallbackPos = [113.2644,23.1291]
      originCenter.value = fallbackPos
      setUserMarker(fallbackPos)
      map.setCenter(fallbackPos)
      fetchNearRoute(fallbackPos[0], fallbackPos[1], selectedCityId.value)
    }
  })
}
// 设置用户蓝色定位标记
const setUserMarker = (pos) => {
  if (markerUser) markerUser.remove()
  const AMap = window.AMap
  markerUser = new AMap.Marker({
    position: pos,
    content: `<div style="width:16px;height:16px;border-radius:50%;background:#0099ff;border:2px solid #fff;box-shadow:0 0 4px #0099ff"></div>`,
    offset: new AMap.Pixel(-8, -8),
    map: map
  })
}
//加载全部打卡点位标记
const loadAllPointMark = async (AMap) => {
  let pointList = []
  try {
    const res = await getMapPoints()
    pointList = res.data
  } catch (e) {
    ElMessage.info("后端点位接口未就绪，使用模拟数据演示")
    pointList = mockPoints
  }
  allMarkers.forEach(m => m.remove())
  allMarkers = []
  pointList.forEach(p => {
    const markerContent = createCircleMarker(p.tag, AMap)
    const m = new window.AMap.Marker({
      position: [p.longitude, p.latitude],
      title: p.pointName,
      content: markerContent.getContent(),
      offset: markerContent.getOffset(),
      map: map
    })
    m.pointData = p
    allMarkers.push(m)
    m.on("click", (e) => {
      if(infoWin) infoWin.close()
      const imgSrc = p.imageUrl || "https://picsum.photos/id/24/240/140"
      const infoContent = `
      <div style="padding:4px;max-width:260px;">
        <img src="${imgSrc}" style="width:100%;height:130px;object-fit:cover;border-radius:4px;">
        <h4 style="margin:6px 0;font-size:15px;">${p.pointName}</h4>
        <div style="font-size:12px;color:#888;margin-bottom:4px;">标签：${p.tag}</div>
        <p style="font-size:13px;color:#555;min-height:40px;">${p.description || "暂无简介"}</p>
        <div style="display:flex;gap:6px;margin-top:8px;">
          <button id="goDetailBtn_${p.routeId}" style="flex:1;padding:5px 4px;background:#0099ff;color:#fff;border:none;border-radius:4px;font-size:12px;">跳转路线详情</button>
          <button id="drawTraceBtn_${p.routeId}" style="flex:1;padding:5px 4px;background:#67c23a;color:#fff;border:none;border-radius:4px;font-size:12px;">绘制轨迹</button>
        </div>
      </div>`
      infoWin = new window.AMap.InfoWindow({ content: infoContent })
      infoWin.open(map, m.getPosition())
      setTimeout(() => {
        document.getElementById(`goDetailBtn_${p.routeId}`)?.addEventListener("click", () => {
          goDetail(p.routeId)
        })
        document.getElementById(`drawTraceBtn_${p.routeId}`)?.addEventListener("click", async () => {
          const targetRoute = mockNearRoute.find(r=>r.id === p.routeId)
          if(!targetRoute) {
            ElMessage.warning("找不到该路线信息")
            return
          }
          await selectRoute(targetRoute)
          if(infoWin) infoWin.close()
        })
      }, 100)
    })
  })
}
//标签筛选切换【修复：点位过滤 + 同步刷新附近路线列表】
const handleTagChange = () => {
  allMarkers.forEach(marker => {
    const point = marker.pointData
    if (!selectTag.value || point.tag === selectTag.value) {
      marker.show()
    } else {
      marker.hide()
    }
  })
  if(markerUser){
    const pos = markerUser.getPosition()
    fetchNearRoute(pos[0], pos[1], selectedCityId.value)
  }
}
// 查询附近路线，支持cityId过滤
const fetchNearRoute = async (lng, lat, cityId = null) => {
  if(lng === undefined || lat === undefined) return
  if(openMockLoc.value){
    let list = [...mockNearRoute]
    if(cityId){
      list = list.filter(item => item.cityId === cityId)
    }
    if(selectTag.value){
      list = list.filter(item => item.tag === selectTag.value)
    }
    nearRouteList.value = list
    return
  }
  try {
    const res = await request({
      url:"/map/nearRoute",
      method:"get",
      params:{
        lng,
        lat,
        radius:searchRadius.value,
        tag: selectTag.value,
        cityId: cityId
      }
    })
    nearRouteList.value = res.data
  } catch (e) {
    ElMessage.info("附近路线接口未就绪，加载模拟路线")
    let list = [...mockNearRoute]
    if(cityId) list = list.filter(item => item.cityId === cityId)
    if(selectTag.value) list = list.filter(item => item.tag === selectTag.value)
    nearRouteList.value = list
  }
}
//选中某条路线，绘制轨迹折线【修复mock模式：自动根据routeId查找对应点位】
const drawRouteTrace = async (routeItem) => {
  if(openMockLoc.value){
    if (polyline) polyline.remove()
    // 根据routeId匹配点位
    const pathPoints = mockPoints.filter(p => p.routeId === routeItem.id)
    if(pathPoints.length === 0){
      ElMessage.warning("该路线暂无点位")
      polyline = null
      return
    }
    const pathArr = pathPoints.map(i=>[i.longitude,i.latitude])
    polyline = new window.AMap.Polyline({
      path: pathArr,
      strokeColor: "#0099ff",
      strokeWeight: 5,
      map: map
    })
    map.setFitView(polyline)
    ElMessage.success(`已加载【${routeItem.routeName}】轨迹`)
    return
  }
  try {
    if (polyline) polyline.remove()
    const res = await request({
      url:"/map/routePath",
      method:"get",
      params:{routeId:routeItem.id}
    })
    const pointArr = res.data
    if(!pointArr || pointArr.length === 0){
      ElMessage.warning("该路线暂无打卡点位，无法绘制轨迹")
      polyline = null
      return
    }
    const pathArr = pointArr.map(item => [item.longitude, item.latitude])
    polyline = new window.AMap.Polyline({
      path: pathArr,
      strokeColor: "#0099ff",
      strokeWeight: 5,
      map: map
    })
    map.setFitView(polyline)
    ElMessage.success(`已加载【${routeItem.routeName}】轨迹`)
  } catch (err) {
    ElMessage.info("轨迹接口未就绪，加载模拟行走轨迹")
    if (polyline) polyline.remove()
    const pathPoints = mockPoints.filter(p => p.routeId === routeItem.id)
    if(pathPoints.length === 0){
      ElMessage.warning("该路线暂无点位")
      polyline = null
      return
    }
    const pathArr = pathPoints.map(i=>[i.longitude,i.latitude])
    polyline = new window.AMap.Polyline({
      path: pathArr,
      strokeColor: "#0099ff",
      strokeWeight: 5,
      map: map
    })
    map.setFitView(polyline)
  }
}
//监听搜索半径改变自动刷新附近路线
watch(searchRadius, () => {
  if(markerUser){
    const pos = markerUser.getPosition()
    fetchNearRoute(pos[0], pos[1], selectedCityId.value)
  }
})
onMounted(() => {
  loadCityList()
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
  height: calc(100vh - 64px);
}
.map-loading {
  position: absolute;
  z-index: 100;
  left: 0;
  top: 0;
  width: 100%;
  height: calc(100vh - 64px);
  background: rgba(255,255,255,0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap:10px;
  font-size:16px;
}
/*悬浮按钮组 */
.map-btn-group{
  position:absolute;
  bottom:80px;
  right:14px;
  z-index:99;
  display:flex;
  flex-direction:column;
  gap:10px;
}
.map-locate-btn, .map-reset-btn, .map-clear-btn {
  width: 44px;
  height: 44px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 2px 8px #00000022;
  cursor: pointer;
}
.near-panel {
  position: absolute;
  z-index: 99;
  bottom: 140px;
  left: 10px;
  width: 260px;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  max-height: 260px;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0,0,0,0.12);
}
.panel-title {
  font-weight: bold;
  margin-bottom: 8px;
  font-size:15px;
}
.empty-tip{
  color:#999;
  font-size:13px;
  padding:8px 0;
}
.route-item {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}
.route-name{
  font-size:14px;
}
.route-item:hover {
  color:#0099ff;
}
.route-item.active{
  background-color:#ecf5ff;
}
.tip {
  font-size: 12px;
  color: #666;
  margin-top:2px;
}
/* ==========底部Tab栏，和Home完全一致========== */
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
</style>
