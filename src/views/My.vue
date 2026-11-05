<template>
  <div class="page-my">
    <!-- 顶部头部区域：头像、昵称、用户ID -->
    <div class="my-header">
      <div class="user-profile">
        <el-avatar :size="80" :src="userInfo.avatar" class="avatar">
          <span v-if="!userInfo.avatar">用</span>
        </el-avatar>
        <div class="user-meta">
          <div class="nickname">{{ userInfo.nickname || "匿名用户" }}</div>
          <div class="user-id">用户ID：{{ userInfo.userId }}</div>
        </div>
      </div>
      <!-- 数据统计卡片：发布路线数量、总获赞数量、粉丝数量 -->
      <div class="stat-card">
        <div class="stat-item">
          <div class="num">{{ stat.publishCount }}</div>
          <div class="label">发布路线</div>
        </div>
        <div class="divider"></div>
        <div class="stat-item">
          <div class="num">{{ stat.likeTotal }}</div>
          <div class="label">总获赞</div>
        </div>
        <div class="divider"></div>
        <div class="stat-item">
          <div class="num">{{ stat.fansCount }}</div>
          <div class="label">粉丝</div>
        </div>
      </div>
    </div>
    <!-- 功能菜单列表 -->
    <div class="menu-group">
      <!-- 我的发布：查看自己创建的所有路线，支持编辑、删除、修改路线信息 -->
      <div class="menu-item" @click="goMyPublish">
        <span>我的发布</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
      <!-- 我的点赞：查看点赞过的所有路线 -->
      <div class="menu-item" @click="goMyLike">
        <span>我的点赞</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
    </div>
    <div class="menu-group">
      <!-- 消息通知：评论、点赞的消息提醒（可选功能） -->
      <div class="menu-item" @click="goMessage">
        <span>消息通知</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
      <!-- 系统设置：修改密码、隐私设置、清除缓存、关于我们 -->
      <div class="menu-item" @click="goSetting">
        <span>系统设置</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
    </div>
    <!-- 退出登录 -->
    <div class="logout-wrap">
      <el-button class="btn-logout" type="default" plain @click="handleLogout">退出登录</el-button>
    </div>
    <!-- 底部Tab导航（TabBar，第五个tab为个人中心My） -->
	<div class="tab-bottom">
      <TabBar />
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ArrowRight } from "@element-plus/icons-vue";
import { useUserStore } from "@/store/user";
import TabBar from "@/components/TabBar.vue";
// 接口导入预留
import { getUserInfoAPI } from "@/api/user";
// import { getUserPublishRouteAPI } from "@/api/route"; // 查询用户发布路线接口（my-publish页使用）
// import { getUserLikeListAPI } from "@/api/route";    // 点赞列表查询接口（my-like页使用）
// import { updateUserInfoAPI } from "@/api/user";      // 修改用户信息接口（setting页使用）
const router = useRouter();
const userStore = useUserStore();
// 用户基础信息：头像、昵称、用户ID
const userInfo = ref({
  avatar: "",
  nickname: "",
  userId: ""
});
// 统计数据：发布路线数量、总获赞数量、粉丝数量
const stat = ref({
  publishCount: 0,
  likeTotal: 0,
  fansCount: 0
});
// 获取用户信息+统计数据
const loadUserInfo = async () => {
  try {
    const res = await getUserInfoAPI();
    userInfo.value = res.data;
    stat.value.publishCount = res.data.publishCount || 0;
    stat.value.likeTotal = res.data.likeTotal || 0;
    stat.value.fansCount = res.data.fansCount || 0;
  } catch (err) {
    console.error("获取个人信息失败", err);
  }
};
onMounted(() => {
  loadUserInfo();
});
// 跳转方法
/**
 * 我的发布：查看自己创建的所有路线，支持编辑、删除、修改路线信息
 */
const goMyPublish = () => {
  console.log('👉点击了【我的发布】，isLoggedIn：', userStore.isLoggedIn)
  router.push("/my-publish");
};
/**
 * 我的点赞：查看点赞过的所有路线
 */
const goMyLike = () => {
  console.log('👉点击了【我的点赞】，isLoggedIn：', userStore.isLoggedIn)
  router.push("/my-like");
};
/**
 * 消息通知：评论、点赞的消息提醒（可选功能）
 */
const goMessage = () => {
  console.log('👉点击了【消息通知】，isLoggedIn：', userStore.isLoggedIn)
  router.push("/message");
};
/**
 * 系统设置：修改密码、隐私设置、清除缓存、关于我们
 */
const goSetting = () => {
  console.log('👉点击了【系统设置】，isLoggedIn：', userStore.isLoggedIn)
  router.push("/setting");
};
/**
 * 退出登录，清空用户信息并跳转登录页
 */
const handleLogout = () => {
  userStore.clearUser();
  router.replace("/login");
};
</script>
<style scoped>
.page-my {
  background-color: #f8f8f8;
  min-height: 100vh;
  padding-bottom: 70px;
}
/* 顶部头部：和登录按钮一模一样的橙色渐变 */
.my-header {
  background: linear-gradient(135deg, #ff7a2f, #ffb14a);
  color: #ffffff;
  padding: 44px 20px 24px;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
}
.user-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.avatar {
  border: 2px solid #fff;
}
.user-meta .nickname {
  font-size: 22px;
  font-weight: 600;
}
.user-meta .user-id {
  font-size: 13px;
  opacity: 0.85;
  margin-top: 4px;
}
/* 统计卡片 半透明白色，和你截图效果一致 */
.stat-card {
  background: rgba(255, 255, 255, 0.22);
  border-radius: 16px;
  display: flex;
  text-align: center;
  padding: 18px 0;
}
.stat-item {
  flex: 1;
}
.divider {
  width: 1px;
  background: rgba(255, 255, 255, 0.35);
}
.stat-item .num {
  font-size: 26px;
  font-weight: bold;
}
.stat-item .label {
  font-size: 13px;
  opacity: 0.92;
  margin-top: 4px;
}
/* 菜单分组，大白圆角卡片 */
.menu-group {
  margin: 16px;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}
.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px;
  font-size: 15px;
  color: #222;
  border-bottom: 1px solid #f2f2f2;
  cursor: pointer;
}
.menu-item:last-child {
  border-bottom: none;
}
/* 退出登录按钮 */
.logout-wrap {
  margin: 24px 16px;
}
.btn-logout {
  width: 100%;
  height: 48px;
  border-radius: 14px;
  font-size: 15px;
  color: #ff7a2f;
  border-color: #ff7a2f;
}
/* 底部Tab栏固定 */
.tab-bottom {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
}
</style>
