<template>
  <div class="publish-container">
    <!-- 顶部返回 -->
    <div class="detail-header">
      <div class="back-btn" @click="$router.push('/home')">
        <el-icon><ArrowLeft /></el-icon> 返回
      </div>
      <h2 class="detail-title">发布公开路线</h2>
      <div class="header-placeholder"></div>
    </div>

    <div class="create-form">
      <!-- 一键导入个人足迹 -->
      <div class="form-card import-card">
        <h3 class="section-title">✨ 快捷导入</h3>
        <p class="import-tip">
          可以直接选择「打卡记录」里保存的个人足迹，一键提取路线和点位，无需重新填写。
        </p>
        <div style="display: flex; gap: 10px;">
          <el-select
            v-model="selectedRecordId"
            :placeholder="myCheckinList.length ? '请选择要导入的个人打卡路线' : '暂无个人打卡记录'"
            style="flex: 1;"
            :disabled="!myCheckinList.length"
          >
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
            <el-input v-model="form.routeName" placeholder="请输入路线名称，例如：广州·沙面老街漫步"></el-input>
          </el-form-item>
          <el-form-item label="所属城市">
            <el-select v-model="form.cityId" placeholder="选择城市" style="width:100%" filterable>
              <el-option
                v-for="city in cityList"
                :key="city.id"
                :label="city.cityName"
                :value="city.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="路线封面图 (URL)">
            <el-input v-model="form.coverImage" placeholder="输入图片链接 (可选)"></el-input>
          </el-form-item>
          <el-form-item label="路线标签">
            <el-select v-model="form.tags" multiple placeholder="选择标签" style="width:100%">
              <el-option label="老街" value="老街" />
              <el-option label="美食" value="美食" />
              <el-option label="人文" value="人文" />
              <el-option label="公园" value="公园" />
              <el-option label="夜景" value="夜景" />
              <el-option label="摄影打卡" value="摄影打卡" />
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
        </el-form>
      </div>

      <!-- 打卡点列表 -->
      <div class="form-card">
        <h3 class="section-title">📍 途径打卡点</h3>

        <div v-for="(point, index) in form.points" :key="index" class="point-edit-item">
          <div class="point-edit-header">
            <span>打卡点 {{ index + 1 }}</span>
            <el-button type="danger" link @click="removePoint(index)" v-if="form.points.length > 1">删除</el-button>
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
    </div>

    <!-- 底部提交栏：抬到底部导航之上 -->
    <div class="submit-bar">
      <el-button type="primary" class="submit-btn" :loading="submitting" @click="submitPublish">确认发布到首页</el-button>
    </div>

    <!-- 底部导航栏：与 Home / Map 保持一致 -->
    <div class="tab-bar">
      <div class="tab-item" :class="{active: $route.path === '/home'}" @click="$router.push('/home')">
        <div class="tab-icon">🏠</div>
        <div class="tab-text">首页</div>
      </div>
      <div class="tab-item" :class="{active: $route.path === '/map'}" @click="$router.push('/map')">
        <div class="tab-icon">🗺</div>
        <div class="tab-text">探索地图</div>
      </div>
      <div class="tab-item" :class="{active: $route.path === '/publish'}" @click="$router.push('/publish')">
        <div class="tab-icon">✏️</div>
        <div class="tab-text">发布路线</div>
      </div>
      <div class="tab-item" :class="{active: $route.path === '/record'}" @click="$router.push('/record')">
        <div class="tab-icon">📝</div>
        <div class="tab-text">打卡记录</div>
      </div>
      <div class="tab-item" :class="{active: $route.path === '/my'}" @click="$router.push('/my')">
        <div class="tab-icon">👤</div>
        <div class="tab-text">我的</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()

const cityList = ref([])
const myCheckinList = ref([])
const selectedRecordId = ref(null)
const submitting = ref(false)

const defaultPoint = () => ({ name: '', time: '09:00', transport: '', image: '' })

const form = ref({
  routeName: '',
  cityId: null,
  coverImage: '',
  tags: [],
  description: '',
  points: [defaultPoint()]
})

// 城市下拉：baseURL 已带 /api，这里只能写 /city/list
const loadCityList = async () => {
  try {
    const res = await request.get('/city/list')
    cityList.value = res.data || []
  } catch (err) {
    console.error('城市列表加载失败', err)
  }
}

// 打卡记录页保存的个人足迹
const loadCheckinList = () => {
  try {
    const raw = localStorage.getItem('citywalk_checkin_list')
    myCheckinList.value = raw ? JSON.parse(raw) : []
  } catch (err) {
    console.error('打卡记录读取失败', err)
    myCheckinList.value = []
  }
}

const importFromCheckin = () => {
  const record = myCheckinList.value.find(item => item.id === selectedRecordId.value)
  if (!record) {
    ElMessage.warning('请先选择要导入的打卡记录')
    return
  }
  form.value.routeName = record.routeName || ''
  form.value.coverImage = record.coverImage || ''
  form.value.description = record.description || ''
  form.value.points = (record.points || []).map(pt => ({
    name: pt.name || '',
    time: pt.time || '09:00',
    transport: pt.transport || '',
    image: pt.image || ''
  }))
  if (!form.value.points.length) {
    form.value.points = [defaultPoint()]
  }
  ElMessage.success(`已导入「${record.routeName}」的 ${form.value.points.length} 个打卡点`)
}

