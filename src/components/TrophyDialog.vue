<template>
  <el-dialog
    :model-value="modelValue"
    width="80%"
    class="trophy-dialog"
    :show-close="false"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="trophy-body">
      <div class="trophy-emoji">🎉</div>
      <div class="trophy-title">{{ title }}</div>
      <div class="trophy-subtitle" v-if="subtitle">{{ subtitle }}</div>

      <div class="trophy-list">
        <div class="trophy-item" v-for="(item, index) in trophies" :key="index">
          <span class="trophy-item-icon">{{ item.icon || '🏆' }}</span>
          <span class="trophy-item-name">{{ item.trophyName || item.name || '小奖杯' }}</span>
        </div>
      </div>

      <div class="trophy-count" v-if="totalCount !== null && totalCount !== undefined">
        当前累计奖杯：{{ totalCount }} 个
      </div>
      <div class="trophy-count" v-else>
        获得的奖杯可以在「我的」页查看
      </div>

      <el-button type="primary" round class="trophy-btn" @click="close">收下奖杯</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  trophies: { type: Array, default: () => [] },
  totalCount: { type: Number, default: null },
  title: { type: String, default: '获得新奖杯！' },
  subtitle: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue', 'close'])
const close = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped>
.trophy-body { text-align: center; padding: 6px 4px 4px; }
.trophy-emoji { font-size: 34px; }
.trophy-title { margin-top: 4px; font-size: 20px; font-weight: 700; color: #222; }
.trophy-subtitle { margin-top: 6px; font-size: 13px; color: #909399; line-height: 1.6; }
.trophy-list { margin-top: 14px; display: flex; flex-direction: column; gap: 8px; }
.trophy-item {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: #FFF9F0; border: 1px solid #FFE4D6; border-radius: 12px;
  padding: 10px 12px;
}
.trophy-item-icon { font-size: 20px; }
.trophy-item-name { font-size: 14px; font-weight: 600; color: #ff6b35; }
.trophy-count { margin-top: 12px; font-size: 13px; color: #666; }
.trophy-btn { margin-top: 16px; width: 160px; height: 40px; }
</style>
