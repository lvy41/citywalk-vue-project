<template>
  <div class="record-container">
    <!-- ================= 列表页 ================= -->
    <div v-if="currentView === 'list'" class="fade-in">
      <!-- 👇 返回主页按钮 👇 -->
      <div class="list-back-btn" @click="goHome">
        <el-icon><ArrowLeft /></el-icon> 返回
      </div>
      <!-- 顶部数据统计卡片 -->
      <div class="stats-card">
        <div class="stat-item">
          <div class="stat-num">4</div>
          <div class="stat-label">完成路线</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item" @click="currentView = 'all-points'" style="cursor: pointer;">
          <div class="stat-num">12</div>
          <div class="stat-label">打卡点位</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-num">3</div>
          <div class="stat-label">收藏路线</div>
        </div>
      </div>

      <!-- 标签页切换 -->
      <el-tabs v-model="activeTab" class="record-tabs">
        <!-- 我的打卡 -->
        <el-tab-pane label="我的打卡" name="checkin">
          <div class="card-list">
            <div v-for="item in checkinList" :key="item.id" class="record-card">
              <img :src="item.coverImage" class="card-cover" alt="封面">
              <div class="card-info">
                <h3 class="card-title link-title" @click="openDetail(item, 'my-detail')">
                  {{ item.routeName }} <span class="arrow">></span>
                </h3>
                <p class="card-desc"><span class="tag-icon">📍</span> 打卡点位：{{ item.pointCount }} 个</p>
                <p class="card-time">完成时间：{{ item.createTime }}</p>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 收藏路线 -->
        <el-tab-pane label="收藏路线" name="favorite">
          <div class="card-list">
            <div v-for="item in favoriteList" :key="item.id" class="record-card">
              <img :src="item.coverImage" class="card-cover" alt="封面">
              <div class="card-info">
                <h3 class="card-title link-title" @click="openDetail(item, 'fav-detail')">
                  {{ item.routeName }} <span class="arrow">></span>
                </h3>
                <p class="card-desc"><span class="tag-icon">🏙️</span> 城市：{{ item.city }}</p>
                <p class="card-desc"><span class="tag-icon">🚶</span> 距离：{{ item.distance }} | 耗时：{{ item.duration }}</p>
                <div class="btn-group">
                  <el-button type="warning" size="small" round class="action-btn yellow-btn" @click.stop="goToRoute(item.id)">去打卡</el-button>
                  <el-button type="danger" size="small" round plain class="action-btn pink-btn" @click.stop="cancelFavorite(item.id)">取消收藏</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- ================= 我的打卡详情页 ================= -->
    <div v-else-if="currentView === 'my-detail'" class="fade-in">
      <div class="detail-header">
        <div class="back-btn" @click="currentView = 'list'">
          <el-icon><ArrowLeft /></el-icon> 返回
        </div>
        <h2 class="detail-title">{{ currentRoute.routeName }}</h2>
        <div class="header-placeholder"></div>
      </div>

      <div class="detail-content">
        <div class="timeline-container">
          <div v-for="(point, index) in currentRoute.points" :key="index" class="point-item">
            <div class="timeline-left">
              <div class="time">{{ point.time }}</div>
              <div class="dot"></div>
              <div class="line" v-if="index !== currentRoute.points.length - 1"></div>
            </div>
            <div class="point-card">
              <img :src="point.image" class="point-img" alt="点位图">
              <div class="point-info">
                <h4 class="point-name">{{ point.name }}</h4>
                <div class="point-meta">
                  <span class="meta-tag transport">🚌 {{ point.transport }}</span>
                  <span class="meta-tag location">📍 {{ point.location }}</span>
                </div>
                <p class="point-desc">{{ point.description }}</p>
                <div class="my-review" v-if="point.review">
                  <div class="review-label">💬 我的评价</div>
                  <div class="review-content">{{ point.review }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= 收藏路线详情页 ================= -->
    <div v-else-if="currentView === 'fav-detail'" class="fade-in">
      <div class="detail-header">
        <div class="back-btn" @click="currentView = 'list'">
          <el-icon><ArrowLeft /></el-icon> 返回
        </div>
        <h2 class="detail-title">路线详情</h2>
        <div class="header-placeholder"></div>
      </div>

      <!-- 顶部大图与简介 -->
      <div class="fav-hero">
        <img :src="currentRoute.coverImage" class="hero-img" alt="封面">
        <div class="hero-info">
          <h2>{{ currentRoute.routeName }}</h2>
          <p>🏙️ {{ currentRoute.city }} | 🚶 {{ currentRoute.distance }} | ⏱️ {{ currentRoute.duration }}</p>
        </div>
      </div>

      <!-- 路线打卡点 -->
      <div class="section-title">📍 路线途径点位</div>
      <div class="detail-content">
        <div class="timeline-container">
          <div v-for="(point, index) in currentRoute.points" :key="index" class="point-item">
            <div class="timeline-left">
              <div class="dot"></div>
              <div class="line" v-if="index !== currentRoute.points.length - 1"></div>
            </div>
            <div class="point-card">
              <img :src="point.image" class="point-img" alt="点位图">
              <div class="point-info">
                <h4 class="point-name">{{ point.name }}</h4>
                <div class="point-meta">
                  <span class="meta-tag location">📍 {{ point.location }}</span>
                </div>
                <p class="point-desc">{{ point.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 评论区 -->
      <div class="section-title">💬 大家的评论 ({{ currentRoute.comments.length }})</div>
      <div class="comment-list">
        <div v-for="cmt in currentRoute.comments" :key="cmt.id" class="comment-item">
          <img :src="cmt.avatar" class="avatar" alt="头像">
          <div class="comment-content">
            <div class="cmt-header">
              <div>
                <span class="cmt-name">{{ cmt.username }}</span>
                <span v-if="cmt.isMine" class="mine-tag">我</span>
                <span v-else-if="cmt.isAuthor" class="author-tag">楼主</span>
              </div>
              <span class="cmt-time">{{ cmt.time }}</span>
            </div>
            <p class="cmt-text">{{ cmt.content }}</p>

            <div class="cmt-actions">
              <div class="action-left">
                <span class="action-btn-text" :class="{ 'is-liked': cmt.isLiked }" @click="toggleLike(cmt)">
                  👍 {{ cmt.likes || 0 }}
                </span>
                <span
                  class="action-btn-text danger-text"
                  v-if="cmt.isMine || isOwner"
                  @click="deleteComment(cmt)"
                >
                  🗑️ 删除
                </span>
              </div>
              <span class="action-btn-text ignore-text" @click="ignoreComment(cmt)">
                忽略
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="comment-input-box">
        <el-input
          v-model="newComment"
          placeholder="说点什么吧，分享你的游玩感受..."
          class="comment-input"
          @keyup.enter="submitComment"
          ref="inputRef"
        />
        <div class="emoji-btn" @click="toggleEmojiPanel">
          😀
        </div>
        <el-button type="primary" class="send-btn" @click="submitComment">发送</el-button>
      </div>

      <div v-if="showEmojiPanel" class="emoji-keyboard-panel" @click.self="showEmojiPanel = false">
        <div class="emoji-grid">
          <span
            v-for="emoji in emojiList"
            :key="emoji"
            class="emoji-item"
            @click="insertEmoji(emoji)"
          >
            {{ emoji }}
          </span>
        </div>
      </div>
    </div>

    <!-- 👇 所有打卡点位汇总页 👇 -->
    <div v-else-if="currentView === 'all-points'" class="fade-in">
      <div class="detail-header">
        <div class="back-btn" @click="currentView = 'list'">
          <el-icon><ArrowLeft /></el-icon> 返回
        </div>
        <h2 class="detail-title">我的打卡足迹</h2>
        <div class="header-placeholder"></div>
      </div>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索城市或打卡点，如：广州、玉林..."
          clearable
          class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 打卡点网格展示 -->
      <div class="checkin-gallery">
        <div
          v-for="point in filteredCheckinPoints"
          :key="point.id"
          class="gallery-card"
        >
          <img :src="point.image" class="gallery-img" alt="打卡图">
          <div class="gallery-info">
            <div class="gallery-header">
              <h3 class="gallery-name">{{ point.name }}</h3>
              <span class="gallery-city">{{ point.city }}</span>
            </div>
            <p class="gallery-desc"><el-icon><Location /></el-icon> {{ point.location }}</p>
            <p class="gallery-time">打卡时间：{{ point.time }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ==========统一底部Tab导航栏，和Home/Publish/My完全一致 ========== -->
    <div class="tab-bar">
      <div class="tab-item" :class="{active: $route.path === '/home'}" @click="$router.push('/home')">
        <div class="tab-icon">🏠</div>
        <div class="tab-text">首页</div>
      </div>
      <div class="tab-item" :class="{active: $route.path === '/map'}" @click="$router.push('/map')">
        <div class="tab-icon">🗺</div>
        <div class="tab-text">探索地图</div>
      </div>
      <div class="tab-item" :class="{active: $route.path === '/publish'}" @click="$router.push('/publish')">
        <div class="tab-icon">✏️</div>
        <div class="tab-text">发布路线</div>
      </div>
      <div class="tab-item" :class="{active: $route.path === '/record'}" @click="$router.push('/record')">
        <div class="tab-icon">📝</div>
        <div class="tab-text">打卡记录</div>
      </div>
      <div class="tab-item" :class="{active: $route.path === '/my'}" @click="$router.push('/my')">
        <div class="tab-icon">👤</div>
        <div class="tab-text">我的</div>
      </div>
    </div>
    <div class="blank-bottom"></div>

  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Search, Location } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const goHome = () => {
  router.push('/home')
}
const currentView = ref('list')
const activeTab = ref('checkin')
const currentRoute = ref({})

const newComment = ref('')
const searchKeyword = ref('')

const showEmojiPanel = ref(false)
const inputRef = ref(null)

const emojiList = ref([
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
  '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
  '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '👍',
  '👎', '👏', '🙏', '❤️', '💔', '🔥', '✨', '🌟', '🎉', '💯'
])

const toggleEmojiPanel = () => {
  showEmojiPanel.value = !showEmojiPanel.value
}

const insertEmoji = (emoji) => {
  newComment.value += emoji
  showEmojiPanel.value = false
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus()
    }
  })
}

