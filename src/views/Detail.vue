<template>
  <div class="page-detail">
    <!-- 返回按钮 -->
    <div class="back-bar">
      <el-button text @click="$router.back()">← 返回</el-button>
    </div>

    <!-- 路线封面大图 -->
    <div class="cover">
      <img v-if="routeInfo.cover" :src="routeInfo.cover" alt="封面" />
      <div v-else class="no‑cover">暂无封面图</div>
    </div>

    <!-- 顶部操作：点赞、收藏、分享 -->
    <div class="action-bar">
      <el-button
        :type="isLike ? 'primary' : 'default'"
        plain
        @click="handleLike"
      >
        ❤ {{ likeCount }}
      </el-button>
      <el-button
        :type="isCollect ? 'primary' : 'default'"
        plain
        @click="handleCollect"
      >
        ⭐ {{ collectCount }}
      </el-button>
      <el-button plain @click="handleShare">分享</el-button>
    </div>

    <!-- 路线基础信息 -->
    <div class="info-card">
      <h2 class="title">{{ routeInfo.title }}</h2>
      <div class="meta-row">
        <span>城市：{{ routeInfo.city }}</span>
        <span>预计：{{ routeInfo.duration }}</span>
        <span>里程：{{ routeInfo.distance }}km</span>
      </div>
      <div class="tag-wrap">
        <el‑tag v‑for="tag in routeInfo.tagList" :key="tag" size="small">
          {{ tag }}
        </el‑tag>
      </div>
      <div class="author">创作者：{{ routeInfo.authorName }}</div>
      <div class="desc">
        <div class="label">游玩简介：</div>
        <div>{{ routeInfo.description }}</div>
      </div>
    </div>

    <!-- 打卡点列表【核心模块】 -->
    <div class="check‑point‑wrap">
      <h3>打卡点位</h3>
      <div v‑for="(point, index) in pointList" :key="point.id" class="point‑item">
        <div class="point‑num">{{ index + 1 }}</div>
        <div class="point‑content">
          <div class="point‑name">{{ point.pointName }}</div>
          <div class="point‑intro">{{ point.intro }}</div>
          <div class="point‑btn">
            <el‑button size="small" @click="goMap(point.lng, point.lat)">
              前往打卡
            </el‑button>
            <el‑button
              size="small"
              type="success"
              :disabled="point.isChecked"
              @click="handleCheckIn(point)"
            >
              {{ point.isChecked ? "已打卡" : "打卡" }}
            </el‑button>
          </div>
        </div>
      </div>
    </div>

    <!-- 评论区 -->
    <div class="comment‑wrap">
      <h3>评论区</h3>
      <el‑input
        v‑model="commentText"
        placeholder="写下你的游玩感受..."
        type="textarea"
        :rows="2"
      ></el‑input>
      <el‑button type="primary" class="send‑btn" @click="submitComment">
        发布评论
      </el‑button>

      <div class="comment‑list">
        <div v‑if="commentList.length === 0" class="empty‑tip">暂无评论</div>
        <div v‑for="c in commentList" :key="c.id" class="comment‑item">
          <div class="c‑user">{{ c.username }}</div>
          <div class="c‑text">{{ c.content }}</div>
          <div class="c‑time">{{ c.time }}</div>
        </div>
      </div>
    </div>

    <!-- 底部TabBar -->
    <div class="tab‑bottom">
      <TabBar />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue‑router";
import TabBar from "@/components/TabBar.vue";
// 接口预留，后端完成后打开注释
// import { getRouteDetailAPI } from "@/api/route";
// import { likeRouteAPI, collectRouteAPI, checkInPointAPI, addCommentAPI } from "@/api/route";

const route = useRoute();
const router = useRouter();

// 路线id，从路由参数获取 /detail/:id
const routeId = ref(route.params.id);

// 路线基础信息
const routeInfo = ref({
  cover: "",
  title: "",
  city: "",
  duration: "",
  distance: 0,
  tagList: [],
  authorName: "",
  description: ""
});

// 点赞收藏状态
const isLike = ref(false);
const likeCount = ref(0);
const isCollect = ref(false);
const collectCount = ref(0);

// 打卡点列表
const pointList = ref([]);

// 评论
const commentText = ref("");
const commentList = ref([]);

