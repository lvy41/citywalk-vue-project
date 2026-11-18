<template>
  <div class="page-recycle">
    <div class="page-header">
      <div class="back-icon" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="page-title">我的垃圾站</div>
      <div class="header-placeholder"></div>
    </div>

    <div class="tip-bar">
      删除的路线会先放到这里，恢复后可回到「打卡记录」；彻底删除后无法再找回。
    </div>

    <div class="tab-bar">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <span class="tab-count">{{ countBy(tab.key) }}</span>
      </div>
    </div>

    <div class="content-wrap">
      <div v-if="filteredList.length === 0" class="empty-box">
        <p class="empty-main">这里是空的</p>
        <p class="empty-sub">在「打卡记录」里删除的路线会先放到这里</p>
        <el-button round class="go-btn" @click="goRecord">去打卡记录</el-button>
      </div>

      <div v-else class="recycle-list">
        <div v-for="item in filteredList" :key="item.id" class="recycle-item">
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
              <el-tag size="small" :type="item.mine ? 'warning' : 'success'" effect="plain">
                {{ item.mine ? '我的路线' : '我的闯关' }}
              </el-tag>
              <span v-if="item.totalPoints">打卡点位：{{ item.totalPoints }} 个</span>
              <span>{{ item.status === 1 ? '已通关' : '打卡中' }}</span>
            </div>
            <div class="item-deleted">删除于 {{ formatTime(item.deleteTime) }}</div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTrashRoutesAPI, restoreRouteAPI, destroyRouteAPI } from '@/api/checkin'

const router = useRouter()
const tabs = [
  { key: 'mine', label: '我的路线' },
  { key: 'challenge', label: '我的闯关' }
]
const activeTab = ref('mine')
const recycleList = ref([])

const countBy = (key) => recycleList.value.filter(r => key === 'mine' ? r.mine : !r.mine).length

const filteredList = computed(() =>
  recycleList.value.filter(r => activeTab.value === 'mine' ? r.mine : !r.mine)
)

const loadRecycleList = async () => {
  try {
    const res = await getTrashRoutesAPI()
    recycleList.value = (res && res.data) || []
  } catch (e) {
    console.warn('回收站读取失败', e)
    recycleList.value = []
  }
}

const onImgError = (e) => {
  e.target.style.display = 'none'
}

const formatTime = (t) => {
  if (!t) return '未知时间'
  const d = new Date(t)
  if (Number.isNaN(d.getTime())) return String(t)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const restore = async (item) => {
  try {
    await restoreRouteAPI(item.id)
    recycleList.value = recycleList.value.filter(r => r.id !== item.id)
    ElMessage.success(`已恢复「${item.routeName}」`)
  } catch (e) {
    ElMessage.error('恢复失败，请稍后重试')
  }
}

const destroy = (item) => {
  ElMessageBox.confirm(`「${item.routeName}」将被永久删除，无法再恢复，确定吗？`, '彻底删除', {
    confirmButtonText: '永久删除',
    cancelButtonText: '再想想',
    type: 'warning',
    confirmButtonClass: 'el-button--danger'
  }).then(async () => {
    try {
      await destroyRouteAPI(item.id)
      recycleList.value = recycleList.value.filter(r => r.id !== item.id)
      ElMessage.success('已永久删除')
    } catch (e) {
      ElMessage.error('删除失败，请稍后重试')
    }
  }).catch(() => {})
}

const goRecord = () => router.push('/record')
const goBack = () => router.back()

onMounted(loadRecycleList)
</script>

<style scoped>
.page-recycle {
  background: linear-gradient(180deg, #fff7ed 0%, #ffe4c7 45%, #ffd2a8 100%);
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
.header-placeholder {
  margin-left: auto;
  width: 20px;
}
.tip-bar {
  background: #fff5ef;
  color: #c9714f;
  font-size: 12px;
  line-height: 1.6;
  padding: 10px 16px;
}
.tab-bar {
  display: flex;
  gap: 10px;
  padding: 14px 16px 0;
}
.tab-item {
  padding: 8px 16px;
  border-radius: 18px;
  background: #fff;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #eee;
}
.tab-item.active {
  background: linear-gradient(to right, #ff9a44, #fc6076);
  color: #fff;
  border-color: transparent;
}
.tab-count {
  margin-left: 4px;
  font-size: 12px;
  opacity: 0.85;
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
  object-fit: contain;
  flex-shrink: 0;
  background: #f4f5f7;
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
  margin-top: 6px;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}
.item-deleted {
  font-size: 12px;
  color: #bbb;
  margin-top: 6px;
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
