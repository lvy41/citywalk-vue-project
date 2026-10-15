<template>
  <div class="admin-login-wrap">
    <el-card class="login-card">
      <h2>CityWalk后台管理登录</h2>
      <el-form ref="loginRef" :model="loginForm" label-width="80px">
        <el-form-item label="账号" prop="username">
          <el-input v-model="loginForm.username" placeholder="管理员账号"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" show-password type="password" placeholder="输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="submitLogin">登录后台</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {useUserStore} from '@/store/user'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const loginRef = ref(null)
const loading = ref(false)

const loginForm = ref({
  username:"",
  password:""
})

const submitLogin = async ()=>{
  loading.value=true
  try {
    const res = await request.post("/api/admin/login", loginForm.value)
    if(res.code===200){
      ElMessage.success("管理员登录成功")
      userStore.setAdminToken(res.data.token)
      router.push("/dashboard")
    }else{
      ElMessage.warning(res.message)
    }
  }catch(e){
    console.error(e)
  }finally {
    loading.value=false
  }
}
</script>

<style scoped>
.admin-login-wrap{
  height:100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  background:#f5f7fa;
}
.login-card{
  width:420px;
  padding:30px;
}
h2{
  text-align:center;
  margin-bottom:24px;
}
</style>