// 加载路线详情
const loadDetail = async () => {
  // 正式对接后端：
  // const res = await getRouteDetailAPI(routeId.value)
  // routeInfo.value = res.data
  // pointList.value = res.data.pointList
  // isLike.value = res.data.isLike
  // likeCount.value = res.data.likeCount
  // isCollect.value = res.data.isCollect
  // collectCount.value = res.data.collectCount
  // commentList.value = res.data.commentList

  // =====模拟假数据，开发预览用=====
  routeInfo.value = {
    cover: "",
    title: "老城区人文漫步路线",
    city: "广州市",
    duration: "2h30min",
    distance: 3.2,
    tagList: ["老街", "人文", "美食"],
    authorName: "测试用户",
    description: "逛老城街巷，感受城市烟火，推荐下午出发，顺路品尝本地小吃。"
  };
  likeCount.value = 28;
  collectCount.value = 42;
  pointList.value = [
    {
      id: 1001,
      pointName: "老街牌坊",
      intro: "历史老牌坊，老城标志性建筑",
      lng: 113.24,
      lat: 23.12,
      isChecked: false
    },
    {
      id: 1002,
      pointName: "百年糖水铺",
      intro: "本地老牌糖水店，必吃双皮奶",
      lng: 113.25,
      lat: 23.13,
      isChecked: false
    }
  ];
  commentList.value = [
    { id: 1, username: "游客A", content: "路线很不错，值得一走", time: "2026‑10‑01" }
  ];
};

// 点赞
const handleLike = async () => {
  console.log("点击点赞");
  // await likeRouteAPI(routeId.value)
  isLike.value = !isLike.value;
  likeCount.value += isLike.value ? 1 : -1;
};

// 收藏
const handleCollect = async () => {
  console.log("点击收藏");
  // await collectRouteAPI(routeId.value)
  isCollect.value = !isCollect.value;
  collectCount.value += isCollect.value ? 1 : -1;
};

// 分享
const handleShare = () => {
  alert("分享功能");
};

// 前往打卡，跳转到地图页并传点位经纬度
const goMap = (lng, lat) => {
  router.push({ path: "/map", query: { lng, lat } });
};

// 打卡提交（核心业务：真实项目这里要传当前定位给后端做距离校验）
const handleCheckIn = async (point) => {
  console.log("打卡点位", point.id);
  // await checkInPointAPI({ routeId: routeId.value, pointId: point.id })
  point.isChecked = true;
  alert("打卡成功！");
};

// 提交评论
const submitComment = async () => {
  if (!commentText.value.trim()) return alert("请输入评论内容");
  // await addCommentAPI({ routeId: routeId.value, content: commentText.value })
  commentList.value.unshift({
    id: Date.now(),
    username: "我",
    content: commentText.value,
    time: new Date().toLocaleDateString()
  });
  commentText.value = "";
};

onMounted(() => {
  loadDetail();
});
</script>

<style scoped>
.page‑detail {
  min‑height: 100vh;
  background‑color: #f8f8f8;
  padding‑bottom: 70px;
}
.back‑bar {
  position: sticky;
  top: 0;
  z‑index: 9;
  background: #ffffffcc;
  padding: 8px 12px;
}
.cover {
  width: 100%;
  height: 200px;
  background: #ddd;
}
.cover img {
  width: 100%;
  height: 100%;
  object‑fit: cover;
}
.no‑cover {
  height: 200px;
  display: flex;
  align‑items: center;
  justify‑content: center;
  color: #888;
}
.action‑bar {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  background: #fff;
}
.info‑card {
  margin: 12px 16px;
  background: #fff;
  border‑radius: 12px;
  padding: 16px;
}
.title {
  font‑size: 20px;
  margin: 0 0 10px;
}
.meta‑row {
  display: flex;
  gap: 14px;
  font‑size: 14px;
  color: #555;
  margin‑bottom: 10px;
}
.tag‑wrap {
  display: flex;
  gap: 8px;
  margin‑bottom: 10px;
}
.author {
  font‑size: 14px;
  color: #666;
  margin‑bottom: 12px;
}
.desc .label {
  font‑weight: bold;
  margin‑bottom:4px;
}
.check‑point‑wrap {
  margin:16px;
  background:#fff;
  border‑radius:12px;
  padding:16px;
}
.point‑item {
  display:flex;
  gap:12px;
  padding:12px 0;
  border‑bottom:1px solid #eee;
}
.point‑item:last‑child {
  border‑bottom:none;
}
.point‑num {
  width:26px;
  height:26px;
  flex‑shrink:0;
  background:#ff7a2f;
  color:#fff;
  border‑radius:50%;
  text‑align:center;
  line‑height:26px;
  font‑size:13px;
}
.point‑content {
  flex:1;
}
.point‑name {
  font‑weight:bold;
  font‑size:15px;
  margin‑bottom:4px;
}
.point‑intro {
  font‑size:13px;
  color:#666;
  margin‑bottom:8px;
}
.point‑btn {
  display:flex;
  gap:8px;
}
.comment‑wrap {
  margin:16px;
  background:#fff;
  border‑radius:12px;
  padding:16px;
}
.send‑btn {
  margin‑top:10px;
}
.empty‑tip {
  text‑align:center;
  color:#999;
  padding:20px 0;
}
.comment‑item {
  padding:10px 0;
  border‑bottom:1px solid #eee;
}
.c‑user {
  font‑weight:bold;
  font‑size:14px;
}
.c‑text {
  font‑size:14px;
  margin:4px 0;
}
.c‑time {
  font‑size:12px;
  color:#999;
}
.tab‑bottom {
  position:fixed;
  left:0;
  bottom:0;
  width:100%;
}
</style>