const isOwner = ref(false)

const submitComment = () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('评论内容不能为空哦~')
    return
  }
  currentRoute.value.comments.unshift({
    id: Date.now(),
    username: '我 (当前用户)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
    time: '刚刚',
    content: newComment.value,
    isMine: true,
    likes: 0,
    isLiked: false
  })
  newComment.value = ''
  ElMessage.success('评论发布成功！')
}

const toggleLike = (cmt) => {
  if (!cmt.isLiked) {
    cmt.likes = (cmt.likes || 0) + 1
    cmt.isLiked = true
    ElMessage.success('点赞成功！')
  } else {
    cmt.likes = (cmt.likes || 0) - 1
    cmt.isLiked = false
  }
}

const deleteComment = (cmt) => {
  ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = currentRoute.value.comments.findIndex(c => c.id === cmt.id)
    if (index > -1) {
      currentRoute.value.comments.splice(index, 1)
      ElMessage.success('评论已删除')
    }
  }).catch(() => {})
}

const ignoreComment = (cmt) => {
  const index = currentRoute.value.comments.findIndex(c => c.id === cmt.id)
  if (index > -1) {
    currentRoute.value.comments.splice(index, 1)
    ElMessage.info('已忽略此评论')
  }
}

const checkinList = ref([
  {
    id: 1,
    routeName: '广州·珠江夜景漫步',
    coverImage: 'https://images.unsplash.com/photo-1543781737-0d7c1e62c3df?auto=format&fit=crop&w=600&q=80',
    pointCount: 3,
    createTime: '2026-11-01 20:30',
    points: [
      {
        name: '珠江琶醍啤酒文化创意艺术区',
        time: '19:30',
        location: '海珠区阅江西路',
        transport: '打车 15min',
        image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
        description: '傍晚的江风吹着很舒服，很多有格调的酒吧和餐厅，适合拍照打卡。',
        review: '人稍微有点多，但是江景绝美！随便找个清吧喝杯精酿，极度治愈。'
      },
      {
        name: '广州塔（小蛮腰）',
        time: '20:30',
        location: '海珠区阅江西路222号',
        transport: '步行 20min',
        image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
        description: '广州地标建筑，夜景灯光非常绚丽，可以在下面找好角度拍全貌。',
        review: '没上去，就在下面拍了照，灯光变色的瞬间很出片，旁边的海心沙公园也很适合散步。'
      }
    ]
  },
  {
    id: 2,
    routeName: '上海·武康路梧桐区漫游',
    coverImage: 'https://images.unsplash.com/photo-1548625361-ec847ef18515?auto=format&fit=crop&w=600&q=80',
    pointCount: 3,
    createTime: '2026-10-15 14:00',
    points: [
      {
        name: '武康大楼',
        time: '14:00',
        location: '徐汇区淮海中路1850号',
        transport: '地铁10/11号线交通大学站',
        image: 'https://images.unsplash.com/photo-1543169829-9ee2a2a0e7e9?auto=format&fit=crop&w=800&q=80',
        description: '上海标志性的历史建筑，船型外观极具辨识度，路口永远不缺拍照的人。',
        review: '人真的超级多！但是建筑确实好看，在对面买个冰淇淋合影是不错的体验。'
      }
    ]
  },
  {
    id: 3,
    routeName: '北京·胡同里的秋日北平',
    coverImage: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80',
    pointCount: 3,
    createTime: '2026-10-02 09:00',
    points: [
      {
        name: '南锣鼓巷',
        time: '09:00',
        location: '东城区南锣鼓巷胡同',
        transport: '地铁6/8号线南锣鼓巷站',
        image: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=800&q=80',
        description: '北京最古老的街区之一，现在商业化比较严重，但依然保留着胡同的肌理。',
        review: '早上来人比较少，吃个老北京糖油饼，逛逛旁边的小店，感觉还不错。'
      }
    ]
  },
  {
    id: 4,
    routeName: '深圳·从海边到繁华的穿梭',
    coverImage: 'https://images.unsplash.com/photo-1522040969966-403bdf379843?auto=format&fit=crop&w=600&q=80',
    pointCount: 3,
    createTime: '2026-09-20 15:00',
    points: [
      {
        name: '深圳湾公园',
        time: '15:00',
        location: '南山区滨海大道',
        transport: '地铁9号线深圳湾公园站',
        image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80',
        description: '沿着海岸线骑行或散步，对面就是香港，海风很舒服。',
        review: '租个共享单车沿着海边骑，傍晚还能看到绝美的晚霞，可以看到远处的深圳湾大桥。'
      }
    ]
  }
])

