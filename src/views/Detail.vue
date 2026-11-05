<!-- src/views/Detail.vue 路线详情页｜适配params路由 /detail/:id -->
<template>
<<<<<<< HEAD
  <div class="detail-page">
    <!-- 顶部封面栏 -->
    <div class="detail-cover">
      <img v-if="routeInfo.cover" :src="routeInfo.cover" alt="路线封面" />
      <div class="cover-op">
        <el-button circle size="small" @click="$router.back()">←</el-button>
        <div class="op-right">
          <el-button circle size="small" @click="handleCollect">⭐</el-button>
          <el-button circle size="small" @click="handleLike">❤️</el-button>
        </div>
      </div>
    </div>

    <div class="detail-content">
      <!-- 路线基础信息 -->
      <div class="info-block">
        <h2 class="title">{{ routeInfo.routeName }}</h2>
        <div class="meta-row">
          <span>{{ routeInfo.city }}</span>
          <span>⏱ {{ routeInfo.duration }}</span>
          <span>📏 {{ routeInfo.distance }}</span>
        </div>
        <div class="tag-wrap">
          <el-tag v-for="tag in routeInfo.tags" :key="tag" size="small">{{tag}}</el-tag>
        </div>
        <div class="author">创作者：{{ routeInfo.authorName }}</div>
        <div class="desc">
          <div class="sub-title">路线简介</div>
          <p>{{ routeInfo.description }}</p>
        </div>
      </div>

      <!-- 内嵌预览小地图 -->
      <div class="map-preview-block">
        <div class="sub-title">路线轨迹预览</div>
        <div id="mini-map" class="mini-map"></div>
      </div>

      <!-- 打卡点有序列表 -->
      <div class="point-block">
        <div class="sub-title">打卡点位（行走顺序）</div>
        <div class="point-item" v-for="(p,index) in pointList" :key="p.id">
          <div class="point-index">{{ index+1 }}</div>
          <div class="point-main">
            <img v-if="p.imageUrl" :src="p.imageUrl" class="point-img" />
            <div class="point-name">{{ p.pointName }}</div>
            <div class="point-intro">{{ p.description }}</div>
            <div class="point-btn-wrap">
              <el-button size="small" @click="goToMap(p.longitude,p.latitude)">前往该点位地图</el-button>
              <el-button size="small" type="success" @click="handleCheckIn(p)">打卡</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 评论区 -->
      <div class="comment-block">
        <div class="sub-title">用户评论</div>
        <el-input v-model="commentText" placeholder="写下你的游玩感受..." />
        <el-button style="margin:8px 0" type="primary" @click="submitComment">发表评论</el-button>
        <div class="comment-item" v-for="c in commentList" :key="c.id">
          <div class="c-user">{{c.userName}}</div>
          <div class="c-content">{{c.content}}</div>
        </div>
      </div>
    </div>

    <!-- 底部留白，避开tab -->
    <div class="bottom-space"></div>

    <!-- 全局底部Tab导航，和Home、Map完全统一 -->
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
=======
  <div class="detail-container">
    <!-- 顶部返回栏 -->
    <div class="detail-header">
      <el-button icon="ArrowLeft" circle @click="$router.back()"></el-button>
      <span class="title">路线详情</span>
    </div>

    <div v-if="routeInfo" class="content-wrap">
      <!-- 大图 -->
      <div class="banner-img">
        <img :src="routeInfo.cover" alt="" />
      </div>
      <div class="info-card">
        <h2>{{ routeInfo.name }}</h2>
        <div class="meta-row">
          <span>{{ routeInfo.city }}</span>
          <span>⏱ 预计 {{ routeInfo.duration }}</span>
        </div>
        <div class="tag-group">
          <el-tag v-for="t in routeInfo.tags" key="t" size="small">{{ t }}</el-tag>
        </div>

        <div class="desc-title">路线介绍</div>
        <div class="desc-text">{{ routeInfo.desc }}</div>

        <div class="action-row">
          <el-button type="danger" plain @click="likeAction">
            ❤ {{ routeInfo.likeNum }}
          </el-button>
          <el-button type="warning" plain @click="collectAction">
            ⭐ {{ routeInfo.collectNum }}
          </el-button>
        </div>
      </div>
    </div>
    <div v-else class="empty">加载路线信息...</div>

    <!-- 底部Tab -->
    <div class="tab-bar">
      <div class="tab-item" @click="$router.push('/home')">首页</div>
      <div class="tab-item" @click="$router.push('/map')">探索地图</div>
      <div class="tab-item" @click="$router.push('/publish')">发布路线</div>
      <div class="tab-item" @click="$router.push('/record')">打卡记录</div>
      <div class="tab-item" @click="$router.push('/my')">我的</div>
    </div>
    <div class="blank-bottom"></div>