const addPoint = () => {
  form.value.points.push(defaultPoint())
}

const removePoint = (index) => {
  if (form.value.points.length <= 1) return
  form.value.points.splice(index, 1)
}

const resetForm = () => {
  form.value = {
    routeName: '',
    cityId: null,
    coverImage: '',
    tags: [],
    description: '',
    points: [defaultPoint()]
  }
  selectedRecordId.value = null
}

// 同步到打卡记录页的「我的发布」列表
const saveToLocalPublished = (record) => {
  try {
    const raw = localStorage.getItem('citywalk_published_list')
    const list = raw ? JSON.parse(raw) : []
    list.unshift(record)
    localStorage.setItem('citywalk_published_list', JSON.stringify(list))
  } catch (err) {
    console.error('本地发布记录写入失败', err)
  }
}

const submitPublish = async () => {
  if (!form.value.routeName.trim()) {
    ElMessage.warning('请先填写路线名称')
    return
  }
  if (!form.value.cityId) {
    ElMessage.warning('请选择所属城市')
    return
  }

  const city = cityList.value.find(item => item.id === form.value.cityId)
  const localRecord = {
    id: Date.now(),
    routeName: form.value.routeName.trim(),
    city: city ? city.cityName : '',
    coverImage: form.value.coverImage,
    tags: form.value.tags,
    description: form.value.description,
    pointCount: form.value.points.length,
    createTime: new Date().toLocaleString()
  }

  const payload = {
    routeName: localRecord.routeName,
    cityId: form.value.cityId,
    city: localRecord.city,
    coverImage: form.value.coverImage,
    description: form.value.description,
    isPublic: 1,
    auditStatus: 1
  }

  submitting.value = true
  try {
    const res = await request.post('/route/add', payload)
    saveToLocalPublished(localRecord)
    ElMessage.success(res.msg || '路线发布成功')
    resetForm()
    router.push('/home')
  } catch (err) {
    // 后端未启动时先本地留存，避免用户白填一遍
    saveToLocalPublished(localRecord)
    ElMessage.warning('服务器暂时未响应，路线已暂存到本地「我的发布」')
    resetForm()
    router.push('/record')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadCityList()
  loadCheckinList()
})
</script>

<style scoped>
.publish-container {
  padding: 20px 15px 150px;
  background: linear-gradient(180deg, #FFF6F0 0%, #F5F7FA 100%);
  min-height: 100vh;
  box-sizing: border-box;
}
.detail-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px dashed #FFE4D6; }
.back-btn { display: flex; align-items: center; gap: 4px; font-size: 15px; color: #FF7A45; font-weight: bold; cursor: pointer; background: #FFF0F3; padding: 6px 12px; border-radius: 20px; }
.detail-title { margin: 0; font-size: 18px; color: #303133; font-weight: 800; }
.header-placeholder { width: 70px; }

.create-form { padding-bottom: 10px; }
.form-card { background: #fff; border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.section-title { font-size: 16px; font-weight: bold; color: #303133; margin: 0 0 15px 0; padding-left: 8px; border-left: 4px solid #FF7A45; }

.import-card { background: #FFF9F0; border: 1px dashed #FFD15C; }
.import-card .section-title { border-left-color: #E6A23C; }
.import-tip { font-size: 13px; color: #909399; margin: 0 0 10px 0; }

.point-edit-item { background: #F9F9F9; border: 1px dashed #DCDFE6; border-radius: 12px; padding: 15px; margin-bottom: 15px; }
.point-edit-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; color: #FF7A45; margin-bottom: 10px; }

.add-point-btn { width: 100%; height: 44px; border-radius: 10px; border-color: #FF9A44; color: #FF7A45; background: #FFF9F0; font-weight: bold; }
.add-point-btn:hover { background: #FFF0F3; }

/* 提交栏固定在 tab-bar 之上，避免互相遮挡 */
.submit-bar { position: fixed; bottom: 60px; left: 0; width: 100%; background: #fff; padding: 10px 15px; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); z-index: 98; box-sizing: border-box; }
.submit-btn { width: 100%; border-radius: 20px; background: linear-gradient(to right, #FF9A44, #FC6076); border: none; font-size: 16px; font-weight: bold; padding: 12px 0; }

/* 底部导航栏：与 Home / Map 一致 */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background: #fff;
  display: flex;
  border-top: 1px solid #eee;
  z-index: 99;
}
.tab-bar .tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #666;
  gap: 3px;
  cursor: pointer;
}
.tab-bar .tab-item.active { color: #409eff; }
.tab-bar .tab-icon { font-size: 20px; }
.tab-bar .tab-text { font-size: 14px; line-height: 1; }
</style>