const favoriteList = ref([
  {
    id: 5,
    routeName: '成都·玉林路的小酒馆',
    coverImage: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=600&q=80',
    city: '成都',
    distance: '2.5km',
    duration: '1.5h',
    points: [
      {
        name: '玉林西路',
        location: '武侯区玉林西路',
        image: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=800&q=80',
        description: '赵雷歌里的玉林路，充满文艺气息的老街区，很多涂鸦墙和小酒馆。'
      },
      {
        name: '小酒馆（玉林店）',
        location: '武侯区玉林西路55号',
        image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
        description: '《成都》这首歌里唱的那个小酒馆，门口永远有人在拍照打卡。'
      }
    ],
    comments: [
      {
        id: 101,
        username: 'CityWalk爱好者',
        avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80',
        time: '5天前',
        content: '这条路线很适合下午慢慢逛，周边有很多好吃的串串，推荐！',
        isMine: false,
        isAuthor: true,
        likes: 8,
        isLiked: true
      },
      {
        id: 102,
        username: '爱吃火锅的猫',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
        time: '2天前',
        content: '上周刚去过！晚上去氛围特别好，小酒馆外面全是人，不过真的很有感觉。',
        isMine: false,
        likes: 12,
        isLiked: false
      },
      {
        id: 103,
        username: '成都土著',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
        time: '1天前',
        content: '其实玉林路好吃的不仅是串串，旁边的老妈蹄花也是一绝，外地朋友一定要试试！',
        isMine: false,
        likes: 25,
        isLiked: false
      },
      {
        id: 104,
        username: '旅行日记',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
        time: '3小时前',
        content: '人太多了，建议错峰去，或者去旁边的小巷子逛逛，更有市井气息。',
        isMine: false,
        likes: 3,
        isLiked: false
      }
    ]
  },
  {
    id: 6,
    routeName: '杭州·西湖边的浪漫日落',
    coverImage: 'https://images.unsplash.com/photo-1596700813951-92797f5f4ba8?auto=format&fit=crop&w=600&q=80',
    city: '杭州',
    distance: '4.2km',
    duration: '2.5h',
    points: [
      {
        name: '断桥残雪',
        location: '西湖区北山街',
        image: 'https://images.unsplash.com/photo-1574794641889-64e174e5e606?auto=format&fit=crop&w=800&q=80',
        description: '许仙和白娘子相会的地方，虽然没下雪，但湖景依然很美。'
      },
      {
        name: '苏堤春晓',
        location: '西湖区苏堤',
        image: 'https://images.unsplash.com/photo-1506045408156-55ab849ad741?auto=format&fit=crop&w=800&q=80',
        description: '长长的堤坝，两旁种满了树，非常适合散步或者骑行。'
      }
    ],
    comments: [
      {
        id: 201,
        username: '西湖边的风',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
        time: '1周前',
        content: '强烈建议傍晚去苏堤，看夕阳洒在湖面上，真的像画一样。',
        isMine: false,
        likes: 45,
        isLiked: false
      },
      {
        id: 202,
        username: '摄影小达人',
        avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80',
        time: '3天前',
        content: '断桥人真的巨多，想拍空景一定要早起！',
        isMine: false,
        likes: 18,
        isLiked: false
      }
    ]
  },
  {
    id: 7,
    routeName: '重庆·魔幻8D赛博朋克夜游',
    coverImage: 'https://images.unsplash.com/photo-1522040969966-403bdf379843?auto=format&fit=crop&w=600&q=80',
    city: '重庆',
    distance: '3.0km',
    duration: '2h',
    points: [
      {
        name: '洪崖洞',
        location: '渝中区嘉陵江滨江路88号',
        image: 'https://images.unsplash.com/photo-1565099704014-922677c857a7?auto=format&fit=crop&w=800&q=80',
        description: '千与千寻的现实版，晚上亮灯后极其震撼，层层叠叠的吊脚楼。'
      },
      {
        name: '千厮门大桥',
        location: '渝中区千厮门嘉陵江大桥',
        image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
        description: '在桥上看洪崖洞和江景是最佳机位，吹着江风很舒服。'
      }
    ],
    comments: [
      {
        id: 301,
        username: '不吃辣会死星人',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
        time: '4天前',
        content: '洪崖洞里面太挤了，而且商业化很严重，建议就在千厮门大桥上拍个照就行，没必要进去。',
        isMine: false,
        likes: 32,
        isLiked: false
      },
      {
        id: 302,
        username: '山城棒棒军',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
        time: '1天前',
        content: '作为本地人，提醒大家千万别在洪崖洞附近吃火锅，去旁边小巷子里吃才正宗！',
        isMine: false,
        likes: 89,
        isLiked: true
      }
    ]
  }
])