>>>>>>> 347f91d955943ff7d92daec9466ec3067abbce4a
  </div>
</template>

<script setup>
<<<<<<< HEAD
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { load } from "@amap/amap-jsapi-loader"
import { useRouter, useRoute } from "vue-router"
import { getRouteDetailAPI } from '@/api/route'
const router = useRouter()
const route = useRoute()

//【重点：从params拿id，适配 /detail/:id】
const routeId = ref(Number(route.params.id))
let miniMap = null
let miniPolyline = null

// 路线详情数据
const routeInfo = ref({})
const pointList = ref([])
const commentText = ref("")
const commentList = ref([])

// mock模拟数据（后端接口未就绪演示用）
const mockDetailData = {
  id:1001,
  routeName:"老城人文漫步",
  city:"广州",
  duration:"2小时",
  distance:"4.2km",
  tags:["人文","老街"],
  authorName:"漫游爱好者",
  cover:"https://picsum.photos/id/24/750/320",
  description:"广州老城一日漫步，游览岭南古建筑，感受老城烟火气息，适合周末休闲出行。最佳游玩时间：下午14点‑18点。",
  points:[
    {id:1,pointName:"陈家祠",longitude:113.2401,latitude:23.1375,imageUrl:"https://picsum.photos/id/24/200/120",description:"岭南古建筑群，精美的砖雕石雕"},
    {id:2,pointName:"沙面岛",longitude:113.2408,latitude:23.1147,imageUrl:"https://picsum.photos/id/27/200/120",description:"欧式复古小岛，拍照出片"},
    {id:3,pointName:"北京路",longitude:113.2704,latitude:23.1234,imageUrl:"https://picsum.photos/id/25/200/120",description:"千年古道，老牌商业步行街"}
  ]
}
const mockComment = [
  {id:1,userName:"游客A",content:"这条路线很不错，周末已经去过！"},
  {id:2,userName:"游客B",content:"推荐大家下午过去，风景很好"}
]

// 加载详情
const loadDetail = async ()=>{
  try{
    // 真实后端接口
    const res = await getRouteDetailAPI(routeId.value)
    const data = res.data
    routeInfo.value = data
    pointList.value = data.points
    commentList.value = mockComment
    await initMiniMap(data.points)
  }catch(e){
    ElMessage.info("后端接口未就绪，加载模拟数据演示")
    const data = mockDetailData
    routeInfo.value = data
    pointList.value = data.points
    commentList.value = mockComment
    await initMiniMap(data.points)
  }
}

//初始化内嵌预览小地图
const initMiniMap = async (points)=>{
  const AMap = await load({
    key: import.meta.env.VITE_AMAP_KEY,
    version:"2.0",
    plugins:[]
  })
  miniMap = new AMap.Map("mini-map",{
    zoom:12,
    showCompass:false,
    showZoomBar:false
  })
  const path = points.map(p=>[p.longitude,p.latitude])
  miniPolyline = new AMap.Polyline({
    path:path,
    strokeColor:"#409eff",
    strokeWeight:4
  })
  miniMap.add(miniPolyline)
  miniMap.setFitView(miniPolyline)
}

//跳转到地图页面，并定位到该打卡点位（query传经纬度）
const goToMap = (lng,lat)=>{
  router.push({
    path:"/map",
    query:{
      targetLng:lng,
      targetLat:lat
    }
  })
}

//打卡业务（核心，距离校验逻辑）
const handleCheckIn = (point)=>{
  ElMessage.info(`打卡点位：${point.pointName}，实际项目这里调用GPS，判断用户和该点距离小于阈值允许打卡`)
}

