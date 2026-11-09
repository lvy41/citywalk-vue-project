<template>
  <div class="city-page">
    <!-- 顶部栏：橙色返回 + 右边定位emoji+城市名称 -->
    <div class="city-header">
      <div class="back-btn" @click="goBack">＜</div>
      <div class="city-title">📍 {{ currentCity }}</div>
    </div>

    <div v-if="loading">
      <div class="loading-tip">加载中...</div>
    </div>
    <div v-else-if="cityRouteList.length > 0">
      <div class="card-wrap">
        <div
          class="route-card"
          v-for="route in cityRouteList"
          :key="route.id"
          @click="$router.push({name:'Detail', params:{id:route.id}})"
        >
          <img class="card-img" :src="route.cover" alt="">
          <div class="card-name">{{ route.name }}</div>
          <div class="card-info">{{ route.duration }}</div>
          <div class="card-tags">
            <span class="tag-small" v-for="t in route.tags" :key="t">{{t}}</span>
          </div>
          <div class="card-stat">
            <span class="like-btn-card" :class="{active:route.isLiked}" @click.stop="routeStore.toggleLike(route)">
              {{ route.isLiked ? '❤️' : '🤍' }} {{ route.likeNum }}
            </span>
            <span class="collect-btn-card" :class="{active:route.isCollected}" @click.stop="routeStore.toggleCollect(route)">
              {{ route.isCollected ? '⭐' : '☆' }} {{ route.starNum }}
            </span>
          </div>
        </div>
      </div>
      <!-- ✅ 新增：有卡片时，底部提示文字 -->
      <div class="has-data-tip">
        更多路线待开发ing，敬请期待
      </div>
    </div>
    <!-- 没有路线才显示这个空提示 -->
    <div v-else class="empty-tip">
      该城市路线持续开发中，敬请期待
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRouteStore } from '@/store/routeStore'
const route = useRoute()
const router = useRouter()
const routeStore = useRouteStore()

const currentCity = ref('')
const loading = ref(true)

watch(() => route.params.cityName, (rawVal) => {
  loading.value = true
  if(rawVal){
    const realCity = decodeURIComponent(rawVal).trim()
    currentCity.value = realCity
    console.log('【解码+trim后城市】', JSON.stringify(currentCity.value))
  }else{
    currentCity.value = ''
  }
  loading.value = false
}, { immediate: true })

const cityRouteList = computed(() => {
  const name = currentCity.value
  console.log('【筛选目标城市】',JSON.stringify(name))
  const res = routeStore.routeList.filter(item => item.city.trim() === name)
  console.log('【筛选得到路线数组】',res)
  return res
})

// 返回逻辑分支
const goBack = () => {
  if (route.query.fromSearch === 'true') {
    router.push({ path: '/home', query: { fromSearch: 'true' } })
  } else {
    router.push('/home')
  }
}
</script>

<style scoped>
.city-page {
  min-height: 100vh;
  background: linear-gradient(180deg,#ffdfd0,#fff7f0);
  padding: 16px;
  box-sizing: border-box;
}
.city-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
.back-btn {
  color: #ff6b35;
  font-size: 20px;
  width: 32px;
  cursor: pointer;
}
.city-title {
  flex: 1;
  text-align: right;
  font-size: 17px;
  color: #333;
}
.card-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap:12px;
}
.route-card {
  background:#fff;
  border-radius:12px;
  overflow:hidden;
  cursor:pointer;
}
.card-img {
  width:100%;
  height:140px;
  object-fit:cover;
}
.card-name {
  padding:6px 8px 2px;
  font-weight:bold;
  font-size:14px;
}
.card-info {
  padding:0 8px;
  font-size:12px;
  color:#666;
}
.card-tags {
  padding:4px 8px;
}
.tag-small {
  font-size:11px;
  background:#ffe9dd;
  color:#d47544;
  padding:2px 5px;
  border-radius:4px;
  margin-right:3px;
}
.card-stat {
  padding:6px 8px 10px;
  display:flex;
  gap:16px;
  font-size:13px;
}
.like-btn-card,.collect-btn-card{
  cursor:pointer;
  color:#777;
}
.like-btn-card.active{
  color:#f56c6c;
}
.collect-btn-card.active{
  color:#e6a23c;
}
.loading-tip{
  text-align:center;
  padding-top:120px;
  font-size:16px;
  color:#666;
}
.empty-tip {
  text-align: center;
  padding-top: 120px;
  font-size: 16px;
  color:#888;
}
/* ✅ 新增样式：有数据时底部提示 */
.has-data-tip {
  text-align: center;
  margin-top: 24px;
  padding:10px 0;
  font-size:15px;
  color:#999;
}
</style>
