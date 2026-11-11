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

      <div class="stat-card border-purple clickable" @click="goPendingRoutes">
        <div class="card-icon">🕓</div>
        <div class="card-info">
          <div class="card-title">待审核路线</div>
          <div class="card-num">{{ stat.pendingCount }}</div>
        </div>
        <div class="card-link">去审核 ›</div>
      </div>
      
      <div class="stat-card border-green">
        <div class="card-icon">💬</div>
        <div class="card-info">
          <div class="card-title">评论总数</div>
          <div class="card-num">{{ stat.commentCount }}</div>
        </div>
      </div>
    </div>

    <!-- 审核状态概览（真实统计） -->
    <div class="status-row">
      <span class="status-pill">已上线 {{ stat.onlineCount }}</span>
      <span class="status-pill warning clickable" @click="goPendingRoutes">待审核 {{ stat.pendingCount }}</span>
      <span class="status-pill muted">已下架 {{ stat.offlineCount }}</span>
    </div>

    <!-- 图表区域 -->
    <div class="chart-card">
      <div class="chart-header">
        <h3>各城市路线数量 Top 8</h3>
      </div>
      <div ref="chartRef" style="width: 100%; height: 400px;"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import request from '@/utils/request'

const router = useRouter()

// 跳到路线管理并只看待审核
const goPendingRoutes = () => {
  router.push({ path: '/admin/routeManage', query: { status: '0' } })
}

const chartRef = ref(null)
let myChart = null

// 统计数据
const stat = ref({
  userCount: 0,
  routeCount: 0,
  commentCount: 0,
  pendingCount: 0,
  onlineCount: 0,
  offlineCount: 0,
  cityTop: []
})

// 加载数据
const loadDashboard = async () => {
  try {
    const res = await request.get('/admin/dashboard/stats')
    if (res && res.code === 200 && res.data) {
      stat.value = res.data
      // 数据拉取成功后，渲染图表
      renderChart() 
    }
  } catch (error) {
    console.error('获取数据失败', error)
  }
}

// 渲染真实数据的柱状图：各城市路线数量 Top 8
const renderChart = () => {
  if (!chartRef.value) return
  if (myChart) myChart.dispose()
  myChart = echarts.init(chartRef.value)

  const cityTop = Array.isArray(stat.value.cityTop) ? stat.value.cityTop : []
  const cities = cityTop.map(i => i.city)
  const counts = cityTop.map(i => Number(i.cnt) || 0)

  if (!cities.length) {
    myChart.setOption({
      title: {
        text: '暂无城市路线数据',
        left: 'center',
        top: 'center',
        textStyle: { color: '#909399', fontSize: 14, fontWeight: 'normal' }
      }
    })
    return
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => `${params[0].name}：${params[0].value} 条路线`
    },
    grid: {
      left: '3%', right: '4%', bottom: '8%', top: '12%', containLabel: true
    },
    xAxis: {
      type: 'category',
      data: cities,
      axisLabel: { color: '#909399', fontWeight: 'bold', interval: 0 },
      axisLine: { lineStyle: { color: '#DCDFE6' } }
    },
    yAxis: {
      type: 'value',
      name: '路线数',
      axisLabel: { color: '#909399' },
      splitLine: { lineStyle: { type: 'dashed', color: '#F2F6FC' } }
    },
    series: [
      {
        name: '路线数',
        type: 'bar',
        barWidth: '45%',
        itemStyle: {
          // 渐变色：蜜桃粉到活力橙
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#FC6076' },
            { offset: 1, color: '#FF9A44' }
          ]),
          borderRadius: [10, 10, 0, 0]
        },
        label: { show: true, position: 'top', color: '#666' },
        data: counts
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
  flex-wrap: wrap;
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
.border-purple { border-left-color: #9B6BFF; }

.status-row {
  display: flex;
  gap: 12px;
  margin: -8px 0 24px;
}
.status-pill {
  padding: 6px 14px;
  border-radius: 999px;
  background: #F0F9EB;
  color: #529B2E;
  font-size: 13px;
  font-weight: 600;
}
.status-pill.warning {
  background: #FDF6EC;
  color: #B88230;
}
.status-pill.muted {
  background: #F4F4F5;
  color: #909399;
}

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
  white-space: nowrap;
}

.card-num {
  font-size: 28px;
  font-weight: 900;
  color: #303133;
  line-height: 1;
}

/* 待审核卡可点击 */
.clickable { cursor: pointer; }
.card-link {
  margin-left: auto;
  font-size: 13px;
  color: #9B6BFF;
  font-weight: 600;
  white-space: nowrap;
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