//收藏
const handleCollect = ()=>{
  ElMessage.success("收藏操作")
}
//点赞
const handleLike = ()=>{
  ElMessage.success("点赞操作")
}
//提交评论
const submitComment = ()=>{
  if(!commentText.value.trim()) return
  ElMessage.success("发表评论："+commentText.value)
  commentText.value=""
}

onMounted(()=>{
  if(!routeId.value){
    ElMessage.warning("路线id不存在，返回首页")
    router.push("/home")
    return
  }
  loadDetail()
})

onUnmounted(()=>{
  if(miniMap) miniMap.destroy()
})
</script>

<style scoped>
.detail-page{
  background:#f7f8fa;
  min-height:100vh;
  padding-bottom:70px;
}
.detail-cover{
  width:100%;
  height:220px;
  position:relative;
}
.detail-cover img{
  width:100%;
  height:100%;
  object-fit:cover;
}
.cover-op{
  position:absolute;
  top:10px;
  left:10px;
  right:10px;
  display:flex;
  justify-content:space-between;
}
.detail-content{
  padding:14px;
}
.info-block{
  background:#fff;
  border-radius:10px;
  padding:14px;
  margin-bottom:14px;
}
.title{
  font-size:18px;
  margin:0 0 8px;
}
.meta-row{
  display:flex;
  gap:14px;
  color:#666;
  font-size:13px;
}
.tag-wrap{
  margin:8px 0;
}
.author{
  font-size:13px;
  color:#888;
  margin:6px 0;
}
.sub-title{
  font-weight:bold;
  margin:10px 0 6px;
}
.map-preview-block{
  background:#fff;
  border-radius:10px;
  padding:14px;
  margin-bottom:14px;
}
.mini-map{
  width:100%;
  height:200px;
  border-radius:6px;
}
.point-block{
  background:#fff;
  border-radius:10px;
  padding:14px;
  margin-bottom:14px;
}
.point-item{
  display:flex;
  gap:10px;
  padding:12px 0;
  border-bottom:1px solid #eee;
}
.point-index{
  width:24px;
  height:24px;
  background:#409eff;
  color:#fff;
  border-radius:50%;
  text-align:center;
  flex-shrink:0;
  font-size:13px;
  line-height:24px;
}
.point-main{
  flex:1;
}
.point-img{
  width:100%;
  height:130px;
  object-fit:cover;
  border-radius:6px;
}
.point-name{
  font-weight:bold;
  margin:4px 0;
}
.point-intro{
  font-size:13px;
  color:#666;
}
.point-btn-wrap{
  margin-top:8px;
  display:flex;
  gap:8px;
}
.comment-block{
  background:#fff;
  border-radius:10px;
  padding:14px;
}
.comment-item{
  padding:8px 0;
  border-bottom:1px solid #eee;
}
.c-user{
  font-size:13px;
  color:#409eff;
}
.c-content{
  font-size:14px;
  margin-top:2px;
}
.bottom-space{
  height:70px;
}
/*底部tab，和Home、Map完全一致 */
=======
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()

// 和Home里面完全一致的数据源（详情页读取）
const allRouteData = ref([
  {
    id: 1,
    name: '老城街巷漫步路线',
    city: '广州',
    duration: '2小时',
    cover: '/pictures/1.png',
    tags: ['老街', '人文'],
    likeNum: 128,
    collectNum: 66,
    hotScore: 194,
    desc: '这条路线穿梭在广州西关老城街巷，漫步青砖骑楼之间，感受老广州原汁原味市井烟火。沿途可以欣赏岭南古建筑，探访老街小店，感受老城独有的安静与怀旧氛围，适合慢慢散步拍照。'
  },
  {
    id: 2,
    name: '珠江夜景散步',
    city: '广州',
    duration: '1.5小时',
    cover: '/pictures/2.png',
    tags: ['夜景'],
    likeNum: 256,
    collectNum: 120,
    hotScore: 376,
    desc: '沿着珠江江岸散步，欣赏广州塔与两岸楼宇灯光夜景。傍晚时分江风舒适，视野开阔，可以欣赏落日与城市灯光交相辉映，是广州经典夜景散步路线。'
  },
  {
    id: 3,
    name: '东山口文艺打卡线',
    city: '广州',
    duration: '3小时',
    cover: '/pictures/3.png',
    tags: ['美食', '文艺'],
    likeNum: 310,
    collectNum: 189,
    hotScore: 499,
    desc: '东山口保留大量红砖洋楼，文艺小店、咖啡馆、特色商铺密布。这条路线适合文艺打卡、探店拍照，沿途还有不少特色小吃，适合喜欢慢逛、喜欢拍照的朋友。'
  },
  {
    id: 4,
    name: '越秀公园休闲徒步',
    city: '广州',
    duration: '2.5小时',
    cover: '/pictures/4.png',
    tags: ['公园','短途徒步'],
    likeNum: 196,
    collectNum: 92,
    hotScore: 288,
    desc: '越秀公园是广州老牌城市公园，五羊石像就在这里。绿化茂密、环境清幽，路线平缓轻松，适合休闲徒步、放松散心，欣赏园林湖景。'
  },
  {
    id: 5,
    name: '广州博物馆人文游览线',
    city: '广州',
    duration: '3小时',
    cover: '/pictures/5.png',
    tags: ['博物馆','人文'],
    likeNum: 220,
    collectNum: 135,
    hotScore: 355,
    desc: '广州博物馆藏品丰富，了解广州千年城市历史。适合喜欢历史人文的同学，慢慢参观展厅，读懂这座城市从古至今的发展故事。'
  }
])

