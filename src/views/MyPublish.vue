<template>
  <div class="page-my-publish">
    <div class="page-header">
      <el-icon @click="$router.back()" class="back-icon"><ArrowLeft /></el-icon>
      <span class="title">我的发布</span>
    </div>
    <div class="route-list">
      <div class="route-item" v-for="item in publishList" :key="item.id">
        <div class="route-name">{{ item.routeName }}</div>
        <div class="route-desc">{{ item.desc }}</div>
        <div class="action-wrap">
          <el-button size="small" @click="editRoute(item)">编辑</el-button>
          <el-button size="small" type="danger" @click="delRoute(item.id)">删除</el-button>
        </div>
      </div>
    </div>
    <div v-if="publishList.length === 0" class="empty">暂无发布路线</div>
    <!-- 底部tab -->
    <div class="tab-bottom">
      <TabBar />
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import TabBar from '@/components/TabBar.vue'
import { getUserPublishRouteAPI } from '@/api/route'

const publishList = ref([])
// 获取我的发布路线
const getList = async () => {
  const res = await getUserPublishRouteAPI()
  publishList.value = res.data || []
}
// 编辑路线
const editRoute = (row) => {
  // 跳转到路线编辑页，你后续可以自己补编辑页面
  console.log('编辑', row)
}
// 删除路线
const delRoute = (id) => {
  console.log('删除id', id)
}
onMounted(()=>{
  getList()
})
</script>
<style scoped>
.page-my-publish{
  background:#f5f5f7;
  min-height:100vh;
  padding-bottom:70px;
}
.page-header{
  display:flex;
  align-items:center;
  padding:16px;
  background:#fff;
  font-size:18px;
  font-weight:600;
}
.back-icon{
  font-size:22px;
  margin-right:12px;
  cursor:pointer;
}
.route-list{
  padding:16px;
}
.route-item{
  background:#fff;
  border-radius:12px;
  padding:16px;
  margin-bottom:12px;
}
.route-name{
  font-size:16px;
  font-weight:500;
}
.route-desc{
  font-size:13px;
  color:#666;
  margin:6px 0;
}
.action-wrap{
  display:flex;
  gap:8px;
  margin-top:8px;
}
.empty{
  text-align:center;
  padding:40px;
  color:#999;
}
.tab-bottom {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
}
</style>
