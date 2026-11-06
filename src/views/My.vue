<template>
  <div class="page-my">
    <!-- 顶部头部区域：头像、昵称、佩戴称号标签、用户ID -->
    <!-- ✅ 修改这里：优先使用用户上传的bgImage，没有就兜底 /pictures/Myback.jpg -->
    <div class="my-header" :style="{backgroundImage: userInfo.bgImage ? `url(${userInfo.bgImage})` : `url(/pictures/Myback.jpg)`}">
      <div class="user-profile">
        <el-avatar :size="80" :src="userInfo.avatar" class="avatar">
          <span v-if="!userInfo.avatar">用</span>
        </el-avatar>
        <div class="user-meta">
          <div class="nickname-row">
            <span class="nickname">{{ userInfo.nickname || "匿名用户" }}</span>
            <span class="title-tag">{{ wearTitle.name }}</span>
          </div>
          <div class="user-id">用户ID：{{ userInfo.userId }}</div>
          <div class="user-ip" v-if="userInfo.ipAddress">IP：{{ userInfo.ipAddress }}</div>
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

    <!-- 奖杯卡片：点击跳转称号页面 -->
    <div class="trophy-card">
      <div class="trophy-left">
        <div class="trophy-title">我的奖杯</div>
        <div class="trophy-num">{{ trophyCount }}</div>
      </div>
      <div class="trophy-right" @click="goTitleList">
        <span>当前称号：{{ wearTitle.name }}</span>
        <el-icon class="arrow"><ArrowRight /></el-icon>
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
      <div class="menu-item" @click="goMyFollow">
        <span>我的关注</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="goRecycle">
        <span>最近删除打卡路线</span>
        <el-icon><ArrowRight /></el-icon>
      </div>
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
import { ref, onActivated, computed } from "vue";
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
// 奖杯数量
const trophyCount = ref(0);

// 全部称号配置
const allTitleList = ref([
  { name: "初入城市", need: 0 },
  { name: "新手行者", need: 1 },
  { name: "打卡爱好者", need: 5 },
  { name: "路线探索达人", need: 10 },
  { name: "资深漫步探险家", need: 20 },
  { name: "城市漫游大师", need: 30 },
])

// 当前佩戴的称号
const wearTitle = ref({ name: "初入城市", need: 0 })

// 跳转称号页面
const goTitleList = () => {
  router.push('/title')
}

// 获取用户信息、奖杯数据
const getStatInfo = async () => {
  const res = await getUserInfoAPI()
  if (res.code === 200) {
    stat.value.publishCount = res.data.publishCount || 0
    stat.value.likeTotal = res.data.likeTotal || 0
    stat.value.fansCount = res.data.fansCount || 0
    trophyCount.value = res.data.trophyCount || 0
  }
}

onActivated(() => {
  getStatInfo()
})

const goMyPublish = () => {
  console.log('点击我的发布')
  router.push("/my-publish");
};
const goMyLike = () => {
  router.push("/my-like");
};
const goMyFollow = () => {
  router.push("/my-follow");
};
const goRecycle = () => {
  router.push("/recycle");
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
  /* 和子页面统一的渐变背景 */
  background: linear-gradient(180deg, #fff7ed 0%, #ffe4c7 45%, #ffd2a8 100%);
  min-height: 100vh;
  padding-bottom: 70px;
}
/* 头部：背景图 + 兜底橙色渐变 */
.my-header {
  background: linear-gradient(140deg, #e65b38, #ff9048);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: #ffffff;
  padding: 44px 20px 24px;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  position: relative;
}
/* 半透明遮罩，保证文字看得清楚 */
.my-header::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.25);
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  z-index: 1;
}
.user-profile, .stat-card {
  position: relative;
  z-index: 2;
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
.nickname-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.user-meta .nickname {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
}
.title-tag {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.28);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.45);
  white-space: nowrap;
}
.user-meta .user-id {
  font-size: 13px;
  opacity: 0.85;
  margin-top: 4px;
}
.user-meta .user-ip {
  font-size: 13px;
  opacity: 0.75;
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
  text-shadow: 0 1px 3px rgba(0,0,0,0.15);
}
.stat-item .label {
  font-size: 13px;
  opacity: 0.92;
  margin-top: 4px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

/* 奖杯卡片 */
.trophy-card {
  margin: 16px;
  background: #fff;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}
.trophy-left .trophy-title {
  font-size: 14px;
  color: #666;
}
.trophy-left .trophy-num {
  font-size: 24px;
  font-weight: bold;
  color: #e85d3a;
  margin-top: 4px;
  line-height: 1.2;
}
.trophy-right {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #999;
  font-size: 14px;
  cursor: pointer;
}
.trophy-right:hover {
  color: #e85d3a;
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
  transition: 0.2s ease;
}
.btn-logout:hover {
  background-color: #fff2ee;
}
.btn-logout:active {
  transform: scale(0.98);
}

.tab-bottom {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
}
</style>
