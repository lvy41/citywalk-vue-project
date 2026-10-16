<template>
<div class="page-wrap">
  <h3>平台用户管理</h3>
  <el-card>
    <div class="search-bar">
      <el-input v-model="searchKey" placeholder="用户名搜索" style="width:260px"></el-input>
      <el-button type="primary" @click="loadData">查询</el-button>
    </div>
    <el-table :data="tableData" border stripe>
      <el-table-column label="用户ID" prop="id" width="90"></el-table-column>
      <el-table-column label="用户名" prop="username"></el-table-column>
      <el-table-column label="手机号" prop="phone"></el-table-column>
      <el-table-column label="账号状态" prop="status">
        <template #default="scope">
          <el-tag :type="scope.row.status===1?'success':'danger'">
            {{scope.row.status===1?"正常":"禁用"}}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="注册时间" prop="createTime"></el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button link v-if="scope.row.status===1" type="warning" @click="banUser(scope.row)">禁用账号</el-button>
          <el-button link v‑else type="primary" @click="unBanUser(scope.row)">启用账号</el-button>
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

const searchKey = ref("")
const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

async function loadData(){
  const res = await request.get("/api/admin/user/list",{
    params:{pageNum:pageNum.value,pageSize:pageSize.value,keyword:searchKey.value}
  })
  if(res.code===200){
    tableData.value = res.data.records
    total.value = res.data.total
  }
}

//禁用用户
const banUser = async(row)=>{
  await ElMessageBox.confirm("确认禁用该用户账号？")
  const res = await request.put("/api/admin/user/status",{id:row.id,status:0})
  if(res.code===200){
    ElMessage.success("账号已禁用")
    loadData()
  }
}

//启用用户
const unBanUser = async(row)=>{
  await ElMessageBox.confirm("确认启用该用户账号？")
  const res = await request.put("/api/admin/user/status",{id:row.id,status:1})
  if(res.code===200){
    ElMessage.success("账号已启用")
    loadData()
  }
}

onMounted(()=>loadData())
</script>

<style scoped>
.page-wrap{padding:16px;}
.search-bar{margin-bottom:14px;display:flex;gap:10px;align-items:center;}
</style>
