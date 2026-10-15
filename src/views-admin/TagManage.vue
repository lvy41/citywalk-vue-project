<template>
<div class="page-wrap">
  <h3>路线标签管理</h3>
  <el-card>
    <div class="search-bar">
      <el-button type="primary" @click="openAddDialog">新增标签</el-button>
    </div>
    <el-table :data="tableData" border stripe>
      <el-table-column label="标签ID" prop="id" width="80"></el-table-column>
      <el-table-column label="标签名称" prop="tagName"></el-table-column>
      <el-table-column label="创建时间" prop="createTime"></el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button link type="primary" @click="openEdit(scope.row)">编辑</el-button>
          <el-button link type="danger" @click="delTag(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <!--新增/编辑弹窗-->
  <el-dialog v-model="dialogVisible" title="标签编辑">
    <el-form :model="form">
      <el-form-item label="标签名称">
        <el-input v-model="form.tagName"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible=false">取消</el-button>
      <el-button type="primary" @click="submitSave">保存</el-button>
    </template>
  </el-dialog>
</div>
</template>

<script setup>
import {ref,onMounted} from 'vue'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([])
const dialogVisible = ref(false)
const form = ref({id:null,tagName:""})

async function loadData(){
  const res = await request.get("/api/admin/tag/list")
  if(res.code===200){
    tableData.value = res.data
  }
}

const openAddDialog = ()=>{
  form.value={id:null,tagName:""}
  dialogVisible.value=true
}

const openEdit = (row)=>{
  form.value = {...row}
  dialogVisible.value=true
}

const submitSave = async()=>{
  let res
  if(form.value.id){
    res = await request.put("/api/admin/tag",form.value)
  }else{
    res = await request.post("/api/admin/tag",form.value)
  }
  if(res.code===200){
    ElMessage.success("保存成功")
    dialogVisible.value=false
    loadData()
  }
}

const delTag = async(row)=>{
  await ElMessageBox.confirm("确认删除标签")
  const res = await request.delete(`/api/admin/tag/${row.id}`)
  if(res.code===200){
    ElMessage.success("已删除")
    loadData()
  }
}

onMounted(()=>loadData())
</script>

<style scoped>
.page-wrap{padding:16px;}
.search-bar{margin-bottom:14px;}
</style>
