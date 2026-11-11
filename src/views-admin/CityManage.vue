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
      <el-table-column label="所属省份">
        <template #default="{ row }">{{ provinceName(row.provinceId) }}</template>
      </el-table-column>
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
        <el-form-item label="所属省份" prop="provinceId">
          <el-select v-model="form.provinceId" placeholder="请选择省份" style="width:100%">
            <el-option v-for="p in provinces" :key="p.id" :label="p.provinceName" :value="p.id" />
          </el-select>
        </el-form-item>
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
  provinceId: null,
  cityName: '',
  centerLng: null,
  centerLat: null
})

const provinces = ref([])

const provinceName = (provinceId) => {
  const hit = provinces.value.find(p => p.id === provinceId)
  return hit ? hit.provinceName : ('省份#' + provinceId)
}

const loadProvinces = async () => {
  try {
    const res = await request.get('/area/provinceList')
    if (res.code === 200) provinces.value = res.data || []
  } catch (e) {
    provinces.value = []
  }
}

const rules = ref({
  provinceId: [{ required: true, message: '请选择所属省份', trigger: 'change' }],
  cityName: [{ required: true, message: '请填写城市名称', trigger: 'blur' }],
  centerLng: [{ required: true, message: '请填写中心点经度', trigger: 'blur' }],
  centerLat: [{ required: true, message: '请填写中心点纬度', trigger: 'blur' }]
})

// 加载城市列表
async function loadData() {
  loading.value = true
  try {
    const res = await request.get('/city/list')
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
  form.value = { id:null, provinceId:null, cityName:'', centerLng:null, centerLat:null }
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
    const res = form.value.id
      ? await request.put('/city/update', form.value)
      : await request.post('/city/add', form.value)
    if (res && res.code === 200) {
      ElMessage.success(form.value.id ? "编辑成功" : "新增成功")
      dialogVisible.value = false
      loadData()
    } else {
      ElMessage.error(res?.msg || "保存失败")
    }
  }catch(e){
    ElMessage.error("保存失败")
  }
}

//删除
async function handleDelete(row){
  await ElMessageBox.confirm(`确认删除【${row.cityName}】？该城市下仍有路线时会被拒绝。`, "警告", {type:'warning'})
  try {
    const res = await request.delete(`/city/delete/${row.id}`)
    if (res && res.code === 200) {
      ElMessage.success("删除成功")
      loadData()
    } else {
      ElMessage.error(res?.msg || "删除失败")
    }
  }catch(e){
    ElMessage.error("删除失败")
  }
}

onMounted(()=>{
  loadProvinces()
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
