<template>
<div class="page-wrap">
  <h3>评论管理</h3>
  <el-card>
    <el-table :data="tableData" border stripe>
      <el-table-column label="评论ID" prop="id" width="80"></el-table-column>
      <el-table-column label="所属路线ID" prop="routeId"></el-table-column>
      <el-table-column label="评论人" prop="username"></el-table-column>
      <el-table-column label="评论内容" prop="content"></el-table-column>
      <el-table-column label="评论时间" prop="createTime"></el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button link type="danger" @click="delComment(scope.row)">删除评论</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="pageNum"
      v-model:page-size="pageSize"
      :total="total"
      layout="total,prev,pager,next"
      @change="loadData"
    ></el-pagination>
  </el-card>
</div>
</template>

<script setup>
import {ref,onMounted} from 'vue'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

async function loadData(){
  const res = await request.get("/api/admin/comment/list",{
    params:{pageNum:pageNum.value,pageSize:pageSize.value}
  })
  if(res.code===200){
    tableData.value = res.data.records
    total.value = res.data.total
  }
}

const delComment = async(row)=>{
  await ElMessageBox.confirm("确定删除该评论？")
  const res = await request.delete(`/api/admin/comment/${row.id}`)
  if(res.code===200){
    ElMessage.success("删除成功")
    loadData()
  }
}

onMounted(()=>loadData())
</script>

<style scoped>
.page-wrap{padding:16px;}
</style>
