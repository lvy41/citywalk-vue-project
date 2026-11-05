<template>
  <div class="publish-container">
    <!-- 背景层 -->
    <div class="bg-wrap"></div>
    <div class="content-wrap">
      <div class="form-card">
        <div class="card-header">
          <h2>发布步行路线</h2>
          <p>分享你的城市漫步路线</p>
        </div>
        <el-form :model="form" label-width="90px" class="publish-form">
          <el-form-item label="路线名称">
            <el-input v-model="form.name" placeholder="请输入路线名称"></el-input>
          </el-form-item>
          <el-form-item label="所属城市">
            <el-input v-model="form.city" placeholder="例如：广州"></el-input>
          </el-form-item>
          <el-form-item label="预计时长">
            <el-input v-model="form.duration" placeholder="例如：2小时"></el-input>
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
              v-model="form.desc"
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
    </div>
    <!-- 底部Tab导航【和Home页面完全统一：图标在上文字在下】 -->
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
    <div class="blank-bottom"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
const router = useRouter()
const route = useRoute()

const form = ref({
  name: '',
  city: '',
  duration: '',
  tags: [],
  desc: ''
})
const fileList = ref([])

const handleSubmit = () => {
  console.log('提交表单数据：', form.value)
  console.log('上传图片：', fileList.value)
  ElMessage.success('模拟发布成功，跳转首页')
  router.push('/home')
}
const handleReset = () => {
  form.value = {
    name: '',
    city: '',
    duration: '',
    tags: [],
    desc: ''
  }
  fileList.value = []
  ElMessage.info('表单已重置')
}
</script>

<style scoped>
.publish-container {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  padding-bottom: 70px;
}
/* 夜景渐变背景，和登录页色调匹配 */
.bg-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('/pictures/city-bg.png') center center / cover no-repeat;
  z-index: -1;
}
.content-wrap {
  padding: 40px 20px;
  display: flex;
  justify-content: center;
}
/* 表单卡片，圆角+阴影，和登录框风格统一 */
.form-card {
  width: 100%;
  max-width: 680px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(6px);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.22);
  padding: 32px;
}
.card-header {
  text-align: center;
  margin-bottom: 26px;
}
.card-header h2 {
  margin: 0;
  color: #333;
  font-size: 22px;
}
.card-header p {
  margin: 6px 0 0;
  color: #888;
  font-size: 14px;
}
.publish-form {
  width: 100%;
}
/* 提交按钮改成登录页同款橙渐变 */
.btn-group {
  display: flex;
  gap:14px;
  justify-content: center;
  margin-top:10px;
}
.submit-btn {
  background: linear-gradient(90deg, #ff7043, #ff452b) !important;
  border: none !important;
  padding: 0 32px;
  font-size:16px;
  border-radius:12px;
}
.reset-btn {
  border-radius:12px;
}

/* ==========底部Tab栏【和Home完全一致样式】========== */
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
.tab-item {
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
.tab-item.active {
  color: #409eff;
}
.tab-icon {
  font-size: 20px;
}
.blank-bottom {
  height: 70px;
}
</style>
