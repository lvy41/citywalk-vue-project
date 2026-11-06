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
            <el-input v-model="publishForm.routeName" placeholder="例如：杭州·西湖漫步"></el-input>
          </el-form-item>
          <el-form-item label="所属城市">
            <el-input v-model="publishForm.city" placeholder="例如：杭州"></el-input>
          </el-form-item>
          <el-form-item label="路线封面图 (URL)">
            <el-input v-model="publishForm.coverImage" placeholder="输入图片链接 (可选)"></el-input>
          </el-form-item>
          <el-form-item label="路线简介 / 游玩提示">
            <el-input type="textarea" v-model="publishForm.description" placeholder="写一点走心推荐吧..."></el-input>
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
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request' // 假设这是你们封装的请求

const router = useRouter()

// 1. 个人打卡路线列表（用于下拉框展示）
const myCheckinList = ref([])
const selectedRecordId = ref(null)

// 2. 发布表单数据
const publishForm = ref({
  routeName: '',
  city: '',
  coverImage: '',
  description: '',
  points: [
    { name: '', time: '09:00', transport: '', image: '' }
  ]
})

onMounted(() => {
  // 每次进入发布页，都从浏览器缓存里读取最新鲜的“我的打卡”数据
  const localData = localStorage.getItem('citywalk_checkin_list')
  
  if (localData) {
    // 如果本地有数据，直接解析
    myCheckinList.value = JSON.parse(localData)
  } else {
    // 如果本地没数据（说明你还没在“我的打卡”里创建过），给一个兜底的假数据
    myCheckinList.value = [
      { id: 1, routeName: '广州·珠江夜景漫步', points: [{ name: '广州塔', time: '20:00', transport: '步行', image: '' }] },
      { id: 2, routeName: '上海·武康路漫游', points: [{ name: '武康大楼', time: '14:00', transport: '步行', image: '' }] }
    ]
  }
})

// 3. 一键导入逻辑
const importFromCheckin = () => {
  const record = myCheckinList.value.find(item => item.id === selectedRecordId.value)
  if (!record) return

  // 把个人打卡的数据填入发布表单
  publishForm.value.routeName = record.routeName
  publishForm.value.city = record.routeName.split('·')[0] || '未知城市'
  publishForm.value.coverImage = record.coverImage
  publishForm.value.points = JSON.parse(JSON.stringify(record.points)) // 深拷贝，防止相互影响

  ElMessage.success('导入成功，你可以继续修改后发布！')
}

// 添加打卡点
const addPoint = () => {
  publishForm.value.points.push({ name: '', time: '12:00', transport: '', image: '' })
}

// 删除打卡点
const removePoint = (index) => {
  publishForm.value.points.splice(index, 1)
}

const submitPublish = async () => {
  if (!publishForm.value.routeName || !publishForm.value.city) {
    ElMessage.warning('请至少填写路线名称和城市！')
    return
  }

  try {
    // 1. 组装要发给后端的真实数据
    const postData = {
      routeName: publishForm.value.routeName,
      city: publishForm.value.city,
      coverImage: publishForm.value.coverImage || 'https://images.unsplash.com/photo-1543781737-0d7c1e62c3df?auto=format&fit=crop&w=600&q=80', // 替换成了有效默认图
      description: publishForm.value.description || '这个作者很懒，什么都没写~',
      points: publishForm.value.points
    }

    // 2. 发送请求给后端
    const res = await request.post('/route/add', postData)

    // 3. 判断结果
    if (res.code === 200 || res.code === 0) {
      ElMessage.success('🎉 路线发布成功！现在可以在首页搜索到它了')
      
      // 👇 核心逻辑：把刚刚发布成功的完整路线信息存入本地缓存，供 Record.vue 读取
      const publishedData = localStorage.getItem('citywalk_published_list')
      let list = publishedData ? JSON.parse(publishedData) : []
      
      list.push({
        id: Date.now(),
        routeName: publishForm.value.routeName,
        city: publishForm.value.city,
        coverImage: postData.coverImage, // 使用处理过后的封面图
        createTime: new Date().toLocaleString(),
        points: publishForm.value.points
      })
      
      localStorage.setItem('citywalk_published_list', JSON.stringify(list))

      // 发布成功后，跳回首页
      setTimeout(() => {
        router.push('/home')
      }, 1000)
      
    } else {
      ElMessage.error(res.msg || '发布失败，请检查内容')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('网络错误，请联系后端开发人员')
  }
}
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
