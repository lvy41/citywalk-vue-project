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
        <div class="author" :class="{ clickable: authorUid }" @click="goUserProfile(authorUid)">
          <img class="author-avatar" :src="routeInfo.authorAvatar || '/pictures/Myback.jpg'" alt="" @error="onCoverError($event)" />
          <span class="author-name">创作者：{{ routeInfo.authorName }}</span>
        </div>
        <!-- 点赞条：真实调用后端 /route/like，点赞数据会进「我的点赞」 -->
        <div class="like-bar">
          <div class="like-btn" :class="{ liked }" @click="handleLike">
            <span class="like-icon">{{ liked ? '❤️' : '🤍' }}</span>
            <span class="like-text">{{ liked ? '已点赞' : '点赞' }} {{ likeCount }}</span>
          </div>
          <div class="like-btn collect-btn" :class="{ liked: collected }" @click="handleCollect">
            <span class="like-icon">{{ collected ? '⭐' : '☆' }}</span>
            <span class="like-text">{{ collected ? '已收藏' : '收藏' }} {{ collectCount }}</span>
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
        <el-input
          v-model="commentText"
          :placeholder="'写下你的游玩感受...'"
        />
        <el-button style="margin:8px 0" type="primary" @click="submitComment">发表评论</el-button>

        <div class="comment-item" v-for="c in topComments" :key="c.id" :id="`comment-${c.id}`">
          <div class="c-head" @click="goUserProfile(c.userId)">
            <img class="c-avatar" :src="c.avatar || '/pictures/Myback.jpg'" alt="" @error="onCoverError($event)" />
            <span class="c-user">{{ c.nickname || '匿名用户' }}</span>
          </div>
          <div class="c-content">{{ c.content }}</div>
          <div class="c-time">{{ formatCommentTime(c.createTime) }}</div>
          <div class="c-actions">
            <span class="c-action" :class="{ liked: c.liked }" @click="toggleCommentLike(c)">
              {{ c.liked ? '❤️' : '🤍' }} {{ c.likeCount || 0 }}
            </span>
            <span class="c-action" @click="startReply(c)">回复</span>
            <span v-if="c.canDelete" class="c-action delete" @click="removeComment(c)">删除</span>
          </div>

          <div class="reply-list">
            <div class="comment-item reply-item" v-for="r in repliesOf(c.id)" :key="r.id" :id="`comment-${r.id}`">
              <div class="c-head" @click="goUserProfile(r.userId)">
                <img class="c-avatar" :src="r.avatar || '/pictures/Myback.jpg'" alt="" @error="onCoverError($event)" />
                <span class="c-user">{{ r.nickname || '匿名用户' }}</span>
                <span v-if="r.replyToNickname" class="reply-to">回复 {{ r.replyToNickname }}</span>
              </div>
              <div class="c-content">{{ r.content }}</div>
              <div class="c-time">{{ formatCommentTime(r.createTime) }}</div>
              <div class="c-actions">
                <span class="c-action" :class="{ liked: r.liked }" @click="toggleCommentLike(r)">
                  {{ r.liked ? '❤️' : '🤍' }} {{ r.likeCount || 0 }}
                </span>
                <span class="c-action" @click="startReply(r)">回复</span>
                <span v-if="r.canDelete" class="c-action delete" @click="removeComment(r)">删除</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!commentList.length" class="c-empty">还没有评论，来说两句吧</div>
      </div>

      <div v-if="replyVisible" class="reply-sheet">
        <div class="reply-quote" v-if="replyingTo">
          <div class="reply-quote-main">
            <span class="reply-quote-user">回复 @{{ replyingTo.nickname || '匿名用户' }}</span>
            <span class="reply-quote-content">{{ replyingTo.content }}</span>
          </div>
          <span class="reply-close" @click="cancelReply">取消</span>
        </div>
        <div class="reply-input-row">
          <el-input
            ref="replyInputRef"
            v-model="replyText"
            type="textarea"
            :rows="2"
            autosize
            :placeholder="replyingTo ? `回复 @${replyingTo.nickname}...` : '回复内容...'"
            @keydown.enter.prevent="submitComment"
          />
          <el-button class="reply-send" type="primary" round @click="submitComment">发送</el-button>
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

    <!-- 点赞 / 评论后的成就弹窗（累计到门槛才弹） -->
    <AchievementDialog
      v-model="detailAchVisible"
      :achievements="detailAchievements"
      title="成就达成！"
      subtitle="你的累计次数达到了新的里程碑"
    />
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { load } from "@amap/amap-jsapi-loader"
import { useRouter, useRoute } from "vue-router"
import { getRouteDetailFullAPI, getRouteCommentsAPI, addRouteCommentAPI, likeRouteAPI, unlikeRouteAPI, favoriteRouteAPI, unfavoriteRouteAPI, toggleCommentLikeAPI, deleteCommentAPI } from '@/api/route'
import { getCheckinStatusAPI } from '@/api/checkin'
import { getRoutePath } from '@/api/map'
import AchievementDialog from '@/components/AchievementDialog.vue'
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
const replyingTo = ref(null)
const replyVisible = ref(false)
const replyText = ref("")
const replyInputRef = ref(null)
const likeCount = ref(0)
const liked = ref(false)
// 点赞 / 评论后的成就弹窗（只在累计到 10/20/50 时出现）
const detailAchVisible = ref(false)
const detailAchievements = ref([])

