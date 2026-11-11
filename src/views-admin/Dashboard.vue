<template>
  <div class="dashboard-page">
    <!-- 头部 -->
    <div class="page-header">
      <h2>📊 平台数据仪表盘</h2>
      <span class="sub-title">CityWalk 城市漫步运营数据总览</span>
    </div>

    <!-- 顶部三个标准统计卡片 -->
    <div class="stats-row">
      <div class="stat-card border-pink">
        <div class="card-icon">👥</div>
        <div class="card-info">
          <div class="card-title">总注册用户</div>
          <div class="card-num">{{ stat.userCount }}</div>
        </div>
      </div>
      
      <div class="stat-card border-orange">
        <div class="card-icon">🚶</div>
        <div class="card-info">
          <div class="card-title">路线总数量</div>
          <div class="card-num">{{ stat.routeCount }}</div>
        </div>
      </div>
      
      <div class="stat-card border-green">
        <div class="card-icon">💬</div>
        <div class="card-info">
          <div class="card-title">评论总数</div>
          <div class="card-num">{{ stat.commentCount }}</div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-card">
      <div class="chart-header">
        <h3>平台数据趋势</h3>
      </div>
      <div ref="chartRef" style="width: 100%; height: 400px;"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import request from '@/utils/request'

const chartRef = ref(null)
let myChart = null

// 统计数据
const stat = ref({
  userCount: 0,
  routeCount: 0,
  commentCount: 0
})

// 加载数据
const loadDashboard = async () => {
  try {
    const res = await request.get('/admin/dashboard/stats')
    if (res) {
      stat.value = res
      // 数据拉取成功后，渲染图表
      renderChart() 
    }
  } catch (error) {
    console.error('获取数据失败', error)
  }
}

// 渲染多巴胺风格图表
const renderChart = () => {
  if (!chartRef.value) return
  if (myChart) myChart.dispose()
  myChart = echarts.init(chartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['新增用户', '新增路线'],
      bottom: 0,
      textStyle: { color: '#666', fontWeight: 'bold' }
    },
    grid: {
      left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['第1周', '第2周', '第3周', '第4周'],
      axisLabel: { color: '#909399', fontWeight: 'bold' },
      axisLine: { lineStyle: { color: '#DCDFE6' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#909399' },
      splitLine: { lineStyle: { type: 'dashed', color: '#F2F6FC' } }
    },
    series: [
      {
        name: '新增用户',
        type: 'bar',
        barWidth: '20%',
        itemStyle: {
          // 渐变色：蜜桃粉到活力橙
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#FC6076' },
            { offset: 1, color: '#FF9A44' }
          ]),
          borderRadius: [10, 10, 0, 0]
        },
        data: [4, 1, 0, 2] // 暂时用假数据演示
      },
      {
        name: '新增路线',
        type: 'bar',
        barWidth: '20%',
        itemStyle: {
          // 渐变色：柠檬黄到薄荷绿
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#67C23A' },
            { offset: 1, color: '#E6A23C' }
          ]),
          borderRadius: [10, 10, 0, 0]
        },
        data: [3, 1, 2, 0]
      }
    ]
  }
  myChart.setOption(option)
}

// 窗口大小改变时自适应
const handleResize = () => {
  if (myChart) myChart.resize()
}

onMounted(() => {
  loadDashboard()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (myChart) myChart.dispose()
})
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
  background: #F7F8FA;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 24px;
}
.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #303133;
  font-weight: 900;
  letter-spacing: 1px;
}
.sub-title {
  font-size: 14px;
  color: #909399;
}

/* ======= 标准后台数据卡片 ======= */
.stats-row {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  border-left: 6px solid transparent; /* 预留左侧边框 */
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}

/* 用鲜艳的边框点缀 */
.border-pink { border-left-color: #FC6076; }
.border-orange { border-left-color: #FFA04D; }
.border-green { border-left-color: #56AB2F; }

.card-icon {
  font-size: 40px;
  margin-right: 20px;
  background: #F5F7FA;
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
}

.card-info {
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 14px;
  color: #909399;
  font-weight: 500;
  margin-bottom: 8px;
}

.card-num {
  font-size: 28px;
  font-weight: 900;
  color: #303133;
  line-height: 1;
}

/* ======= 图表卡片 ======= */
.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}
.chart-header h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #303133;
  font-weight: bold;
  border-left: 4px solid #FF7A45;
  padding-left: 10px;
}
</style>