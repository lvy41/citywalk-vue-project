<template>
  <div class="page-ach">
    <!-- 头部渐变栏，和我的页面一致 -->
    <div class="header">
      <div class="back" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </div>
      <h2>我的成就</h2>
      <div class="placeholder"></div>
    </div>

    <!-- 总览：已解锁成就数 + 当前佩戴称号 -->
    <div class="summary-card">
      <div class="summary-left">
        <div class="summary-label">已解锁成就</div>
        <div class="summary-num">{{ summary.unlockedCount }}<span class="summary-total"> / {{ summary.totalCount }}</span></div>
      </div>
      <div class="summary-right">
        <div class="summary-label">当前佩戴</div>
        <div class="summary-title">🎖 {{ summary.currentTitle.titleName }}</div>
      </div>
    </div>

    <div class="container">
      <div class="line-card" v-for="line in summary.lines" :key="line.key">
        <div class="line-head">
          <span class="line-icon">{{ line.icon }}</span>
          <span class="line-name">{{ line.name }}</span>
          <span class="line-count">累计 {{ line.count }} 次</span>
        </div>

        <!-- 下一目标进度 -->
        <div class="line-progress">
          <div class="bar">
            <div class="bar-inner" :style="{ width: progressWidth(line) }"></div>
          </div>
          <span class="progress-text">{{ progressText(line) }}</span>
        </div>

        <div class="level-list">
          <div
            class="level-item"
            v-for="lv in line.levels"
            :key="lv.level"
            :class="{
              lock: !lv.unlocked,
              active: isWearing(line.key, lv.level)
            }"
            @click="wear(line, lv)"
          >
            <div class="level-name">{{ lv.titleName }}</div>
            <div class="level-desc">累计 {{ lv.need }} 次</div>
            <div class="level-tip">
              {{ lv.unlocked ? (isWearing(line.key, lv.level) ? '佩戴中' : '点击佩戴') : '未达成' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onActivated, onMounted } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getMyAchievementAPI, wearTitleAPI } from '@/api/achievement'

const summary = ref({
  unlockedCount: 0,
  totalCount: 0,
  currentTitle: { key: null, level: null, titleName: '初入城市' },
  lines: []
})

const isWearing = (key, level) =>
  summary.value.currentTitle.key === key && summary.value.currentTitle.level === level

// 进度：相对下一个未解锁等级；全部达成时显示满格
const progressPercent = (line) => {
  const levels = line.levels || []
  const last = levels[levels.length - 1]
  if (!last) return 0
  if (line.count >= last.need) return 100
  if (line.nextNeed) {
    const need = line.nextNeed
    const unlockedCount = line.unlockedCount || 0
    const prevNeed = unlockedCount > 0 ? levels[unlockedCount - 1].need : 0
    const span = Math.max(1, need - prevNeed)
    return Math.min(100, Math.round(((line.count - prevNeed) / span) * 100))
  }
  return 0
}
const progressWidth = (line) => `${Math.max(0, progressPercent(line))}%`
const progressText = (line) =>
  line.nextNeed ? `还差 ${Math.max(0, line.nextNeed - line.count)} 次解锁下一称号` : '全部称号已达成'

const load = async () => {
  try {
    const res = await getMyAchievementAPI()
    if (res && res.code === 200 && res.data) {
      summary.value = {
        unlockedCount: res.data.unlockedCount || 0,
        totalCount: res.data.totalCount || 0,
        currentTitle: res.data.currentTitle || { titleName: '初入城市' },
        lines: res.data.lines || []
      }
    }
  } catch (e) {
    console.error('成就接口不可用', e)
  }
}

const wear = async (line, lv) => {
  if (!lv.unlocked) {
    ElMessage.info(`累计 ${lv.need} 次「${line.name}」即可解锁`)
    return
  }
  if (isWearing(line.key, lv.level)) return
  try {
    const res = await wearTitleAPI({ key: line.key, level: lv.level })
    if (res && res.code === 200) {
      summary.value.currentTitle = {
        key: line.key,
        level: lv.level,
        titleName: lv.titleName
      }
      ElMessage.success(`已佩戴【${lv.titleName}】`)
    } else {
      ElMessage.error(res?.msg || '佩戴失败')
    }
  } catch (e) {
    ElMessage.error('佩戴失败，请稍后再试')
  }
}

onMounted(load)
onActivated(load)
</script>

<style scoped>
.page-ach {
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
.placeholder { width: 70px; }

.summary-card {
  margin: 16px;
  background: #fff;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}
.summary-label { font-size: 13px; color: #999; }
.summary-num { font-size: 24px; font-weight: bold; color: #e85d3a; margin-top: 4px; }
.summary-total { font-size: 13px; font-weight: normal; color: #999; }
.summary-title { font-size: 15px; font-weight: 600; color: #e85d3a; margin-top: 6px; }

.container { padding: 0 16px; display: flex; flex-direction: column; gap: 12px; }
.line-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.line-head { display: flex; align-items: center; gap: 8px; }
.line-icon { font-size: 18px; }
.line-name { font-size: 15px; font-weight: 600; color: #333; }
.line-count { margin-left: auto; font-size: 12px; color: #999; }
.line-progress { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
.bar { flex: 1; height: 8px; background: #ffeede; border-radius: 6px; overflow: hidden; }
.bar-inner { height: 100%; background: linear-gradient(90deg, #ff9a5a, #e85d3a); transition: width 0.3s; }
.progress-text { font-size: 11px; color: #a0785a; white-space: nowrap; }

.level-list { display: flex; gap: 8px; margin-top: 12px; }
.level-item {
  flex: 1;
  padding: 10px 8px;
  border-radius: 10px;
  background: #fff8ef;
  border: 1px solid #ffe2bd;
  cursor: pointer;
  text-align: center;
}
.level-item.active { background: #fff2ee; border-color: #e85d3a; }
.level-item.lock { background: #f4f4f4; border-color: #e9e9e9; cursor: not-allowed; }
.level-name { font-size: 13px; font-weight: 600; color: #e8622c; }
.level-item.lock .level-name { color: #bbb; }
.level-desc { font-size: 11px; color: #a0785a; margin-top: 4px; }
.level-item.lock .level-desc { color: #bbbbbb; }
.level-tip { font-size: 11px; color: #999; margin-top: 6px; }
</style>