const showAchievementIfAny = (res) => {
  const list = res && res.data && Array.isArray(res.data.newAchievements) ? res.data.newAchievements : []
  if (!list.length) return
  detailAchievements.value = list
  detailAchVisible.value = true
}
const collectCount = ref(0)
const collected = ref(false)
// 当前用户在这条路线已打卡的点位 id
const checkedPointIds = ref([])
const authorUid = computed(() => routeInfo.value.authorId || routeInfo.value.userId || null)
const topComments = computed(() => commentList.value.filter(c => !c.parentId || Number(c.parentId) === 0))
const repliesOf = (parentId) => {
  const parent = topComments.value.find(c => Number(c.id) === Number(parentId))
  return parent?.children || []
}
const formatCommentTime = (time) => {
  if (!time) return ''
  const d = new Date(typeof time === 'string' ? time.replace(' ', 'T') : time)
  if (Number.isNaN(d.getTime())) return String(time)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
const findComment = (comments, id) => {
  for (const c of comments || []) {
    if (String(c.id) === String(id)) return c
    const child = findComment(c.children, id)
    if (child) return child
  }
  return null
}
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
const goUserProfile = (uid) => {
  if (!uid) return
  router.push(`/user/${uid}`)
}
const loadCheckinStatus = async () => {
  // 详情页无需登录即可访问，未登录时不请求打卡进度（该接口需要登录）
  if (!localStorage.getItem('token')) {
    checkedPointIds.value = []
    return
  }
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
    await focusTargetComment()
  } catch (e) {
    commentList.value = []
  }
}

