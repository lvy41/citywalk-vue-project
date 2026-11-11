<template>
  <div class="manage-page">
    <div class="page-header">
      <h2>💬 评论管理</h2>
      <span class="sub-title">审核用户互动，清理不良违规评论</span>
    </div>

    <!-- 表格卡片 -->
    <div class="dopa-card">
      <el-table :data="commentList" style="width: 100%" stripe>
        <el-table-column prop="id" label="评论ID" width="80" align="center" />
        <el-table-column prop="routeId" label="所属路线ID" align="center">
          <template #default="scope">
            <el-tag type="warning" round>路线 {{ scope.row.routeId }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="userId" label="评论人ID" align="center">
          <template #default="scope">
            <el-tag type="info" round>用户 {{ scope.row.userId }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评论内容" show-overflow-tooltip />
        <el-table-column prop="createTime" label="评论时间" align="center" width="180">
          <template #default="scope">
            <span class="time-text">{{ formatTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="scope">
            <el-popconfirm title="确定要删除这条评论吗？" @confirm="delComment(scope.row.id)">
              <template #reference>
                <el-button type="danger" round size="small" class="dopa-btn-danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const commentList = ref([])

// 加载数据（核心修正：路径去掉 /api）
const loadData = async () => {
  try {
    const res = await request.get('/admin/comment/list')
    if (res && res.code === 200) {
      commentList.value = Array.isArray(res.data) ? res.data : []
    }
  } catch (error) {
    ElMessage.error('获取评论列表失败')
  }
}

// 删除评论
const delComment = async (id) => {
  try {
    const res = await request.delete(`/admin/comment/delete/${id}`)
    ElMessage.success('评论已删除')
    loadData() // 刷新列表
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
.manage-page { padding: 24px; background: #F7F8FA; min-height: calc(100vh - 60px); }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px 0; font-size: 24px; color: #303133; font-weight: 800; }
.sub-title { font-size: 14px; color: #909399; }

.dopa-card {
  background: #fff; border-radius: 20px; padding: 20px;
  box-shadow: 0 8px 24px rgba(255, 154, 68, 0.08); border: 1px solid #FFF0F3;
}
:deep(.el-table th.el-table__cell) {
  background-color: #FFF9F0 !important; color: #E6A23C; font-weight: bold; border-bottom: none;
}
:deep(.el-table) { border-radius: 12px; overflow: hidden; }
.time-text { color: #909399; font-size: 13px; }
.dopa-btn-danger {
  background: linear-gradient(to right, #FF9A44, #FC6076); border: none; font-weight: bold;
}
</style>