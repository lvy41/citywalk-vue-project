<template>
  <div class="page-recycle">
    <div class="page-header">
      <div class="back-icon" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="page-title">我的垃圾站</div>
      <div class="clear-btn" v-if="recycleList.length" @click="clearAll">清空</div>
    </div>

    <div class="tip-bar" v-if="recycleList.length">
      删除的打卡路线会暂存在这里，保留最近 20 条，恢复后可回到「打卡记录」
    </div>

    <div class="content-wrap">
      <div v-if="recycleList.length === 0" class="empty-box">
        <p class="empty-main">垃圾站是空的</p>
        <p class="empty-sub">在「打卡记录」里删除的路线会先放到这里</p>
        <el-button round class="go-btn" @click="goRecord">去打卡记录</el-button>
      </div>

      <div v-else class="recycle-list">
        <div v-for="item in recycleList" :key="item.id" class="recycle-item">
          <img
            v-if="item.coverImage"
            :src="item.coverImage"
            class="cover"
            alt="封面"
            @error="onImgError"
          />
          <div v-else class="cover cover-fallback">🗺️</div>

          <div class="item-info">
            <div class="item-title">{{ item.routeName }}</div>
            <div class="item-meta">
              <span v-if="item.pointCount">打卡点位：{{ item.pointCount }} 个</span>
              <span v-if="item.createTime">完成：{{ item.createTime }}</span>
            </div>
            <div class="item-deleted">删除于 {{ item.deletedTime || '未知时间' }}</div>
          </div>

          <div class="item-actions">
            <el-button size="small" round type="primary" plain @click="restore(item)">恢复</el-button>
            <el-button size="small" round type="danger" plain @click="destroy(item)">彻底删除</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const RECYCLE_KEY = 'citywalk_recycle_list'
const CHECKIN_KEY = 'citywalk_checkin_list'
const recycleList = ref([])

// 读取垃圾站
const loadRecycleList = () => {
  try {
    const raw = localStorage.getItem(RECYCLE_KEY)
    recycleList.value = raw ? JSON.parse(raw) : []
  } catch (e) {
    console.warn('垃圾站读取失败', e)
    recycleList.value = []
  }
}
const saveRecycleList = () => {
  localStorage.setItem(RECYCLE_KEY, JSON.stringify(recycleList.value))
}

// 封面加载失败时不显示破图
const onImgError = (e) => {
  e.target.style.display = 'none'
}

// 恢复：从垃圾站移回打卡记录列表
const restore = (item) => {
  try {
    const checkinList = JSON.parse(localStorage.getItem(CHECKIN_KEY) || '[]')
    if (checkinList.some(r => r.id === item.id)) {
      ElMessage.warning('打卡记录里已经有这条路线了')
    } else {
      const { deletedTime, ...plain } = item
      checkinList.unshift(plain)
      localStorage.setItem(CHECKIN_KEY, JSON.stringify(checkinList))
    }
  } catch (e) {
    console.warn('恢复打卡路线失败', e)
  }
  recycleList.value = recycleList.value.filter(r => r.id !== item.id)
  saveRecycleList()
  ElMessage.success(`已恢复「${item.routeName}」`)
}

// 彻底删除
const destroy = (item) => {
  ElMessageBox.confirm(`「${item.routeName}」将被永久删除，无法再恢复，确定吗？`, '彻底删除', {
    confirmButtonText: '永久删除',
    cancelButtonText: '再想想',
    type: 'warning',
    confirmButtonClass: 'el-button--danger'
  }).then(() => {
    recycleList.value = recycleList.value.filter(r => r.id !== item.id)
    saveRecycleList()
    ElMessage.success('已永久删除')
  }).catch(() => {})
}

// 清空垃圾站
const clearAll = () => {
  ElMessageBox.confirm('垃圾站里的所有路线都会被永久删除，确定清空吗？', '清空垃圾站', {
    confirmButtonText: '清空',
    cancelButtonText: '再想想',
    type: 'warning',
    confirmButtonClass: 'el-button--danger'
  }).then(() => {
    recycleList.value = []
    saveRecycleList()
    ElMessage.success('垃圾站已清空')
  }).catch(() => {})
}

const goRecord = () => router.push('/record')
const goBack = () => router.back()

onMounted(loadRecycleList)
</script>

<style scoped>
.page-recycle {
  background-color: #f8f8f8;
  min-height: 100vh;
  padding-bottom: 24px;
  box-sizing: border-box;
}
.page-header {
  display: flex;
  align-items: center;
  height: 52px;
  background: #fff;
  padding: 0 16px;
  position: relative;
  border-bottom: 1px solid #eee;
}
.back-icon {
  font-size: 20px;
  cursor: pointer;
  z-index: 2;
}
.page-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  font-weight: 600;
  color: #222;
}
.clear-btn {
  margin-left: auto;
  font-size: 14px;
  color: #e85d3a;
  cursor: pointer;
  z-index: 2;
}
.tip-bar {
  background: #fff5ef;
  color: #c9714f;
  font-size: 12px;
  line-height: 1.6;
  padding: 10px 16px;
}
.content-wrap {
  padding: 16px;
}
.empty-box {
  text-align: center;
  padding: 80px 20px;
}
.empty-main {
  color: #666;
  font-size: 17px;
  margin-bottom: 8px;
}
.empty-sub {
  color: #bbb;
  font-size: 13px;
  margin-bottom: 22px;
}
.go-btn {
  background: linear-gradient(to right, #ff9a44, #fc6076);
  border: none;
  color: #fff;
  padding: 10px 26px;
}
.recycle-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.recycle-item {
  background: #fff;
  border-radius: 14px;
  padding: 12px;
  display: flex;
  gap: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}
.cover {
  width: 84px;
  height: 84px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  background: #f2f2f2;
}
.cover-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: #ccc;
}
.item-info {
  flex: 1;
  min-width: 0;
}
.item-title {
  font-size: 15px;
  font-weight: 600;
  color: #222;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-meta {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.item-deleted {
  font-size: 12px;
  color: #bbb;
  margin-top: 4px;
}
.item-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  flex-shrink: 0;
}
.item-actions .el-button + .el-button {
  margin-left: 0;
}
</style>
