<template>
  <div class="page-my-like">
    <div class="header">
      <el-button text @click="$router.back()">← 返回</el-button>
      <h2>我的点赞</h2>
    </div>

    <div class="list-wrap">
      <div v-if="likeList.length ===0" class="empty">暂无点赞路线</div>
      <div v-for="item in likeList" :key="item.id" class="route-card" @click="goDetail(item.id)">
        <div class="title">{{ item.title }}</div>
        <div class="desc">{{ item.desc }}</div>
      </div>
    </div>

    <div class="tab-bottom">
      <TabBar />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import TabBar from "@/components/TabBar.vue";
// import { getUserLikeListAPI } from "@/api/route";

const router = useRouter();
const likeList = ref([]);

const loadData = async ()=>{
  // const res = await getUserLikeListAPI()
  // likeList.value = res.data

  //模拟假数据
  likeList.value = [
    {id:101,title:"博物馆人文路线",desc:"打卡城市博物馆，感受历史文化"},
    {id:102,title:"公园短途徒步",desc:"周末休闲散步好去处"}
  ]
}

//跳转到路线详情
const goDetail = (id)=>{
  router.push(`/detail/${id}`)
}

onMounted(()=>{
  loadData()
})
</script>

<style scoped>
.page-my-like {
  min-height:100vh;
  background:#f8f8f8;
  padding-bottom:70px;
}
.header{
  display:flex;
  align-items:center;
  gap:12px;
  padding:16px;
  background:#fff;
}
h2{
  margin:0;
  font-size:18px;
}
.list-wrap{
  padding:16px;
}
.empty{
  text-align:center;
  color:#999;
  padding:40px 0;
}
.route-card{
  background:#fff;
  border-radius:12px;
  padding:16px;
  margin-bottom:12px;
  cursor:pointer;
}
.title{
  font-size:16px;
  font-weight:bold;
  margin-bottom:6px;
}
.desc{
  font-size:14px;
  color:#666;
}
.tab-bottom{
  position:fixed;
  left:0;
  bottom:0;
  width:100%;
}
</style>
