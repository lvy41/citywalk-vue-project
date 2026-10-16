<template>
  <div class="privacy-page">
    <div class="container">
      <div class="header">
        <el-button class="close-btn" @click="$router.back()" circle>
        <span class="close-icon">×</span>
        </el-button>
        <h2>CityWalk《隐私协议》</h2>
        </div>
      <div class="content">
        <h3>隐私协议</h3>
        <p>更新日期：2026-10-16</p>
        <p>欢迎使用 CityWalk（下称“本应用”），在使用本应用前，请仔细阅读本《隐私协议》。本协议用于说明我们如何收集、使用、存储、保护您的个人信息。使用本应用即代表您同意本协议全部条款。</p>

        <h4>一、信息收集</h4>
        <p>1. 账号信息：您注册登录时提交的用户名、密码（密码经过加密存储，我们不会明文保存）。</p>
        <p>2. 位置信息：当您开启定位权限后，我们会获取您的地理位置，用于路线打卡、附近路线推荐功能。仅在您主动授权后才会获取定位，您可以随时在手机系统设置关闭定位权限。</p>
        <p>3. 日志信息：APP运行产生的基础访问日志，用于排查程序故障，不含敏感个人信息。</p>

        <h4>二、信息使用</h4>
        <p>1. 用于账号登录、身份校验，保障账号安全。</p>
        <p>2. 根据您的位置，展示附近城市漫步路线、打卡记录。</p>
        <p>3. 用于功能优化、故障排查，提升使用体验。</p>
        <p>我们不会将您的个人信息出售、租赁给任何第三方。</p>

        <h4>三、信息存储与保护</h4>
        <p>您的数据存储在安全服务器，采用加密技术保护数据，防止信息泄露、篡改、丢失。仅授权工作人员可访问数据。</p>

        <h4>四、权限说明</h4>
        <p>定位权限：属于可选授权，不开启定位仅影响打卡和附近路线推荐功能，不影响基础登录浏览。</p>

        <h4>五、未成年人保护</h4>
        <p>本应用面向全年龄段用户，未成年人请在监护人陪同下阅读并使用本应用。</p>

        <h4>六、协议修改</h4>
        <p>我们有权更新本隐私协议，更新后会在APP内进行提示，继续使用代表接受更新后的协议。</p>

        <h4>七、联系我们</h4>
        <p>如有隐私相关疑问，可通过项目反馈入口联系开发团队。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.close-icon {
  font-size: 18px;
  color: #666;
  line-height: 1;
}

.privacy-page {
  width: 100vw;
  min-height: 100vh;
  background: #285289;
  padding: 30px 20px;
  box-sizing: border-box;
}
.container {
  max-width:700px;
  margin:0 auto;
  background:#fff;
  border-radius:16px;
  padding:24px;
}
.header{
  display:flex;
  align-items:center;
  gap:12px;
  margin-bottom:20px;
}
.content {
  line-height:1.7;
  color:#333;
  font-size:15px;
}
h3{
  text-align:center;
}
</style>
