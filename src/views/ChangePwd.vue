<template>
  <div class="page-change-pwd">
    <div class="page-header">
      <div class="back" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </div>
      <h2>修改密码</h2>
      <div class="placeholder"></div>
    </div>

    <div class="content-wrap">
      <div class="info-card">
        <div class="form-row">
          <span class="label">原密码</span>
          <el-input
            v-model="formData.oldPwd"
            type="password"
            placeholder="请输入原来的密码"
            class="form-input"
            show-password
          />
        </div>

        <div class="line"></div>

        <div class="form-row">
          <span class="label">新密码</span>
          <el-input
            v-model="formData.newPwd"
            type="password"
            placeholder="请设置新密码（6-16位）"
            class="form-input"
            show-password
          />
        </div>

        <div class="line"></div>

        <div class="form-row">
          <span class="label">确认新密码</span>
          <el-input
            v-model="formData.confirmPwd"
            type="password"
            placeholder="再次输入新密码"
            class="form-input"
            show-password
          />
        </div>
      </div>

      <div class="tip-text">
        提示：密码长度6~16位，建议字母+数字组合，提升账号安全性
      </div>

      <div class="btn-wrap">
        <el-button type="primary" class="save-btn" @click="submit">保存修改</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

const formData = ref({
  oldPwd: '',
  newPwd: '',
  confirmPwd: ''
})

const submit = () => {
  // 前端简单校验，后面对接后端再调用接口
  if (!formData.value.oldPwd) {
    ElMessage.warning('请输入原密码')
    return
  }
  if (!formData.value.newPwd) {
    ElMessage.warning('请输入新密码')
    return
  }
  if (formData.value.newPwd.length < 6 || formData.value.newPwd.length > 16) {
    ElMessage.warning('新密码长度需要6-16位')
    return
  }
  if (formData.value.newPwd !== formData.value.confirmPwd) {
    ElMessage.warning('两次输入的新密码不一致！')
    return
  }
  if (formData.value.newPwd === formData.value.oldPwd) {
    ElMessage.warning('新密码不能和原密码相同')
    return
  }

  // 这里后面对接后端接口：修改密码接口
  ElMessage.success('密码修改成功（前端模拟，待对接后端）')
  router.back()
}
</script>

<style scoped>
.page-change-pwd {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff7ed 0%, #ffe4c7 45%, #ffd2a8 100%);
}

.page-header {
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
.page-header h2 {
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

.content-wrap {
  padding: 20px 16px 40px;
}

.info-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 24px 22px;
  box-shadow: 0 6px 20px rgba(255, 130, 50, 0.1);
}

.form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.line {
  height: 1px;
  background: #f0e2d4;
  margin: 18px 0;
}

.form-input {
  width: 56%;
}

:deep(.form-input .el-input__wrapper) {
  box-shadow: none !important;
  border-radius: 18px;
  background-color: #fffaf4;
}
:deep(.form-input .el-input__inner) {
  background: transparent;
}

.tip-text {
  margin-top: 14px;
  padding: 0 6px;
  font-size: 13px;
  color: #886038;
  line-height: 1.5;
}

.btn-wrap {
  margin-top: 32px;
}

.save-btn {
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 18px;
  font-size: 17px;
  color: #fff;
  background: linear-gradient(135deg, #ff7a2f, #ffb14a);
  box-shadow: 0 6px 16px rgba(255, 122, 47, 0.22);
}
</style>
