<template>
  <div class="page-message">
    <div class="header">
      <el-button text @click="$router.back()">← 返回</el-button>
      <h2>消息通知</h2>
    </div>

    <div class="list-wrap">
      <div v-if="msgList.length===0" class="empty">暂无消息</div>
      <div v-for="item in msgList" :key="item.id" class="msg-item">
        <div class="title">{{ item.title }}</div>
        <div class="time">{{ item.time }}</div>
      </div>
    </div>

    <div class="tab-bottom">
      <TabBar />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import TabBar from "@/components/TabBar.vue";

const msgList = ref([])

const loadMsg = ()=>{
  //模拟消息
  msgList.value = [
    {id:1,title:"用户点赞了你的路线",time:"2026‑10‑01 12:30"},
    {id:2,title:"用户评论了你的路线",time:"2026‑10‑02 09:10"}
  ]
}

onMounted(()=>{
  loadMsg()
})
</script>

<style scoped>
.page-message{
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
.msg-item{
  background:#fff;
  padding:14px 16px;
  border-radius:10px;
  margin-bottom:10px;
}
.title{
  font-size:15px;
}
.time{
  font-size:12px;
  color:#999;
  margin-top:4px;
}
.tab-bottom{
  position:fixed;
  left:0;
  bottom:0;
  width:100%;
}
</style>
