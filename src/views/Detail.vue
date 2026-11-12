<template>
  <div class="detail-page">
    <div class="img-box">
      <!-- 返回按钮：浮在封面上的胶囊按钮，回退上一页；无历史时回首页 -->
      <div class="back-btn" @click="goBack">
        <span class="back-arrow">‹</span>
        <span class="back-text">返回</span>
      </div>
      <div class="img-mask"></div>
      <img class="route-img" :src="routeInfo.coverImage || '/pictures/Myback.jpg'" alt="" @error="onCoverError($event)" />
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
        <!-- 点赞条：真实调用后端 /route/like，点赞数据会进「我的点赞」 -->
        <div class="like-bar">
          <div class="like-btn" :class="{ liked }" @click="handleLike">
            <span class="like-icon">{{ liked ? '❤️' : '🤍' }}</span>
            <span class="like-text">{{ liked ? '已点赞' : '点赞' }} {{ likeCount }}</span>
          </div>
        </div>
        <!-- 打卡入口：整条路线一个入口，进入后逐点位打卡 -->
        <div class="checkin-entry">
          <el-button type="primary" round class="checkin-btn" @click="goCheckin">
            {{ entryText }}
          </el-button>
          <div class="entry-tip">按路线顺序逐个点位打卡，全部完成可获得奖杯</div>
        </div>
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
              <el-button size="small" @click="goToMap(p, index)">前往该点位地图</el-button>
              <span class="point-status" :class="{ done: checkedPointIds.includes(p.id) }">
                {{ checkedPointIds.includes(p.id) ? '已打卡' : '待打卡' }}
              </span>
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
          <div class="c-user">{{ c.nickname || '匿名用户' }}</div>
          <div class="c-content">{{ c.content }}</div>
        </div>
        <div v-if="!commentList.length" class="c-empty">还没有评论，来说两句吧</div>
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
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { load } from "@amap/amap-jsapi-loader"
import { useRouter, useRoute } from "vue-router"
import { getRouteDetailFullAPI, getRouteCommentsAPI, addRouteCommentAPI, likeRouteAPI, unlikeRouteAPI } from '@/api/route'
import { getCheckinStatusAPI } from '@/api/checkin'
import { getRoutePath } from '@/api/map'
const router = useRouter()
const route = useRoute()
//【重点：从params拿id，适配 /detail/:id】
const routeId = ref(Number(route.params.id))
// 返回：有上一页历史就回退，没有则回首页，避免直接打开详情页时按钮点了没反应
const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/home')
  }
}
let miniMap = null
let miniPolyline = null
// 路线详情数据
const routeInfo = ref({})
const pointList = ref([])
const commentText = ref("")
const commentList = ref([])
const likeCount = ref(0)
const liked = ref(false)
// 当前用户在这条路线已打卡的点位 id
const checkedPointIds = ref([])
const entryText = computed(() => {
  const total = pointList.value.length
  const done = pointList.value.filter(p => checkedPointIds.value.includes(p.id)).length
  if (!total) return '查看打卡'
  if (!done) return `开始打卡（共 ${total} 个点位）`
  if (done < total) return `继续打卡 ${done}/${total}`
  return '已完成 · 查看打卡记录'
})
const goCheckin = () => {
  router.push({ name: 'Checkin', params: { id: routeId.value } })
}
const loadCheckinStatus = async () => {
  try {
    const res = await getCheckinStatusAPI(routeId.value)
    checkedPointIds.value = (res && res.code === 200 && res.data && Array.isArray(res.data.checkedPointIds))
      ? res.data.checkedPointIds : []
  } catch (e) {
    checkedPointIds.value = []
  }
}
// mock模拟数据（后端接口未就绪演示用）
const mockDetailData = {
  id:1001,
  routeName:"老城人文漫步",
  city:"广州",
  duration:"2小时",
  distance:"4.2km",
  tags:["人文","老街"],
  authorName:"漫游爱好者",
  coverImage:"https://picsum.photos/id/24/750/320",
  description:"广州老城一日漫步，游览岭南古建筑，感受老城烟火气息，适合周末休闲出行。最佳游玩时间：下午14点‑18点。",
  points:[
    {id:1,pointName:"陈家祠",longitude:113.2401,latitude:23.1375,imageUrl:"https://picsum.photos/id/24/200/120",description:"岭南古建筑群，精美的砖雕石雕"},
    {id:2,pointName:"沙面岛",longitude:113.2408,latitude:23.1147,imageUrl:"https://picsum.photos/id/27/200/120",description:"欧式复古小岛，拍照出片"},
    {id:3,pointName:"北京路",longitude:113.2704,latitude:23.1234,imageUrl:"https://picsum.photos/id/25/200/120",description:"千年古道，老牌商业步行街"}
  ]
}
// 评论列表：走 /route/comment/list（未登录也能读）
const loadComments = async () => {
  try {
    const res = await getRouteCommentsAPI(routeId.value)
    commentList.value = res.code === 200 && Array.isArray(res.data) ? res.data : []
  } catch (e) {
    commentList.value = []
  }
}
// 加载详情
// 封面/点位图加载失败时退回默认图，不显示破图
const onCoverError = (e) => {
  const img = e.target
  if (img && img.dataset.fallback === '1') return
  if (img) { img.dataset.fallback = '1'; img.src = '/pictures/Myback.jpg' }
}