const focusTargetComment = async () => {
  const targetId = route.query.comment
  if (!targetId) return
  const target = findComment(commentList.value, targetId)
  if (!target) return
  await nextTick()
  startReply(target)
  document.getElementById(`comment-${targetId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
    routeInfo.value = {
      ...d.route,
      tags: d.tags || [],
      authorName: d.authorName || '城市漫步用户',
      authorAvatar: d.authorAvatar || '',
      authorId: d.authorId || null
    }
    pointList.value = d.points || []
    likeCount.value = d.route.likeCount || 0
    liked.value = !!d.liked
    collectCount.value = d.route.collectCount || 0
    collected.value = !!d.collected
    loadComments()
    loadCheckinStatus()
    if (pointList.value.length) await initMiniMap(pointList.value)
  } catch (e) {
    ElMessage.info('路线加载失败，展示示例数据')
    routeInfo.value = mockDetailData
    pointList.value = mockDetailData.points
    likeCount.value = 0
    liked.value = false
    collectCount.value = 0
    collected.value = false
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
//收藏 / 取消收藏（写入 route_favorite，我的收藏页可查到）
const handleCollect = async ()=>{
  try{
    if(collected.value){
      await unfavoriteRouteAPI(routeId.value)
      collected.value = false
      collectCount.value = Math.max(0, collectCount.value - 1)
      ElMessage.success("已取消收藏")
    }else{
      const favRes = await favoriteRouteAPI(routeId.value)
      collected.value = true
      collectCount.value += 1
      ElMessage.success("收藏成功")
      showAchievementIfAny(favRes)
    }
  }catch(e){
    ElMessage.warning("请先登录后再收藏")
  }
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
      const likeRes = await likeRouteAPI(routeId.value)
      liked.value = true
      likeCount.value += 1
      ElMessage.success("点赞成功")
      showAchievementIfAny(likeRes)
    }
  }catch(e){
    ElMessage.warning("请先登录后再点赞")
  }
}
const startReply = (comment) => {
  replyingTo.value = comment
  replyText.value = `@${comment.nickname || '用户'} `
  replyVisible.value = true
  nextTick(() => replyInputRef.value?.focus?.())
}

const cancelReply = () => {
  replyingTo.value = null
  replyText.value = ""
  replyVisible.value = false
}

const toggleCommentLike = async (comment) => {
  try {
    const res = await toggleCommentLikeAPI(comment.id)
    const data = res && res.data ? res.data : {}
    comment.liked = !!data.liked
    comment.likeCount = data.likeCount ?? 0
  } catch (e) {
    ElMessage.warning('请先登录后再点赞评论')
  }
}

const removeComment = async (comment) => {
  try {
    await deleteCommentAPI(comment.id)
    ElMessage.success('评论已删除')
    loadComments()
  } catch (e) {
    ElMessage.warning('删除失败，仅路线发布者或本人可删除')
  }
}

//提交评论/回复
const submitComment = async () => {
  const content = replyingTo.value ? replyText.value.trim() : commentText.value.trim()
  if (!content) {
    ElMessage.warning('请先写点内容')
    return
  }
  try {
    const payload = {
      routeId: routeId.value,
      content
    }
    if (replyingTo.value) {
      payload.parentId = replyingTo.value.id
      payload.replyToUserId = replyingTo.value.userId
    }
    const res = await addRouteCommentAPI(payload)
    if (res.code !== 200) throw new Error(res.msg || '评论失败')
    ElMessage.success(replyingTo.value ? '回复成功' : '评论成功')
    showAchievementIfAny(res)
    if (replyingTo.value) {
      cancelReply()
    } else {
      commentText.value = ''
    }
    loadComments()
  } catch (e) {
    ElMessage.warning('评论失败，请确认已登录')
  }
}

// 点赞 / 取消点赞评论
const toggleLike = async (comment, root) => {
  if (!localStorage.getItem('token')) {
    ElMessage.warning('请先登录后再点赞')
    return
  }
  try {
    const res = await toggleCommentLikeAPI(comment.id)
    if (res.code === 200 && res.data) {
      comment.liked = !!res.data.liked
      comment.likeCount = res.data.likeCount ?? 0
    }
  } catch (e) {
    ElMessage.warning('点赞失败，请确认已登录')
  }
}

// 删除评论（仅路线发布者或本人，后端二次校验）
const removeComment = async (comment, root) => {
  try {
    await ElMessageBox.confirm('确定删除这条评论吗？', '提示', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' })
  } catch {
    return
  }
  try {
    const res = await deleteRouteCommentAPI(comment.id)
    if (res.code !== 200) throw new Error(res.msg || '删除失败')
    ElMessage.success('评论已删除')
    if (root) {
      root.children = (root.children || []).filter(r => r.id !== comment.id)
    } else {
      commentList.value = commentList.value.filter(c => c.id !== comment.id)
    }
  } catch (e) {
    ElMessage.warning(e.response?.data?.msg || '删除失败，仅路线发布者可删除该评论')
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
  max-height:46vh;
  overflow:hidden;
  background:#e9ecef;
}
.img-box .route-img{
  display:block;
  width:100%;
  height:auto;
  max-height:46vh;
  object-fit:contain;
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
  display:flex;
  align-items:center;
  gap:8px;
  font-size:13px;
  color:#888;
  margin:6px 0;
}
.author.clickable{
  cursor:pointer;
}
.author-avatar{
  width:28px;
  height:28px;
  border-radius:50%;
  object-fit:cover;
  background:#f4f5f7;
}
.author-name{
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
/* 点赞条 */
.like-bar{
  display:flex;
  justify-content:flex-end;
  align-items:center;
  gap:10px;
  margin:8px 0 4px;
}
.collect-btn{
  background:#fffbe6 !important;
  border-color:#ffe58f !important;
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
.collect-btn.liked{
  background:#fff1b8 !important;
  border-color:#e8a33a !important;
  color:#b8770f !important;
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
  height:auto;
  max-height:200px;
  object-fit:contain;
  background:#f4f5f7;
  border-radius:6px;
  display:block;
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
.c-count{
  font-size:13px;
  color:#999;
  font-weight:normal;
}
.reply-hint{
  display:flex;
  align-items:center;
  gap:8px;
  margin:8px 0;
  padding:6px 10px;
  background:#fff3ec;
  border-radius:8px;
  font-size:13px;
  color:#ff6b35;
}
.reply-to-name{
  font-weight:600;
}
.reply-cancel{
  margin-left:auto;
  color:#999;
  cursor:pointer;
}
.c-input-row{
  display:flex;
  align-items:center;
  gap:8px;
}
.c-input-box{
  flex:1;
  position:relative;
}
.c-input-box :deep(.el-input__inner){
  padding-right:32px;
}
.clear-input{
  position:absolute;
  right:10px;
  top:50%;
  transform:translateY(-50%);
  width:20px;
  height:20px;
  line-height:18px;
  text-align:center;
  border-radius:50%;
  background:#e5e7eb;
  color:#fff;
  font-size:14px;
  cursor:pointer;
  user-select:none;
}
.clear-input:active{
  background:#d1d5db;
}
.emoji-btn{
  font-size:22px;
  cursor:pointer;
  user-select:none;
  line-height:1;
  padding:4px;
  border-radius:8px;
}
.emoji-btn.on{
  background:#fff3ec;
}
.emoji-panel{
  margin-top:8px;
  padding:10px;
  background:#f7f8fa;
  border-radius:10px;
  display:grid;
  grid-template-columns:repeat(8, 1fr);
  gap:6px;
  max-height:180px;
  overflow-y:auto;
}
.emoji-item{
  font-size:20px;
  text-align:center;
  cursor:pointer;
  padding:4px 0;
  border-radius:6px;
}
.emoji-item:active{
  background:#e5e7eb;
}
.c-submit{
  margin:8px 0;
  background-color:#ff6b35;
  border-color:#ff6b35;
}
.comment-item{
  padding:10px 0;
  border-bottom:1px solid #eee;
}
.c-head{
  display:flex;
  align-items:center;
  gap:8px;
  cursor:pointer;
}
.c-avatar{
  width:28px;
  height:28px;
  border-radius:50%;
  object-fit:cover;
  background:#f4f5f7;
}
.c-user{
  font-size:13px;
  color:#409eff;
}
.c-content{
  font-size:14px;
  margin-top:2px;
  word-break:break-word;
}
.c-actions{
  display:flex;
  align-items:center;
  gap:16px;
  margin-top:6px;
}
.c-action{
  font-size:12px;
  color:#999;
  cursor:pointer;
}
.c-action.active{
  color:#ff6b35;
}
.c-action.danger{
  color:#f56c6c;
}
.reply-list{
  margin:8px 0 0 36px;
  padding:8px 10px;
  background:#f7f8fa;
  border-radius:10px;
  display:flex;
  flex-direction:column;
  gap:10px;
}
.reply-item{
  display:flex;
  gap:8px;
}
.r-avatar{
  width:24px;
  height:24px;
  border-radius:50%;
  object-fit:cover;
  background:#f4f5f7;
  flex:none;
}
.r-body{
  flex:1;
  min-width:0;
}
.r-head{
  display:flex;
  align-items:center;
  gap:8px;
}
.r-to{
  font-size:12px;
  color:#999;
}
.c-time{
  font-size:12px;
  color:#999;
  margin-top:3px;
}
.c-empty{
  font-size:13px;
  color:#999;
  padding:10px 0;
}
.reply-sheet{
  position:fixed;
  left:0;
  right:0;
  bottom:0;
  z-index:1000;
  background:#fff;
  border-radius:18px 18px 0 0;
  box-shadow:0 -6px 24px rgba(0,0,0,0.12);
  padding:14px 14px calc(14px + env(safe-area-inset-bottom));
}
.reply-quote{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:10px;
  background:#f7f8fa;
  border-radius:10px;
  padding:10px 12px;
  margin-bottom:10px;
}
.reply-quote-main{
  min-width:0;
}
.reply-quote-user{
  display:block;
  font-size:13px;
  font-weight:600;
  color:#333;
  margin-bottom:4px;
}
.reply-quote-content{
  display:block;
  font-size:14px;
  color:#555;
  line-height:1.5;
}
.reply-close{
  flex-shrink:0;
  font-size:13px;
  color:#999;
  cursor:pointer;
}
.reply-input-row{
  display:flex;
  align-items:flex-end;
  gap:10px;
}
.reply-input-row .el-textarea{
  flex:1;
}
.reply-send{
  flex-shrink:0;
}
.c-actions{
  display:flex;
  align-items:center;
  gap:14px;
  margin-top:6px;
  font-size:12px;
  color:#888;
}
.c-action{
  cursor:pointer;
}
.c-action.liked{
  color:#e65b38;
}
.c-action.delete{
  color:#999;
}
.c-action.delete:active{
  color:#e65b38;
}
.reply-list{
  margin-left:34px;
  border-left:1px solid #f0f0f0;
  padding-left:10px;
}
.reply-item{
  border-bottom:none;
}
.reply-to{
  font-size:12px;
  color:#999;
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
