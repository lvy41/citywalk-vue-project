<template>
<div class="page-wrap">
  <h3>平台数据仪表盘</h3>
  <div class="card-row">
    <el-card class="stat-card">
      <div class="num">{{stat.userCount}}</div>
      <div class="title">总注册用户</div>
    </el-card>
    <el-card class="stat-card">
      <div class="num">{{stat.routeCount}}</div>
      <div class="title">路线总数量</div>
    </el-card>
    <el-card class="stat-card">
      <div class="num">{{stat.commentCount}}</div>
      <div class="title">评论总数</div>
    </el-card>
  </div>

  <el-card style="margin-top:16px;">
    <div ref="chartRef" style="width:100%;height:360px;"></div>
  </el-card>
</div>
</template>

<script setup>
import {ref,onMounted} from 'vue'
import * as echarts from 'echarts'
import request from '@/utils/request'

const chartRef = ref(null)
const stat = ref({
  userCount:0,
  routeCount:0,
  commentCount:0
})

async function loadDashboard(){
  const res = await request.get("/api/admin/dashboard")
  if(res.code===200){
    stat.value = res.data
    renderChart(res.data.chartData)
  }
}

const renderChart = (chartData)=>{
  const myChart = echarts.init(chartRef.value)
  const option = {
    title:{text:"平台月度数据统计"},
    xAxis:{type:"category",data:chartData?.x || []},
    yAxis:{type:"value"},
    series:[
      {name:"新增用户",type:"bar",data:chartData?.user || []},
      {name:"新增路线",type:"bar",data:chartData?.route || []}
    ]
  }
  myChart.setOption(option)
}

onMounted(()=>{
  loadDashboard()
})
</script>

<style scoped>
.page-wrap{padding:16px;}
.card-row{display:flex;gap:14px;}
.stat-card{flex:1;text-align:center;}
.num{font-size:32px;font-weight:bold;color:#409eff;margin-bottom:8px;}
.title{color:#666;}
</style>
