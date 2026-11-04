<template>
  <div class="page-setting">
    <div class="header">
      <el-button text @click="$router.back()">← 返回</el-button>
      <h2>系统设置</h2>
    </div>

    <div class="content">
      <el-card style="margin-bottom:16px">
        <template #header>
          <span>修改密码</span>
        </template>
        <el-form :model="pwdForm" label-width="80px">
          <el-form-item label="旧密码">
            <el-input v-model="pwdForm.oldPwd" show-password></el-input>
          </el-form-item>
          <el-form-item label="新密码">
            <el-input v-model="pwdForm.newPwd" show-password></el-input>
          </el-form-item>
          <el-form-item label="确认密码">
            <el-input v-model="pwdForm.confirmPwd" show-password></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary">保存修改</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <div class="menu-group">
        <div class="menu-item" @click="handleClearCache">清除本地缓存</div>
        <div class="menu-item">关于我们</div>
      </div>
    </div>

    <div class="tab-bottom">
      <TabBar />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "@/store/user";
import TabBar from "@/components/TabBar.vue";
// import { updateUserInfoAPI } from "@/api/user";

const userStore = useUserStore();

const pwdForm = ref({
  oldPwd:"",
  newPwd:"",
  confirmPwd:""
})

//清除本地缓存（清除pinia状态、localStorage）
const handleClearCache = ()=>{
  userStore.clearUser()
  localStorage.clear()
  alert("缓存已清除，请重新登录")
}
</script>

<style scoped>
.page-setting {
  min-height:100vh;
  background:#f8f8f8;
  padding-bottom:70px;
}
.header{
  display:flex;
  align-items:center;
  gap:12px;
  padding:16px;
  background:#fff;
}
h2{
  margin:0;
  font-size:18px;
}
.content{
  padding:16px;
}
.menu-group{
  background:#fff;
  border-radius:12px;
  overflow:hidden;
}
.menu-item{
  padding:16px;
  border-bottom:1px solid #eee;
  font-size:15px;
  cursor:pointer;
}
.menu-item:last-child{
  border-bottom:none;
}
.tab-bottom{
  position:fixed;
  left:0;
  bottom:0;
  width:100%;
}
</style>
