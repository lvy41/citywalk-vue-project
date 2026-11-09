<template>
  <div class="detail-page">
    <!-- 返回按钮：统一样式 ＜ 返回，回退上一页 -->
    <div class="back-btn" @click="$router.back()">＜ 返回</div>
    <div class="img-box">
      <img class="route-img" :src="info.cover" alt="" />
    </div>
    <h2 class="title">{{ info.name }}</h2>
    <div class="meta">{{ info.city }} · {{ info.duration }}</div>
    <div class="tags">
      <span v-for="t in info.tags" :key="t">{{ t }}</span>
    </div>
    <div class="stat">
      <button class="like-btn" :class="{active:info.isLiked}" @click="routeStore.toggleLike(info)">
        {{ info.isLiked ? '❤️' : '🤍' }} 点赞 {{ info.likeNum }}
      </button>
      <button class="collect-btn" :class="{active:info.isCollected}" @click="routeStore.toggleCollect(info)">
        {{ info.isCollected ? '⭐' : '☆' }} 收藏 {{ info.starNum }}
      </button>
    </div>
    <div class="desc">
      <h4>路线介绍</h4>
      <p>{{ info.description }}</p>
    </div>
  </div>
</template>
<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useRouteStore } from '@/store/routeStore'
const route = useRoute()
const router = useRouter()
const routeStore = useRouteStore()
// 根据id找到对应路线
const info = computed(()=>{
  const findId = Number(route.params.id)
  return routeStore.routeList.find(item => item.id === findId)
})
</script>
<style scoped>
.detail-page {
  padding: 16px;
  background: linear-gradient(180deg, #ffdfd0, #fff7f0);
  min-height: 100vh;
  box-sizing: border-box;
}
.back-btn {
  color: #ff6b35;
  cursor: pointer;
  margin-bottom: 14px;
  font-size: 17px;
  font-weight: 500;
}
.img-box {
  width: 100%;
  max-width: 700px;
  margin: 0 auto 16px;
  border-radius: 14px;
  overflow: hidden;
}
.route-img {
  width: 100%;
  height: auto;
  max-height: 480px;
  object-fit: cover;
}
.title {
  font-size: 22px;
  margin: 8px 0 6px;
  font-weight: bold;
}
.meta {
  font-size: 15px;
  color: #666;
  margin-bottom: 12px;
}
.tags {
  margin-bottom: 16px;
}
.tags span {
  background: #f2d9cb;
  color: #c26a3b;
  padding: 4px 10px;
  border-radius: 6px;
  margin-right: 6px;
  font-size: 14px;
}
.stat {
  margin-bottom: 20px;
}
.like-btn, .collect-btn {
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  background: #ffd8c4;
  color: #333;
  margin-right: 10px;
  font-size: 15px;
  cursor: pointer;
}
.like-btn.active {
  background:#f56c6c;
  color:white;
}
.collect-btn.active {
  background:#e6a23c;
  color:white;
}
.desc h4{
  font-size:17px;
  margin-bottom:8px;
  color:#222;
}
.desc p {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  text-align:justify;
}
</style>
