<!-- src/views-admin/CityManage.vue -->
<template>
  <el-card>
    <template #header>
      <div class="header">
        <span>城市管理</span>
        <el-button type="primary" @click="openAddDialog">新增城市</el-button>
      </div>
    </template>

    <el-table :data="tableData" border stripe v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="cityName" label="城市名称" />
      <el-table-column prop="centerLng" label="中心点经度" />
      <el-table-column prop="centerLat" label="中心点纬度" />
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="城市名称" prop="cityName">
          <el-input v-model="form.cityName" placeholder="如：广州" />
        </el-form-item>
        <el-form-item label="中心点经度" prop="centerLng">
          <el-input-number v-model="form.centerLng" :step="0.0001" style="width:100%" placeholder="高德地图获取" />
        </el-form-item>
        <el-form-item label="中心点纬度" prop="centerLat">
          <el-input-number v-model="form.centerLat" :step="0.0001" style="width:100%" placeholder="高德地图获取" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增城市')
const formRef = ref(null)

const form = ref({
  id: null,
  cityName: '',
  centerLng: null,
  centerLat: null
})

const rules = ref({
  cityName: [{ required: true, message: '请填写城市名称', trigger: 'blur' }],
  centerLng: [{ required: true, message: '请填写中心点经度', trigger: 'blur' }],
  centerLat: [{ required: true, message: '请填写中心点纬度', trigger: 'blur' }]
})

// 加载城市列表
async function loadData() {
  loading.value = true
  try {
    const res = await request.get('/api/city/list')
    if(res.code === 200) {
      tableData.value = res.data
    }
  } catch (err) {
    ElMessage.error("获取城市列表失败")
  } finally {
    loading.value = false
  }
}

//打开新增弹窗
function openAddDialog(){
  dialogTitle.value = '新增城市'
  form.value = { id:null, cityName:'', centerLng:null, centerLat:null }
  dialogVisible.value = true
  formRef.value?.clearValidate()
}

//打开编辑弹窗
function openEditDialog(row){
  dialogTitle.value = '编辑城市'
  form.value = {...row}
  dialogVisible.value = true
  formRef.value?.clearValidate()
}

//提交新增/编辑
async function submit(){
  await formRef.value.validate()
  try {
    if(form.value.id){
      //编辑
      await request.put('/api/city/update', form.value)
      ElMessage.success("编辑成功")
    }else{
      //新增
      await request.post('/api/city/add', form.value)
      ElMessage.success("新增成功")
    }
    dialogVisible.value = false
    loadData()
  }catch(e){
    ElMessage.error("保存失败")
  }
}

//删除
async function handleDelete(row){
  await ElMessageBox.confirm(`确认删除【${row.cityName}】，注意：如果有路线关联该城市，删除会造成数据异常！`, "警告", {type:'warning'})
  try {
    await request.delete(`/api/city/delete/${row.id}`)
    ElMessage.success("删除成功")
    loadData()
  }catch(e){
    ElMessage.error("删除失败")
  }
}

onMounted(()=>{
  loadData()
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