const loadDetail = async () => {
  try {
    const res = await getRouteDetailFullAPI(routeId.value)
    if (res.code !== 200 || !res.data) throw new Error(res.msg || '路线不存在')
    const d = res.data
    routeInfo.value = { ...d.route, tags: d.tags || [], authorName: d.authorName || '城市漫步用户' }
    pointList.value = d.points || []
    likeCount.value = d.route.likeCount || 0
    liked.value = !!d.liked
    loadComments()
    loadCheckinStatus()
    if (pointList.value.length) await initMiniMap(pointList.value)
  } catch (e) {
    ElMessage.info('路线加载失败，展示示例数据')
    routeInfo.value = mockDetailData
    pointList.value = mockDetailData.points
    likeCount.value = 0
    liked.value = false
    commentList.value = []
    await initMiniMap(mockDetailData.points)
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
//跳转到地图页面：定位到当前点位，并让地图把整条路线的点位都画出来
const goToMap = (point, index) => {
  router.push({
    path: '/map',
    query: {
      targetLng: point.longitude,
      targetLat: point.latitude,
      from: 'detail',
      detailId: routeInfo.value.id,
      pointIndex: index,
      routeName: routeInfo.value.routeName || ''
    }
  })
}
//收藏
const handleCollect = ()=>{
  ElMessage.success("收藏操作")
}
//点赞 / 取消点赞（写入 route_like，我的点赞页可查到）
const handleLike = async ()=>{
  try{
    if(liked.value){
      await unlikeRouteAPI(routeId.value)
      liked.value = false
      likeCount.value = Math.max(0, likeCount.value - 1)
      ElMessage.success("已取消点赞")
    }else{
      await likeRouteAPI(routeId.value)
      liked.value = true
      likeCount.value += 1
      ElMessage.success("点赞成功")
    }
  }catch(e){
    ElMessage.warning("请先登录后再点赞")
  }
}
//提交评论
const submitComment = async () => {
  if (!commentText.value.trim()) {
    ElMessage.warning('请先写点内容')
    return
  }
  try {
    const res = await addRouteCommentAPI({ routeId: routeId.value, content: commentText.value.trim() })
    if (res.code !== 200) throw new Error(res.msg || '评论失败')
    ElMessage.success('评论成功')
    commentText.value = ''
    loadComments()
  } catch (e) {
    ElMessage.warning('评论失败，请确认已登录')
  }
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
/* 封面：固定 16:9 比例，任何尺寸图片都用 object-fit 裁切填满，不再按原图比例撑高 */
.img-box{
  position:relative;
  width:100%;
  aspect-ratio:16 / 9;
  max-height:46vh;
  overflow:hidden;
  background:#e9ecef;
}
.img-box .route-img{
  display:block;
  width:100%;
  height:100%;
  object-fit:cover;
  object-position:center;
}
/* 顶部渐变遮罩，保证白色返回按钮在浅色图片上也看得清 */
.img-mask{
  position:absolute;
  top:0;
  left:0;
  width:100%;
  height:78px;
  background:linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0));
  pointer-events:none;
  z-index:1;
}
/* 返回按钮：半透明胶囊 + 毛玻璃 */
.back-btn{
  position:absolute;
  top:12px;
  left:12px;
  z-index:2;
  display:flex;
  align-items:center;
  gap:2px;
  height:32px;
  padding:0 14px 0 8px;
  border-radius:999px;
  background:rgba(0,0,0,0.42);
  backdrop-filter:blur(6px);
  -webkit-backdrop-filter:blur(6px);
  color:#fff;
  font-size:13px;
  line-height:1;
  cursor:pointer;
  box-shadow:0 2px 6px rgba(0,0,0,0.18);
  user-select:none;
}
.back-btn:active{
  background:rgba(0,0,0,0.6);
  transform:scale(0.96);
}
.back-arrow{
  font-size:19px;
  line-height:1;
  margin-top:-2px;
}
.back-text{
  margin-left:1px;
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
/* 点赞条 */
.like-bar{
  display:flex;
  justify-content:flex-end;
  margin:8px 0 4px;
}
.like-btn{
  display:flex;
  align-items:center;
  gap:6px;
  padding:6px 16px;
  border-radius:999px;
  border:1px solid #ffd2a8;
  background:#fff7ed;
  color:#e85d3a;
  font-size:13px;
}
.like-btn.liked{
  background:#ffe4c7;
  border-color:#e85d3a;
}
.like-icon{
  font-size:15px;
}
/* 打卡入口 */
.checkin-entry{
  margin:10px 0 2px;
  text-align:center;
}
.checkin-btn{
  width:100%;
  height:44px;
  font-size:16px;
  font-weight:600;
  background:linear-gradient(135deg,#ff8a4c,#ff6b35);
  border:none;
}
.checkin-btn:active{
  transform:scale(.98);
}
.entry-tip{
  margin-top:6px;
  font-size:12px;
  color:#999;
}
.point-status{
  display:inline-flex;
  align-items:center;
  height:24px;
  padding:0 10px;
  border-radius:12px;
  font-size:12px;
  color:#ff6b35;
  background:#fff1e6;
  border:1px solid #ffd2bd;
}
.point-status.done{
  color:#12a150;
  background:#eafaf0;
  border-color:#bfe9cf;
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
.c-empty{
  font-size:13px;
  color:#999;
  padding:10px 0;
}
.bottom-space{
  height:70px;
}
/*底部tab，和Home、Map完全一致 */
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
.desc h4{
  font-size:17px;
  margin-bottom:8px;
  color:#222;
}
</style>
