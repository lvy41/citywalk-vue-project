<template>
  <el-card class="publish-card">
    <template #header>
      <div class="title">发布CityWalk路线</div>
    </template>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="路线名称" prop="routeName">
        <el-input v-model="form.routeName" placeholder="请输入路线名称" />
      </el-form-item>
      <el-form-item label="所属城市" prop="cityId">
        <el-select v-model="form.cityId" placeholder="选择城市" @change="onCityChange">
          <el-option v-for="c in cityList" :key="c.id" :label="c.cityName" :value="c.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="预计耗时" prop="duration">
        <el-input v-model="form.duration" placeholder="例如：2小时" />
      </el-form-item>
      <el-form-item label="总里程" prop="distance">
        <el-input v-model="form.distance" placeholder="例如：3km" />
      </el-form-item>
      <el-form-item label="路线简介" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="4" placeholder="介绍这条路线、游玩提示" />
      </el-form-item>
      <el-form-item label="是否公开">
        <el-radio-group v-model="form.isPublic">
          <el-radio :label="1">公开</el-radio>
          <el-radio :label="0">私密</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit">提交发布</el-button>
        <el-button @click="reset">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { useRouter } from 'vue-router'
const router = useRouter()

const formRef = ref(null)
const cityList = ref([])
const form = ref({
  routeName: '',
  cityId: null,
  city: '', // 兼容旧字段，后端同时存city文本
  duration: '',
  distance: '',
  description: '',
  isPublic: 1
})
const rules = ref({
  routeName: [{ required: true, message: '请填写路线名称', trigger: 'blur' }],
  cityId: [{ required: true, message: '请选择城市', trigger: 'change' }],
  duration: [{ required: true, message: '请填写预计耗时', trigger: 'blur' }],
  distance: [{ required: true, message: '请填写里程', trigger: 'blur' }],
  description: [{ required: true, message: '请填写路线简介', trigger: 'blur' }]
})

// 城市选择时自动回填city名字文本
const onCityChange = (cid) => {
  const cityItem = cityList.value.find(i => i.id === cid)
  if (cityItem) {
    form.value.city = cityItem.cityName
  }
}

const loadCityList = async () => {
  try {
    const res = await request.get('/api/city/list')
    if (res.code === 200) {
      cityList.value = res.data
    }
  } catch (e) {
    ElMessage.error("城市列表加载失败")
  }
}

const submit = async () => {
  await formRef.value.validate()
  try {
    await request.post('/route/add', form.value)
    ElMessage.success("路线发布成功！")
    router.push('/home')
  } catch (e) {
    ElMessage.error("发布失败")
  }
}

const reset = () => {
  formRef.value?.resetFields()
  form.value.city = ''
}

onMounted(() => {
  loadCityList()
})
</script>

<style scoped>
.publish-card {
  max-width: 700px;
  margin: 20px auto;
  padding-bottom: 20px;
}
.title {
  font-size: 18px;
  font-weight: bold;
}
</style>
