<template>
<div class="page-wrap">
  <h3>路线管理</h3>
  <el-card>
    <div class="search-bar">
      <el-input v-model="searchKey" placeholder="路线名称搜索" style="width:260px"></el-input>
      <el-button type="primary" @click="loadData">查询</el-button>
    </div>
    <el-table :data="tableData" border stripe>
      <el-table-column label="ID" prop="id" width="80"></el-table-column>
      <el-table-column label="路线名称" prop="routeName"></el-table-column>
      <el-table-column label="所属城市" prop="city"></el-table-column>
      <el-table-column label="创作者" prop="creatorName"></el-table-column>
      <el-table-column label="状态" prop="status">
        <template #default="scope">
          <el-tag v-if="scope.row.status===0">待审核</el-tag>
          <el-tag v-if="scope.row.status===1" type="success">已上线</el-tag>
          <el-tag v-if="scope.row.status===2" type="danger">已下架</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button link type="primary" @click="openDetail(scope.row)">查看详情</el-button>
          <el-button link v-if="scope.row.status===0" @click="auditPass(scope.row)">审核通过</el-button>
          <el-button link type="warning" @click="offlineRoute(scope.row)">下架</el-button>
          <el-button link type="danger" @click="delRoute(scope.row)">删除</el-button>
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

  <!--详情弹窗-->
  <el-dialog v-model="detailVisible" title="路线详情">
    <pre>{{JSON.stringify(curRow,null,2)}}</pre>
  </el-dialog>
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
const detailVisible = ref(false)
const curRow = ref({})

//加载路线列表
async function loadData(){
  const res = await request.get("/api/admin/route/list",{
    params:{pageNum:pageNum.value,pageSize:pageSize.value,keyword:searchKey.value}
  })
  if(res.code===200){
    tableData.value = res.data.records
    total.value = res.data.total
  }
}

const openDetail = (row)=>{
  curRow.value = row
  detailVisible.value=true
}

//审核通过
const auditPass = async(row)=>{
  await ElMessageBox.confirm("确认审核通过该路线？")
  const res = await request.put("/api/admin/route/audit",{id:row.id,status:1})
  if(res.code===200){
    ElMessage.success("审核完成")
    loadData()
  }
}

//下架路线
const offlineRoute = async(row)=>{
  await ElMessageBox.confirm("确认下架该路线？")
  const res = await request.put("/api/admin/route/audit",{id:row.id,status:2})
  if(res.code===200){
    ElMessage.success("已下架")
    loadData()
  }
}

//删除路线
const delRoute = async(row)=>{
  await ElMessageBox.confirm("确定删除，不可恢复！","警告",{type:"warning"})
  const res = await request.delete(`/api/admin/route/${row.id}`)
  if(res.code===200){
    ElMessage.success("删除成功")
    loadData()
  }
}

onMounted(()=>loadData())
</script>

<style scoped>
.page-wrap{padding:16px;}
.search-bar{margin-bottom:14px;display:flex;gap:10px;align-items:center;}
</style>