const routeInfo = computed(() => {
  const id = Number(route.params.id)
  return allRouteData.value.find(item => item.id === id)
})


// 点赞
const likeAction = () => {
  if(routeInfo.value){
    routeInfo.value.likeNum += 1
    ElMessage.success("点赞成功！")
  }
}
// 收藏
const collectAction = () => {
  if(routeInfo.value){
    routeInfo.value.collectNum += 1
    ElMessage.success("收藏成功！")
  }
}
</script>

<style scoped>
.detail-container{
  background: url('/pictures/city-bg.png') no-repeat center center;
  background-size: cover;
  background-attachment: fixed;
  min-height: 100vh;
  padding-bottom:70px;
  position: relative;
}
.detail-container::before {
  content: '';
  position: absolute;
  top:0;
  left:0;
  width:100%;
  height:100%;
  background-color: rgba(255,255,255,0.72);
  z-index: 0;
}
.detail-header, .content-wrap, .tab-bar{
  position: relative;
  z-index: 1;
}
.detail-header{
  background:#fff;
  display:flex;
  align-items:center;
  gap:12px;
  padding:14px;
}
.title{
  font-weight:bold;
  font-size:16px;
}
.content-wrap{
  padding:14px;
}
.banner-img{
  border-radius:12px;
  overflow:hidden;
}
.banner-img img{
  width:100%;
  height:240px;
  object-fit:cover;
}
.info-card{
  background:#fff;
  border-radius:12px;
  padding:16px;
  margin-top:14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.info-card h2{
  margin:0;
  font-size:20px;
}
.meta-row{
  margin:8px 0;
  color:#666;
  display:flex;
  gap:16px;
  font-size:14px;
}
.tag-group{
  margin:8px 0 16px;
}
.desc-title{
  font-weight:bold;
  margin:16px 0 6px;
}
.desc-text{
  color:#555;
  line-height:1.7;
}
.action-row{
  margin-top:20px;
  display:flex;
  gap:16px;
}
.empty{
  text-align:center;
  padding:40px;
}
/*底部tab 和首页统一*/
>>>>>>> 347f91d955943ff7d92daec9466ec3067abbce4a
.tab-bar{
  position:fixed;
  bottom:0;
  left:0;
  width:100%;
<<<<<<< HEAD
  height:64px;
  background:#ffffff;
  display:flex;
  border-top:1px solid #e8e8e8;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.04);
  z-index: 999;
=======
  height:60px;
  background:#fff;
  display:flex;
  border-top:1px solid #eee;
  z-index:99;
>>>>>>> 347f91d955943ff7d92daec9466ec3067abbce4a
}
.tab-item{
  flex:1;
  display:flex;
<<<<<<< HEAD
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
=======
  justify-content:center;
  align-items:center;
  font-size:14px;
  color:#666;
>>>>>>> 347f91d955943ff7d92daec9466ec3067abbce4a
}
.tab-item.active{
  color:#409eff;
}
<<<<<<< HEAD
=======
.blank-bottom{
  height:70px;
}
>>>>>>> 347f91d955943ff7d92daec9466ec3067abbce4a
</style>
