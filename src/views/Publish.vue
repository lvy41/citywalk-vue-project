<template>
  <div class="publish-container">
    <!-- 顶部返回 -->
    <div class="detail-header">
      <div class="back-btn" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon> 返回
      </div>
      <h2 class="detail-title">发布公开路线</h2>
      <div class="header-placeholder"></div>
    </div>

    <div class="create-form">
      <!-- 👇 核心新增：一键导入个人足迹 👇 -->
      <div class="form-card import-card">
        <h3 class="section-title">✨ 快捷导入</h3>
        <p style="font-size: 13px; color: #909399; margin-bottom: 10px;">
          你可以直接选择之前在“我的打卡”中记录的个人足迹，一键提取路线和点位，无需重新填写。
        </p>
        <div style="display: flex; gap: 10px;">
          <el-select v-model="selectedRecordId" placeholder="请选择要导入的个人打卡路线" style="flex: 1;">
            <el-option 
              v-for="item in myCheckinList" 
              :key="item.id" 
              :label="item.routeName" 
              :value="item.id" 
            />
          </el-select>
          <el-button type="primary" @click="importFromCheckin" :disabled="!selectedRecordId">
            一键导入
          </el-button>
        </div>
      </div>

      <!-- 基础信息 -->
      <div class="form-card">
        <h3 class="section-title">📝 路线基础信息</h3>
        <el-form label-position="top">
          <el-form-item label="路线名称">
            <el-input v-model="form.routeName" placeholder="请输入路线名称"></el-input>
          </el-form-item>
          <el-form-item label="所属城市" prop="cityId">
            <el-select v-model="form.cityId" placeholder="选择城市" style="width:100%">
              <el-option
                v-for="city in cityList"
                :key="city.id"
                :label="city.cityName"
                :value="city.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="路线封面图 (URL)">
            <el-input v-model="publishForm.coverImage" placeholder="输入图片链接 (可选)"></el-input>
          </el-form-item>
          <el-form-item label="路线标签">
            <el-select v-model="form.tags" multiple placeholder="选择标签">
              <el-option label="老街" value="老街" />
              <el-option label="美食" value="美食" />
              <el-option label="博物馆" value="博物馆" />
              <el-option label="公园" value="公园" />
              <el-option label="夜景" value="夜景" />
              <el-option label="短途徒步" value="短途徒步" />
            </el-select>
          </el-form-item>
          <el-form-item label="路线简介">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              placeholder="简单描述这条步行路线"
            ></el-input>
          </el-form-item>
          <el-form-item label="封面图片">
            <el-upload
              action="#"
              :auto-upload="false"
              :file-list="fileList"
              list-type="picture-card"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item class="btn-group">
            <el-button type="primary" @click="handleSubmit" class="submit-btn">提交发布</el-button>
            <el-button @click="handleReset" class="reset-btn">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 打卡点列表 (动态添加) -->
      <div class="form-card">
        <h3 class="section-title">📍 途径打卡点</h3>
        
        <div v-for="(point, index) in publishForm.points" :key="index" class="point-edit-item">
          <div class="point-edit-header">
            <span>打卡点 {{ index + 1 }}</span>
            <el-button type="danger" link @click="removePoint(index)" v-if="publishForm.points.length > 1">删除</el-button>
          </div>
          
          <el-form label-position="top">
            <el-form-item label="具体地点名称">
              <el-input v-model="point.name" placeholder="例如：断桥残雪"></el-input>
            </el-form-item>
            <el-form-item label="到达时间">
              <el-time-picker v-model="point.time" placeholder="选择时间" format="HH:mm" value-format="HH:mm" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="通勤方式">
              <el-input v-model="point.transport" placeholder="例如：打车 15min / 步行"></el-input>
            </el-form-item>
            <el-form-item label="打卡照片 (URL)">
              <el-input v-model="point.image" placeholder="输入照片链接 (可选)"></el-input>
            </el-form-item>
          </el-form>
        </div>

        <el-button class="add-point-btn" type="dashed" plain @click="addPoint">
          + 添加新的打卡点
        </el-button>
      </div>

      <!-- 提交按钮 -->
      <div class="submit-bar">
        <el-button type="primary" class="submit-btn" @click="submitPublish">确认发布到首页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'
const router = useRouter()

const cityList = ref([])
const form = ref({
  routeName: '',
  cityId: null,
  duration: '',
  tags: [],
  description: ''
})

// 加载城市下拉列表
const loadCityList = async () => {
  try {
    const res = await request.get('/api/city/list')
    if (res.code === 200) {
      cityList.value = res.data
    }
  } catch (err) {
    console.error('城市加载失败', err)
  }
}

const handleSubmit = async () => {
  console.log('提交表单数据：', form.value)
  console.log('上传图片：', fileList.value)
  try {
    const res = await request.post('/api/route/add', form.value)
    if(res.code === 200){
      ElMessage.success('发布成功，跳转首页')
      router.push('/home')
    }
  } catch (err) {
    ElMessage.error('发布失败')
  }
}
const handleReset = () => {
  form.value = {
    routeName: '',
    cityId: null,
    duration: '',
    tags: [],
    description: ''
  }
}

onMounted(()=>{
  loadCityList()
})
</script>

<style scoped>
/* 这里直接复用你 Record.vue 里的样式，保证风格统一 */
.publish-container {
  padding: 20px 15px;
  background: linear-gradient(180deg, #FFF6F0 0%, #F5F7FA 100%);
  min-height: 100vh;
  padding-bottom: 80px;
}
.detail-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px dashed #FFE4D6; }
.back-btn { display: flex; align-items: center; gap: 4px; font-size: 15px; color: #FF7A45; font-weight: bold; cursor: pointer; background: #FFF0F3; padding: 6px 12px; border-radius: 20px; }
.detail-title { margin: 0; font-size: 18px; color: #303133; font-weight: 800; }
.header-placeholder { width: 70px; }

.create-form { padding-bottom: 80px; }
.form-card { background: #fff; border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.section-title { font-size: 16px; font-weight: bold; color: #303133; margin: 0 0 15px 0; padding-left: 8px; border-left: 4px solid #FF7A45; }

.import-card { background: #FFF9F0; border: 1px dashed #FFD15C; }
.import-card .section-title { border-left-color: #E6A23C; }

.point-edit-item { background: #F9F9F9; border: 1px dashed #DCDFE6; border-radius: 12px; padding: 15px; margin-bottom: 15px; }
.point-edit-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; color: #FF7A45; margin-bottom: 10px; }

.add-point-btn { width: 100%; height: 44px; border-radius: 10px; border-color: #FF9A44; color: #FF7A45; background: #FFF9F0; font-weight: bold; }
.add-point-btn:hover { background: #FFF0F3; }

.submit-bar { position: fixed; bottom: 0; left: 0; width: 100%; background: #fff; padding: 10px 15px; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); z-index: 100; box-sizing: border-box; }
.submit-btn { width: 100%; border-radius: 20px; background: linear-gradient(to right, #FF9A44, #FC6076); border: none; font-size: 16px; font-weight: bold; padding: 12px 0; }
</style>
