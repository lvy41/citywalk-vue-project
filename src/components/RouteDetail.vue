<template>
  <div class="route-detail-wrapper fade-in">
    <!-- 顶部返回 -->
    <div class="detail-header">
      <div class="back-btn" @click="$emit('back')">
        <el-icon><ArrowLeft /></el-icon> 返回
      </div>
      <h2 class="detail-title">路线详情</h2>
      <div class="header-placeholder"></div>
    </div>

    <!-- 顶部大图与简介 -->
    <div class="fav-hero" v-if="routeData">
      <img :src="routeData.coverImage" class="hero-img" alt="封面">
      <div class="hero-info">
        <h2>{{ routeData.routeName }}</h2>
        <p>🏙️ {{ routeData.city || '未知' }} | 🚶 {{ routeData.distance || '未知' }} | ⏱️ {{ routeData.duration || '未知' }}</p>
      </div>
    </div>

    <!-- 路线打卡点 -->
    <div class="section-title">📍 路线途径点位</div>
    <div class="detail-content">
      <div class="timeline-container">
        <div v-for="(point, index) in routeData.points" :key="index" class="point-item">
          <div class="timeline-left">
            <div class="dot"></div>
            <div class="line" v-if="index !== routeData.points.length - 1"></div>
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
    <div class="section-title">💬 大家的评论 ({{ routeData.comments ? routeData.comments.length : defaultComments.length }})</div>
    <div class="comment-list">
      <!-- 👇 核心保底逻辑：如果外部没传评论，就用默认的假评论 -->
      <div v-for="cmt in (routeData.comments || defaultComments)" :key="cmt.id" class="comment-item">
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

    <!-- 底部悬浮评论输入框 -->
    <div class="comment-input-box">
      <el-input 
        v-model="newComment" 
        placeholder="说点什么吧，分享你的游玩感受..." 
        class="comment-input"
        @keyup.enter="submitComment"
        ref="inputRef"
      />
      <div class="emoji-btn" @click="showEmojiPanel = !showEmojiPanel">
        😀
      </div>
      <el-button type="primary" class="send-btn" @click="submitComment">发送</el-button>
    </div>

    <!-- 微信风格：全宽底部表情面板 -->
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
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

// 👇 默认的假评论数据（当外部没传评论时，作为保底展示）
const defaultComments = [
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
  }
]

// 1. 接收父组件传进来的数据
const props = defineProps({
  routeData: {
    type: Object,
    required: true,
    default: () => ({ points: [], comments: [] })
  }
})

// 2. 触发返回事件
const emit = defineEmits(['back'])

const newComment = ref('')
const isOwner = ref(false)
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

const insertEmoji = (emoji) => {
  newComment.value += emoji
  showEmojiPanel.value = false
  nextTick(() => {
    if (inputRef.value) inputRef.value.focus()
  })
}

const submitComment = () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('评论内容不能为空哦~')
    return
  }
  
  // 如果当前使用的是保底评论，先把它赋给 routeData，再插入
  if (!props.routeData.comments) {
    props.routeData.comments = [...defaultComments]
  }

  props.routeData.comments.unshift({
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
    const list = props.routeData.comments || defaultComments
    const index = list.findIndex(c => c.id === cmt.id)
    if (index > -1) {
      list.splice(index, 1)
      ElMessage.success('评论已删除')
    }
  }).catch(() => {})
}

const ignoreComment = (cmt) => {
  const list = props.routeData.comments || defaultComments
  const index = list.findIndex(c => c.id === cmt.id)
  if (index > -1) {
    list.splice(index, 1)
    ElMessage.info('已忽略此评论')
  }
}
</script>

<style scoped>
/* 详情页及评论区所有样式（原封不动） */
.fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

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

.cmt-actions { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #909399; }
.action-left { display: flex; gap: 15px; }
.action-btn-text { cursor: pointer; transition: color 0.2s; display: flex; align-items: center; gap: 3px; }
.action-btn-text:hover { color: #FF7A45; }
.action-btn-text.is-liked { color: #FF7A45; font-weight: bold; }
.danger-text:hover { color: #F56C6C; }
.ignore-text:hover { color: #E6A23C; }

.comment-input-box { position: fixed; bottom: 0; left: 0; width: 100%; background: #fff; padding: 10px 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); z-index: 100; box-sizing: border-box; }
.comment-input { flex: 1; }
.comment-input :deep(.el-input__wrapper) { border-radius: 20px; background-color: #F5F7FA; box-shadow: none; padding: 8px 15px; }
.emoji-btn { font-size: 26px; cursor: pointer; line-height: 1; transition: transform 0.2s; }
.emoji-btn:active { transform: scale(0.9); }
.send-btn { border-radius: 20px; background: linear-gradient(to right, #FF9A44, #FC6076); border: none; padding: 0 20px; height: 36px; }

.emoji-keyboard-panel { position: fixed; bottom: 60px; left: 0; width: 100%; height: 300px; background: #F5F7FA; z-index: 99; padding: 15px; box-sizing: border-box; overflow-y: auto; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); animation: slideUp 0.25s ease-out; }
.emoji-keyboard-panel::-webkit-scrollbar { width: 6px; }
.emoji-keyboard-panel::-webkit-scrollbar-thumb { background: #DCDFE6; border-radius: 3px; }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.emoji-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)); gap: 10px; justify-items: center; }
.emoji-item { font-size: 28px; cursor: pointer; padding: 5px; border-radius: 8px; transition: background 0.2s; user-select: none; }
.emoji-item:active { background: #E4E7ED; }
</style>