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
      <div class="menu-item" @click="goMyPublish">
        <span>我的发布</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="goMyLike">
        <span>我的点赞</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
    </div>
    <div class="menu-group">
      <div class="menu-item" @click="goMessage">
        <span>消息通知</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="goSetting">
        <span>系统设置</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
    </div>
    <!-- 退出登录 -->
    <div class="logout-wrap">
      <el-button class="btn-logout" type="default" plain @click="handleLogout">退出登录</el-button>
    </div>
    <!-- 底部Tab导航 -->
    <div class="tab-bottom">
      <TabBar />
    </div>
  </div>
</template>
<script setup>
import { ref, onActivated } from "vue";
import { useRouter } from "vue-router";
import { ArrowRight } from "@element-plus/icons-vue";
import { useUserStore } from "@/store/user";
import { storeToRefs } from 'pinia'
import TabBar from "@/components/TabBar.vue";
import { getUserInfoAPI } from '@/api/user'

const router = useRouter();
const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore)

// 统计数据
const stat = ref({
  publishCount: 0,
  likeTotal: 0,
  fansCount: 0
});

// 获取用户统计信息
const getStatInfo = async () => {
  const res = await getUserInfoAPI()
  if (res.code === 200) {
    // 后端返回里面带上这三个统计字段
    stat.value.publishCount = res.data.publishCount || 0
    stat.value.likeTotal = res.data.likeTotal || 0
    stat.value.fansCount = res.data.fansCount || 0
  }
}

// 每次进入页面都会刷新统计（重点：发布完返回这里数字自动更新）
onActivated(() => {
  getStatInfo()
})

const goMyPublish = () => {
  router.push("/my-publish");
};
const goMyLike = () => {
  router.push("/my-like");
};
const goMessage = () => {
  router.push("/message");
};
const goSetting = () => {
  router.push("/setting");
};
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
.my-header {
  /* 和登录按钮一致渐变：#e85d3a → #ff8c42 */
  background: linear-gradient(135deg, #e85d3a, #ff8c42);
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
.user-meta {
  flex: 1;
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
.logout-wrap {
  margin: 24px 16px;
}
.btn-logout {
  width: 100%;
  height: 48px;
  border-radius: 14px;
  font-size: 15px;
  color: #e85d3a;
  border-color: #e85d3a;
}
.tab-bottom {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
}
</style>
