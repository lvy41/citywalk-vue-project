<template>
  <div class="manage-page">
    <div class="page-header">
      <h2>🚶 路线管理</h2>
      <span class="sub-title">查看并管理所有用户发布的 CityWalk 路线</span>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input v-model="searchKey" placeholder="搜索路线名称或城市..." clearable style="width: 300px;" />
      <el-button type="primary" class="dopa-btn" @click="loadData">查询</el-button>
    </div>

    <!-- 表格卡片 -->
    <div class="dopa-card">
      <el-table :data="filteredData" style="width: 100%" stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="routeName" label="路线名称" align="center">
          <template #default="scope">
            <span class="route-name">{{ scope.row.routeName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="city" label="所属城市" align="center">
          <template #default="scope">
            <el-tag type="warning" round>{{ scope.row.city }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publisherName" label="发布者" align="center" width="130">
          <template #default="scope">
            {{ scope.row.publisherName || ('用户#' + scope.row.userId) }}
          </template>
        </el-table-column>
        <el-table-column prop="auditStatus" label="状态" align="center" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.auditStatus === 0" type="info" round>待审核</el-tag>
            <el-tag v-if="scope.row.auditStatus === 1" type="success" round>已上线</el-tag>
            <el-tag v-if="scope.row.auditStatus === 2" type="danger" round>已下架</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" align="center">
          <template #default="scope">
            <el-button link type="primary" @click="openDetail(scope.row)">查看</el-button>
            <el-button
              v-if="scope.row.auditStatus !== 1"
              link
              type="success"
              @click="auditRoute(scope.row.id, 1)"
            >通过</el-button>
            <el-button
              v-if="scope.row.auditStatus === 1"
              link
              type="warning"
              @click="auditRoute(scope.row.id, 2)"
            >下架</el-button>
            <el-popconfirm title="确定要删除这条路线吗？" @confirm="delRoute(scope.row.id)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="路线详情数据" width="60%">
      <pre style="background:#F5F7FA; padding:15px; border-radius:8px; color:#333;">{{ JSON.stringify(curRow, null, 2) }}</pre>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const searchKey = ref('')
const tableData = ref([])
const detailVisible = ref(false)
const curRow = ref({})

// 加载数据 (核心修正：路径去掉了 /api，直接匹配你的后端接口)
const loadData = async () => {
  try {
    // ✅ 正确路径：request.js 里已经配了 /api 前缀
    const res = await request.get('/admin/route/list')
    tableData.value = res && Array.isArray(res.data) ? res.data : []
  } catch (error) {
    ElMessage.error('获取路线列表失败')
  }
}

// 前端本地搜索过滤（因为后端接口比较简单，直接前端过滤）
const filteredData = computed(() => {
  if (!searchKey.value) return tableData.value
  return tableData.value.filter(item =>
    (item.routeName || '').includes(searchKey.value) ||
    (item.city || '').includes(searchKey.value) ||
    (item.publisherName || '').includes(searchKey.value)
  )
})

const openDetail = (row) => {
  curRow.value = row
  detailVisible.value = true
}

// 审核：1=通过上线，2=下架
const auditRoute = async (id, status) => {
  try {
    const res = await request.put(`/admin/route/audit/${id}/${status}`)
    ElMessage.success(res?.data || res?.msg || (status === 1 ? '已通过' : '已下架'))
    loadData()
  } catch (error) {
    ElMessage.error('审核失败')
  }
}

// 删除路线 (核心修正：路径去掉了 /api)
const delRoute = async (id) => {
  try {
    const res = await request.delete(`/admin/route/delete/${id}`) // ✅ 对应后端 @DeleteMapping("/route/delete/{id}")
    ElMessage.success('路线已删除')
    loadData() // 刷新列表
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* 多巴胺风格 */
.manage-page { padding: 24px; background: #F7F8FA; min-height: calc(100vh - 60px); }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px 0; font-size: 24px; color: #303133; font-weight: 800; }
.sub-title { font-size: 14px; color: #909399; }

.search-bar { margin-bottom: 20px; display: flex; gap: 10px; }
.dopa-btn {
  background: linear-gradient(to right, #FF9A44, #FC6076);
  border: none;
  font-weight: bold;
  color: white;
  box-shadow: 0 4px 10px rgba(252, 96, 118, 0.3);
}

.dopa-card {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(255, 154, 68, 0.08);
  border: 1px solid #FFF0F3;
}
:deep(.el-table th.el-table__cell) {
  background-color: #FFF9F0 !important;
  color: #E6A23C;
  font-weight: bold;
  border-bottom: none;
}
:deep(.el-table) { border-radius: 12px; overflow: hidden; }
.route-name { font-weight: bold; color: #303133; }
</style>