const openDetail = (item, viewName) => {
  if (!item.points || item.points.length === 0) {
    ElMessage.warning('该路线暂无详细打卡记录哦~')
    return
  }
  currentRoute.value = item
  currentView.value = viewName
}

const allCheckinPoints = computed(() => {
  let points = []
  checkinList.value.forEach(route => {
    const cityName = route.routeName.split('·')[0] || '未知'
    route.points.forEach((pt, index) => {
      points.push({
        ...pt,
        id: `${route.id}-${index}`,
        city: cityName
      })
    })
  })
  return points
})

const filteredCheckinPoints = computed(() => {
  if (!searchKeyword.value) return allCheckinPoints.value
  const keyword = searchKeyword.value.toLowerCase()
  return allCheckinPoints.value.filter(pt =>
    pt.city.toLowerCase().includes(keyword) ||
    pt.name.toLowerCase().includes(keyword) ||
    pt.location.toLowerCase().includes(keyword)
  )
})

const goToRoute = (id) => { ElMessage.info(`跳转到地图去打卡路线 ID: ${id}`) }
const cancelFavorite = (id) => { ElMessage.warning(`取消收藏路线 ID: ${id}`) }
</script>

<style scoped>
.record-container {
  padding: 20px 15px;
  background: linear-gradient(180deg, #FFF6F0 0%, #F5F7FA 100%);
  min-height: 100vh;
  padding-bottom: 80px;
}
.fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.stats-card { display: flex; justify-content: space-around; align-items: center; background: linear-gradient(135deg, #FF9A44 0%, #FC6076 100%); color: white; padding: 22px 10px; border-radius: 20px; margin-bottom: 25px; box-shadow: 0 8px 20px rgba(252, 96, 118, 0.25); position: relative; overflow: hidden; }
.stats-card::before { content: ''; position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; }
.stat-item { text-align: center; z-index: 1; }
.stat-num { font-size: 28px; font-weight: 800; margin-bottom: 4px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
.stat-label { font-size: 13px; opacity: 0.95; font-weight: 500; }
.stat-divider { width: 1px; height: 30px; background: rgba(255, 255, 255, 0.3); }

.record-tabs :deep(.el-tabs__nav-wrap::after) { height: 2px; background-color: #FFE4D6; }
.record-tabs :deep(.el-tabs__item) { font-size: 16px; font-weight: 600; color: #909399; }
.record-tabs :deep(.el-tabs__item.is-active) { color: #FF7A45; }
.record-tabs :deep(.el-tabs__active-bar) { background-color: #FF7A45; height: 3px; border-radius: 3px; }

.card-list { display: flex; flex-direction: column; gap: 16px; margin-top: 15px; }
.record-card { display: flex; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04); transition: transform 0.2s ease; }
.record-card:active { transform: scale(0.98); }
.card-cover { width: 110px; height: 110px; object-fit: cover; }
.card-info { flex: 1; padding: 15px; display: flex; flex-direction: column; justify-content: center;}
.link-title { margin: 0; font-size: 17px; font-weight: 700; color: #303133; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: color 0.2s; }
.link-title:active { color: #FF7A45; }
.link-title .arrow { font-size: 14px; color: #C0C4CC; }
.card-desc, .card-time { margin: 6px 0; font-size: 13px; color: #606266; }
.card-time { color: #909399; }
.btn-group { display: flex; gap: 10px; margin-top: 5px;}
.action-btn { font-weight: 600; border: none; padding: 8px 16px; }
.yellow-btn { background: linear-gradient(to right, #FFD15C, #FFA04D); color: #fff; }
.pink-btn { color: #FC6076; border-color: #FFD1D9; background-color: #FFF0F3; }

.detail-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px dashed #FFE4D6; }
.back-btn { display: flex; align-items: center; gap: 4px; font-size: 15px; color: #FF7A45; font-weight: bold; cursor: pointer; background: #FFF0F3; padding: 6px 12px; border-radius: 20px; }
.detail-title { margin: 0; font-size: 18px; color: #303133; font-weight: 800; }
.header-placeholder { width: 70px; }
.section-title { font-size: 16px; font-weight: bold; color: #303133; margin: 20px 0 10px 0; padding-left: 5px; border-left: 4px solid #FF7A45; }

.timeline-container { padding: 10px 0; }
.point-item { display: flex; margin-bottom: 10px; }
.timeline-left { display: flex; flex-direction: column; align-items: center; width: 60px; margin-right: 10px; }
.timeline-left .time { font-size: 12px; font-weight: bold; color: #FF7A45; margin-bottom: 5px; }
.timeline-left .dot { width: 12px; height: 12px; background: #FF7A45; border: 3px solid #FFE4D6; border-radius: 50%; z-index: 1; }
.timeline-left .line { width: 3px; flex: 1; background: #FFE4D6; margin: 5px 0; }
.point-card { flex: 1; background: #fff; border-radius: 16px; padding: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); margin-bottom: 15px; }
.point-img { width: 100%; height: 160px; object-fit: cover; border-radius: 12px; margin-bottom: 12px; }
.point-name { margin: 0 0 10px 0; font-size: 17px; color: #303133; }
.point-meta { display: flex; gap: 10px; margin-bottom: 10px; }
.meta-tag { font-size: 12px; padding: 4px 8px; border-radius: 6px; font-weight: 500; }
.transport { background: #FFF0F3; color: #FC6076; }
.location { background: #F0F9EB; color: #67C23A; }
.point-desc { font-size: 13px; color: #606266; line-height: 1.6; margin: 0; }

.my-review { margin-top: 15px; background: #FFF9F0; border: 1px dashed #FFD15C; padding: 10px; border-radius: 10px; }
.review-label { font-size: 12px; font-weight: bold; color: #E6A23C; margin-bottom: 5px; }
.review-content { font-size: 13px; color: #8a6d3b; line-height: 1.5; }

.fav-hero { margin-bottom: 15px; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.hero-img { width: 100%; height: 180px; object-fit: cover; }
.hero-info { padding: 15px; background: #fff; }
.hero-info h2 { margin: 0 0 8px 0; font-size: 18px; color: #303133; }
.hero-info p { margin: 0; font-size: 13px; color: #909399; }

.comment-list { display: flex; flex-direction: column; gap: 15px; margin-bottom: 70px; }
.comment-item { display: flex; gap: 12px; background: #fff; padding: 15px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.comment-content { flex: 1; }
.cmt-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.cmt-name { font-size: 14px; font-weight: 600; color: #303133; }
.cmt-time { font-size: 12px; color: #C0C4CC; }
.cmt-text { margin: 0 0 10px 0; font-size: 13px; color: #606266; line-height: 1.6; }

.mine-tag { background: #FF9A44; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 5px; }
.author-tag { background: #FC6076; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 5px; }

.cmt-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}
.action-left {
  display: flex;
  gap: 15px;
}
.action-btn-text {
  cursor: pointer;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 3px;
}
.action-btn-text:hover {
  color: #FF7A45;
}
.action-btn-text.is-liked {
  color: #FF7A45;
  font-weight: bold;
}
.danger-text:hover { color: #F56C6C; }
.ignore-text:hover { color: #E6A23C; }

.comment-input-box {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  padding: 10px 15px;
  display: flex;
  gap: 10px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
  box-sizing: border-box;
}
.comment-input {
  flex: 1;
}
.comment-input :deep(.el-input__wrapper) {
  border-radius: 20px;
  background-color: #F5F7FA;
  box-shadow: none;
}
.send-btn {
  border-radius: 20px;
  background: linear-gradient(to right, #FF9A44, #FC6076);
  border: none;
  padding: 0 20px;
}

.search-bar { margin: 10px 0 20px 0; }
.search-input :deep(.el-input__wrapper) {
  border-radius: 20px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  padding: 5px 15px;
}
.checkin-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}
.gallery-card {
  display: flex;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
  transition: transform 0.2s ease;
}
.gallery-card:hover { transform: translateY(-2px); }
.gallery-img { width: 100px; height: 100%; object-fit: cover; }
.gallery-info { flex: 1; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; }
.gallery-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px; }
.gallery-name { margin: 0; font-size: 15px; color: #303133; font-weight: bold; }
.gallery-city { font-size: 11px; color: #FF7A45; background: #FFF0F3; padding: 2px 6px; border-radius: 4px; white-space: nowrap; }
.gallery-desc { margin: 0 0 5px 0; font-size: 12px; color: #909399; display: flex; align-items: center; gap: 3px; }
.gallery-time { margin: 0; font-size: 12px; color: #C0C4CC; }

.list-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 15px;
  color: #FF7A45;
  font-weight: bold;
  cursor: pointer;
  background: #FFF0F3;
  padding: 6px 12px;
  border-radius: 20px;
  margin-bottom: 15px;
  transition: all 0.2s ease;
}
.list-back-btn:hover {
  background: #FFE4D6;
}

.comment-input-box {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  z-index: 100;
  box-sizing: border-box;
}
.comment-input { flex: 1; }
.comment-input :deep(.el-input__wrapper) {
  border-radius: 20px;
  background-color: #F5F7FA;
  box-shadow: none;
  padding: 8px 15px;
}
.emoji-btn {
  font-size: 26px;
  cursor: pointer;
  line-height: 1;
  transition: transform 0.2s;
}
.emoji-btn:active {
  transform: scale(0.9);
}
.send-btn {
  border-radius: 20px;
  background: linear-gradient(to right, #FF9A44, #FC6076);
  border: none;
  padding: 0 20px;
  height: 36px;
}

.emoji-keyboard-panel {
  position: fixed;
  bottom: 60px;
  left: 0;
  width: 100%;
  height: 300px;
  background: #F5F7FA;
  z-index: 99;
  padding: 15px;
  box-sizing: border-box;
  overflow-y: auto;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  animation: slideUp 0.25s ease-out;
}
.emoji-keyboard-panel::-webkit-scrollbar {
  width: 6px;
}
.emoji-keyboard-panel::-webkit-scrollbar-thumb {
  background: #DCDFE6;
  border-radius: 3px;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.emoji-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 10px;
  justify-items: center;
}
.emoji-item {
  font-size: 28px;
  cursor: pointer;
  padding: 5px;
  border-radius: 8px;
  transition: background 0.2s;
  user-select: none;
}
.emoji-item:active {
  background: #E4E7ED;
}

/* =========统一底部Tab栏样式，与Home/Publish/My完全统一 ========= */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background: #fff;
  display: flex;
  border-top: 1px solid #eee;
  z-index: 99;
}
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #666;
  gap: 3px;
  cursor: pointer;
}
.tab-item.active {
  color: #409eff;
}
.tab-icon {
  font-size: 20px;
}
.blank-bottom {
  height: 70px;
}
</style>
