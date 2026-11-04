<template>
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
  </div>
</template>

<script setup>
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
.tab-bar{
  position:fixed;
  bottom:0;
  left:0;
  width:100%;
  height:60px;
  background:#fff;
  display:flex;
  border-top:1px solid #eee;
  z-index:99;
}
.tab-item{
  flex:1;
  display:flex;
  justify-content:center;
  align-items:center;
  font-size:14px;
  color:#666;
}
.tab-item.active{
  color:#409eff;
}
.blank-bottom{
  height:70px;
}
</style>
