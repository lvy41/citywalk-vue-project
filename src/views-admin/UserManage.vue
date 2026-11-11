<template>
  <div class="manage-page">
    <div class="page-header">
      <h2>👥 用户管理</h2>
      <span class="sub-title">管理平台所有注册用户</span>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input v-model="searchKey" placeholder="搜索用户名或手机号..." clearable style="width: 300px;" />
      <el-button type="primary" class="dopa-btn" @click="loadData">查询</el-button>
    </div>

    <!-- 表格卡片 -->
    <div class="dopa-card">
      <el-table :data="filteredData" style="width: 100%" stripe>
        <el-table-column prop="id" label="用户ID" width="80" align="center" />
        <el-table-column prop="username" label="用户名" align="center">
          <template #default="scope">
            <span class="user-account">{{ scope.row.username }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" align="center">
          <template #default="scope">
            <span class="user-nick">{{ scope.row.nickname || '未设置' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" align="center">
          <template #default="scope">
            {{ scope.row.phone || '未填写' }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" align="center" width="180">
          <template #default="scope">
            <span class="time-text">{{ formatTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="scope">
            <el-popconfirm title="确定要封禁并删除该用户吗？" @confirm="delUser(scope.row.id)">
              <template #reference>
                <el-button type="danger" round size="small" class="dopa-btn-danger">封禁删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const searchKey = ref('')
const tableData = ref([])

// 加载数据 (核心修正：去掉 /api，直接请求全量)
const loadData = async () => {
  try {
    const res = await request.get('/admin/user/list')
    if (res) {
      tableData.value = res
    }
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  }
}

// 前端本地搜索过滤
const filteredData = computed(() => {
  if (!searchKey.value) return tableData.value
  return tableData.value.filter(item => 
    item.username.includes(searchKey.value) || 
    (item.phone && item.phone.includes(searchKey.value))
  )
})

// 删除用户
const delUser = async (id) => {
  try {
    await request.delete(`/admin/user/delete/${id}`)
    ElMessage.success('用户已封禁删除')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 格式化时间
const formatTime = (timeStr) => timeStr ? timeStr.replace('T', ' ').substring(0, 19) : ''

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
.user-account { font-weight: bold; color: #409EFF; background: #ECF5FF; padding: 4px 10px; border-radius: 8px; }
.user-nick { color: #67C23A; font-weight: 500; }
.time-text { color: #909399; font-size: 13px; }
.dopa-btn-danger { background: linear-gradient(to right, #FF9A44, #FC6076); border: none; font-weight: bold; }
</style>