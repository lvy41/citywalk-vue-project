<template>
  <div class="page-title">
    <!-- 头部渐变栏，和my页面一致 -->
    <div class="header">
      <div class="back" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </div>
      <h2>我的全部称号</h2>
      <div class="placeholder"></div>
    </div>

    <div class="container">
      <div class="title-item" v-for="item in allTitleListWithUnlock" :key="item.name"
        :class="{ lock: !item.unlock, active: wearTitle.name === item.name }"
        @click="selectTitle(item)">
        <div class="title-name">{{ item.name }}</div>
        <div class="title-desc">需要奖杯：{{ item.need }}</div>
        <div class="tip">
          {{ item.unlock ? (wearTitle.name === item.name ? '佩戴中' : '点击佩戴') : '未解锁' }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onActivated } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { getUserInfoAPI } from '@/api/user'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

// 奖杯数量
const trophyCount = ref(0)
// 佩戴称号
const wearTitle = ref({ name: "初入城市", need: 0 })

// 全部称号配置
const allTitleList = ref([
  { name: "初入城市", need: 0 },
  { name: "新手行者", need: 1 },
  { name: "打卡爱好者", need: 5 },
  { name: "路线探索达人", need: 10 },
  { name: "资深漫步探险家", need: 20 },
  { name: "城市漫游大师", need: 30 },
])

const allTitleListWithUnlock = computed(() => {
  return allTitleList.value.map(item => ({
    ...item,
    unlock: trophyCount.value >= item.need
  }))
})

// 选择佩戴称号
const selectTitle = (item) => {
  if (!item.unlock) return
  wearTitle.value = item
  ElMessage.success(`已佩戴【${item.name}】`)
}

// 获取数据
const getStatInfo = async () => {
  const res = await getUserInfoAPI()
  if (res.code === 200) {
    trophyCount.value = res.data.trophyCount || 0
    // 后端如果存了佩戴称号，这里可以赋值 wearTitle.value = res.data.wearTitle
  }
}
onActivated(() => {
  getStatInfo()
})
</script>
<style scoped>
.page-title {
  /* 只修改背景，和我的发布保持同款渐变 */
  background: linear-gradient(180deg, #fff7ed 0%, #ffe4c7 45%, #ffd2a8 100%);
  min-height: 100vh;
  padding-bottom: 70px;
}
.header {
  background: linear-gradient(140deg, #e65b38, #ff9048);
  color: #fff;
  padding: 18px 20px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
/* ✅ 这里直接复制你record页面的返回样式，完全统一 */
.back {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 15px;
  color: #FF7A45;
  font-weight: bold;
  cursor: pointer;
  background: #FFF0F3;
  padding: 6px 12px;
  border-radius: 20px;
}
.header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.placeholder {
  width: 70px;
}
.container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap:12px;
}
.title-item {
  padding:16px;
  border-radius:14px;
  background:#fff;
  box-shadow:0 2px 8px rgba(0,0,0,0.05);
  cursor: pointer;
}
.title-item.active {
  border:1px solid #e85d3a;
  background:#fff2ee;
}
.title-item.lock {
  background:#eee;
  color:#999;
  cursor: not-allowed;
}
.title-name {
  font-size:16px;
  font-weight:500;
}
.title-desc {
  font-size:12px;
  color:#888;
  margin-top:4px;
}
.tip {
  font-size:12px;
  margin-top:4px;
}
</style>
