<template>
  <el-dialog
    :model-value="modelValue"
    width="320px"
    center
    :show-close="false"
    :close-on-click-modal="false"
    class="ach-dialog"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="ach-body">
      <div class="ach-emoji">🎖️</div>
      <div class="ach-title">{{ title }}</div>
      <div class="ach-subtitle" v-if="subtitle">{{ subtitle }}</div>

      <div class="ach-list">
        <div class="ach-item" v-for="(item, index) in achievements" :key="index">
          <span class="ach-item-icon">{{ item.icon || '🏅' }}</span>
          <div class="ach-item-text">
            <div class="ach-item-name">{{ item.titleName || item.name || '新称号' }}</div>
            <div class="ach-item-cond" v-if="item.need">累计 {{ item.need }} 次达成</div>
          </div>
        </div>
      </div>

      <el-button type="primary" round class="ach-btn" @click="close">太棒了</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  achievements: { type: Array, default: () => [] },
  title: { type: String, default: '成就达成！' },
  subtitle: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue', 'close'])

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped>
.ach-body {
  text-align: center;
  padding: 6px 4px 4px;
}
.ach-emoji { font-size: 34px; }
.ach-title { margin-top: 4px; font-size: 20px; font-weight: 700; color: #222; }
.ach-subtitle { margin-top: 6px; font-size: 13px; color: #909399; line-height: 1.6; }
.ach-list { margin-top: 14px; display: flex; flex-direction: column; gap: 8px; }
.ach-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 12px;
  background: #fff8ef;
  border: 1px solid #ffe2bd;
  text-align: left;
}
.ach-item-icon { font-size: 22px; }
.ach-item-text { display: flex; flex-direction: column; }
.ach-item-name { font-size: 15px; font-weight: 700; color: #e8622c; }
.ach-item-cond { margin-top: 2px; font-size: 12px; color: #a0785a; }
.ach-btn { margin-top: 16px; width: 160px; height: 40px; }
</style>
