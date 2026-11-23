<template>
  <div class="manage-page">
    <div class="page-header">
      <h2>🚶 路线管理</h2>
      <span class="sub-title">查看并管理所有用户发布的 CityWalk 路线</span>
    </div>

    <!-- 状态筛选 -->
    <div class="filter-tabs">
      <span
        v-for="t in tabs"
        :key="t.value"
        class="tab"
        :class="{ active: activeStatus === t.value }"
        @click="switchTab(t.value)"
      >
        {{ t.label }}<em>{{ t.count }}</em>
      </span>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-select v-model="cityFilter" placeholder="全部城市" clearable filterable style="width: 200px;">
        <el-option v-for="c in cityOptions" :key="c.id" :label="c.cityName" :value="c.cityName" />
      </el-select>
      <el-input v-model="searchKey" placeholder="搜索路线名称或城市..." clearable style="width: 300px;" />
      <el-button type="primary" class="dopa-btn" @click="loadData">查询</el-button>
    </div>

    <!-- 表格卡片 -->
    <div class="dopa-card">
      <el-table :data="filteredData" style="width: 100%" stripe empty-text="这个分类下还没有路线">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="routeName" label="路线名称" align="center">
          <template #default="scope">
            <span class="route-name">{{ scope.row.routeName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="city" label="所属城市" align="center">
          <template #default="scope">
            <el-tag type="warning" round>{{ scope.row.city }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publisherName" label="发布者" align="center" width="130">
          <template #default="scope">
            {{ scope.row.publisherName || ('用户#' + scope.row.userId) }}
          </template>
        </el-table-column>
        <el-table-column prop="auditStatus" label="状态" align="center" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.auditStatus === 0" type="info" round>待审核</el-tag>
            <el-tag v-if="scope.row.auditStatus === 1" type="success" round>已上线</el-tag>
            <el-tag v-if="scope.row.auditStatus === 2" type="danger" round>已下架</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" align="center">
          <template #default="scope">
            <el-button link type="primary" @click="openDetail(scope.row)">查看</el-button>
            <el-button
              v-if="scope.row.auditStatus !== 1"
              link
              type="success"
              @click="auditRoute(scope.row.id, 1)"
            >通过</el-button>
            <el-button
              v-if="scope.row.auditStatus === 1"
              link
              type="warning"
              @click="auditRoute(scope.row.id, 2)"
            >下架</el-button>
            <el-popconfirm title="确定要删除这条路线吗？" @confirm="delRoute(scope.row.id)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="路线详情"
      width="760px"
      class="route-detail-dialog"
      destroy-on-close
    >
      <div v-loading="detailLoading" class="detail-body">
        <!-- 封面 + 基本信息 -->
        <div class="detail-hero">
          <div class="hero-cover">
            <img v-if="imgOk(detailCover)" :src="detailCover" alt="路线封面" @error="onImgError" />
            <div v-else class="cover-empty">🚶</div>
            <el-tag class="hero-status" :type="statusMeta.type" round effect="dark">{{ statusMeta.text }}</el-tag>
          </div>
          <div class="hero-main">
            <h3 class="detail-name">{{ curRow.routeName || '未命名路线' }}</h3>
            <div class="hero-chips">
              <span class="city-chip">📍 {{ curRow.city || '未设置城市' }}</span>
              <span v-for="t in detailTags" :key="t" class="tag-chip"># {{ t }}</span>
            </div>
            <div class="hero-meta">
              <span>发布者：{{ curRow.publisherName || ('用户#' + curRow.userId) }}</span>
              <span>路线 ID：{{ curRow.id }}</span>
              <span>发布时间：{{ formatTime(curRow.createTime) }}</span>
            </div>
          </div>
        </div>

        <!-- 数据概览 -->
        <div class="stat-row">
          <div class="stat-box"><b>{{ curRow.likeCount || 0 }}</b><span>点赞</span></div>
          <div class="stat-box"><b>{{ curRow.collectCount || 0 }}</b><span>收藏</span></div>
          <div class="stat-box"><b>{{ pointList.length }}</b><span>打卡点</span></div>
        </div>

        <!-- 简介 -->
        <div class="detail-section">
          <h4 class="section-head">路线简介</h4>
          <p class="detail-desc">{{ curRow.description || '作者没有填写简介' }}</p>
        </div>

        <!-- 打卡点 -->
        <div class="detail-section">
          <h4 class="section-head">途径打卡点（{{ pointList.length }}）</h4>
          <div v-if="!pointList.length" class="empty-points">这条路线还没有打卡点数据</div>
          <div v-else class="point-list">
            <div v-for="(p, i) in pointList" :key="p.id || i" class="point-card">
              <div class="point-index">{{ i + 1 }}</div>
              <div class="point-cover">
                <img v-if="imgOk(pointImg(p))" :src="pointImg(p)" alt="点位照片" @error="onImgError" />
                <span v-else>📷</span>
              </div>
              <div class="point-main">
                <div class="point-name-row">
                  <span class="point-name">{{ p.pointName || '未命名点位' }}</span>
                  <span v-if="p.parsed.time" class="mini-chip">⏰ {{ p.parsed.time }}</span>
                  <span v-if="p.parsed.transport" class="mini-chip">🚶 {{ p.parsed.transport }}</span>
                </div>
                <div v-if="p.parsed.address" class="point-line">地址：{{ p.parsed.address }}</div>
                <div v-if="p.parsed.tip" class="point-line">看点：{{ p.parsed.tip }}</div>
                <div v-if="p.parsed.desc" class="point-line desc">{{ p.parsed.desc }}</div>
                <div v-if="p.longitude != null && p.latitude != null" class="point-coord">
                  {{ Number(p.longitude).toFixed(4) }}, {{ Number(p.latitude).toFixed(4) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 评论区 -->
        <div class="detail-section">
          <h4 class="section-head">评论区（{{ detailComments.length }}）</h4>
          <div v-if="!detailComments.length" class="empty-points">这条路线还没有评论</div>
          <div v-else class="comment-list">
            <div v-for="c in commentTree" :key="c.id" class="comment-item">
              <div class="comment-head">
                <img v-if="imgOk(c.avatar)" :src="c.avatar" class="comment-avatar" @error="onImgError" />
                <span v-else class="comment-avatar avatar-empty">🙂</span>
                <span class="comment-user">{{ c.userName || ('用户#' + c.userId) }}</span>
                <span class="comment-time">{{ formatTime(c.createTime) }}</span>
                <span class="comment-like">👍 {{ c.likeCount || 0 }}</span>
              </div>
              <div class="comment-content">{{ c.content }}</div>
              <div v-if="c.replies && c.replies.length" class="reply-list">
                <div v-for="r in c.replies" :key="r.id" class="reply-item">
                  <div class="comment-head">
                    <img v-if="imgOk(r.avatar)" :src="r.avatar" class="comment-avatar sm" @error="onImgError" />
                    <span v-else class="comment-avatar sm avatar-empty">🙂</span>
                    <span class="comment-user">{{ r.userName || ('用户#' + r.userId) }}</span>
                    <span v-if="r.replyToUserName" class="reply-to">回复 {{ r.replyToUserName }}</span>
                    <span class="comment-time">{{ formatTime(r.createTime) }}</span>
                    <span class="comment-like">👍 {{ r.likeCount || 0 }}</span>
                  </div>
                  <div class="comment-content">{{ r.content }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
          <el-button v-if="curRow.auditStatus !== 1" type="success" @click="auditFromDialog(1)">通过并上线</el-button>
          <el-button v-if="curRow.auditStatus === 1" type="warning" @click="auditFromDialog(2)">下架</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/utils/request'
import { getCityListAPI } from '@/api/map'
import { ElMessage } from 'element-plus'

const route = useRoute()
const searchKey = ref('')
const cityFilter = ref('')
const cityOptions = ref([])
const tableData = ref([])
const detailVisible = ref(false)
const curRow = ref({})
// 详情接口拿到的点位与标签
const detailLoading = ref(false)
const detailPoints = ref([])
const detailTags = ref([])
const detailComments = ref([])
// all / 0 待审核 / 1 已上线 / 2 已下架
const activeStatus = ref('all')

const tabs = computed(() => {
  const list = tableData.value
  const count = (s) => list.filter(i => String(i.auditStatus) === String(s)).length
  return [
    { label: '全部', value: 'all', count: list.length },
    { label: '待审核', value: '0', count: count(0) },
    { label: '已上线', value: '1', count: count(1) },
    { label: '已下架', value: '2', count: count(2) }
  ]
})

const switchTab = (v) => { activeStatus.value = v }

// 加载数据 (核心修正：路径去掉了 /api，直接匹配你的后端接口)
const loadData = async () => {
  try {
    // ✅ 正确路径：request.js 里已经配了 /api 前缀
    const res = await request.get('/admin/route/list')
    tableData.value = res && Array.isArray(res.data) ? res.data : []
  } catch (error) {
    ElMessage.error('获取路线列表失败')
  }
}

// 标准城市列表（与发布页城市选择同源）
const loadCityOptions = async () => {
  try {
    const res = await getCityListAPI()
    cityOptions.value = res && Array.isArray(res.data) ? res.data : []
  } catch (error) {
    cityOptions.value = []
  }
}

// 前端本地过滤：先按状态分类，再按关键词；"全部"里待审核排最前
const filteredData = computed(() => {
  let list = tableData.value
  if (activeStatus.value !== 'all') {
    list = list.filter(item => String(item.auditStatus) === activeStatus.value)
  }
  if (cityFilter.value) {
    list = list.filter(item => item.city === cityFilter.value)
  }
  if (searchKey.value) {
    const k = searchKey.value
    list = list.filter(item =>
      (item.routeName || '').includes(k) ||
      (item.city || '').includes(k) ||
      (item.publisherName || '').includes(k)
    )
  }
  // 待审核优先展示，其余按 id 倒序（新发布在前）
  return [...list].sort((a, b) => {
    const pa = a.auditStatus === 0 ? 0 : 1
    const pb = b.auditStatus === 0 ? 0 : 1
    if (pa !== pb) return pa - pb
    return (b.id || 0) - (a.id || 0)
  })
})

// ==================== 路线详情 ====================
const statusMeta = computed(() => {
  const s = curRow.value.auditStatus
  if (s === 0) return { text: '待审核', type: 'info' }
  if (s === 1) return { text: '已上线', type: 'success' }
  if (s === 2) return { text: '已下架', type: 'danger' }
  return { text: '状态未知', type: 'info' }
})

// 封面 / 点位图只认 http 或 base64 data URL，避免脏数据裂图
const isImage = (v) => /^(http|data:image)/.test(String(v || ''))
// 图片地址可能已失效（外链过期、本地文件被删），加载失败时记下来降级成占位图标
const brokenImgs = ref({})
const onImgError = (e) => {
  const src = e && e.target && e.target.getAttribute && e.target.getAttribute('src')
  if (src) brokenImgs.value[src] = true
}
const imgOk = (url) => !!url && !brokenImgs.value[url]
const detailCover = computed(() => (isImage(curRow.value.coverImage) ? curRow.value.coverImage : ''))
const pointImg = (p) => (isImage(p.imageUrl) ? p.imageUrl : '')

// 列表里的时间形如 2026-11-18T08:28:48.000Z，按本地时区展示
const formatTime = (val) => {
  if (!val) return '-'
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return String(val)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 点位 description 是「地址：xx；建议到达 09:00；通勤：步行；看点：xx；介绍：xx」拼装文本，这里拆开展示
const parsePointDesc = (raw) => {
  const text = String(raw || '').trim()
  const out = { address: '', time: '', transport: '', tip: '', desc: '' }
  if (!text) return out
  if (!text.startsWith('地址：')) {
    out.desc = text
    return out
  }
  text.split('；').forEach((seg) => {
    const s = seg.trim()
    if (!s) return
    if (s.startsWith('地址：')) out.address = s.substring(3).trim()
    else if (s.startsWith('建议到达')) {
      const t = s.replace('建议到达', '').trim()
      const idx = t.indexOf('，通勤：')
      if (idx > 0) {
        out.time = t.substring(0, idx).trim()
        out.transport = t.substring(idx + 4).trim()
      } else out.time = t
    } else if (s.startsWith('通勤：')) out.transport = s.substring(3).trim()
    else if (s.startsWith('看点：')) out.tip = s.substring(3).trim()
    else if (s.startsWith('介绍：')) {
      const d = s.substring(3).trim()
      out.desc = out.desc ? `${out.desc}；${d}` : d
    } else out.desc = out.desc ? `${out.desc}；${s}` : s
  })
  return out
}

const pointList = computed(() =>
  detailPoints.value.map(p => ({ ...p, parsed: parsePointDesc(p.description) }))
)

// 评论区：parentId 为 0 的是一级评论，其余按父评论挂到 replies 上（只做一层楼中楼）
const commentTree = computed(() => {
  const all = detailComments.value
  const roots = all.filter(c => !c.parentId)
  return roots.map(c => ({
    ...c,
    replies: all.filter(r => r.parentId && r.parentId === c.id)
  }))
})

const openDetail = async (row) => {
  curRow.value = row
  detailPoints.value = []
  detailComments.value = []
  detailTags.value = Array.isArray(row.tags)
    ? row.tags.map(t => (typeof t === 'string' ? t : t.tagName)).filter(Boolean)
    : []
  detailVisible.value = true
  detailLoading.value = true
  try {
    // 后台专用详情接口：不过滤审核状态，待审核/已下架路线也能看到完整内容
    const res = await request.get(`/admin/route/detail/${row.id}`)
    const vo = res && res.data
    if (res && res.code === 200 && vo) {
      if (vo.route) {
        curRow.value = { ...row, ...vo.route, publisherName: vo.authorName || row.publisherName }
      }
      detailPoints.value = Array.isArray(vo.points) ? vo.points : []
      detailTags.value = Array.isArray(vo.tags) ? vo.tags : []
    }
    // 评论区单独拉一次，失败不影响详情主体
    await loadComments(row.id)
  } catch (error) {
    ElMessage.warning('详情加载失败，仅展示列表里的基础信息')
  } finally {
    detailLoading.value = false
  }
}

const loadComments = async (routeId) => {
  try {
    const res = await request.get(`/admin/route/comments/${routeId}`)
    detailComments.value = res && res.code === 200 && Array.isArray(res.data) ? res.data : []
  } catch (error) {
    detailComments.value = []
  }
}

// 弹窗内直接审核：复用列表的审核逻辑，成功后关闭弹窗并刷新列表
const auditFromDialog = async (status) => {
  await auditRoute(curRow.value.id, status)
  detailVisible.value = false
}

// 审核：1=通过上线，2=下架
const auditRoute = async (id, status) => {
  try {
    const res = await request.put(`/admin/route/audit/${id}/${status}`)
    ElMessage.success(res?.data || res?.msg || (status === 1 ? '已通过' : '已下架'))
    loadData()
  } catch (error) {
    ElMessage.error('审核失败')
  }
}

// 删除路线 (核心修正：路径去掉了 /api)
const delRoute = async (id) => {
  try {
    const res = await request.delete(`/admin/route/delete/${id}`) // ✅ 对应后端 @DeleteMapping("/route/delete/{id}")
    ElMessage.success('路线已删除')
    loadData() // 刷新列表
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  const qs = route.query.status
  if (qs !== undefined && qs !== null && qs !== '') activeStatus.value = String(qs)
  loadData()
  loadCityOptions()
})
</script>

<style scoped>
/* 多巴胺风格 */
.manage-page { padding: 24px; background: #F7F8FA; min-height: calc(100vh - 60px); }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px 0; font-size: 24px; color: #303133; font-weight: 800; }
.sub-title { font-size: 14px; color: #909399; }

.search-bar { margin-bottom: 20px; display: flex; gap: 10px; }

.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.filter-tabs .tab {
  padding: 7px 16px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #FFE0E6;
  color: #606266;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all .2s ease;
}
.filter-tabs .tab em {
  font-style: normal;
  margin-left: 6px;
  color: #909399;
  font-weight: 700;
}
.filter-tabs .tab.active {
  background: linear-gradient(to right, #FF9A44, #FC6076);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 10px rgba(252, 96, 118, 0.25);
}
.filter-tabs .tab.active em { color: #fff; }
.dopa-btn {
  background: linear-gradient(to right, #FF9A44, #FC6076);
  border: none;
  font-weight: bold;
  color: white;
  box-shadow: 0 4px 10px rgba(252, 96, 118, 0.3);
}

.dopa-card {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(255, 154, 68, 0.08);
  border: 1px solid #FFF0F3;
}
:deep(.el-table th.el-table__cell) {
  background-color: #FFF9F0 !important;
  color: #E6A23C;
  font-weight: bold;
  border-bottom: none;
}
:deep(.el-table) { border-radius: 12px; overflow: hidden; }
.route-name { font-weight: bold; color: #303133; }

/* ==================== 路线详情弹窗 ==================== */
.detail-body { min-height: 120px; }
.detail-hero { display: flex; gap: 18px; }
.hero-cover {
  position: relative;
  flex: 0 0 200px;
  width: 200px;
  height: 132px;
  border-radius: 14px;
  overflow: hidden;
  background: linear-gradient(135deg, #FFE4D6, #FFF0F3);
}
.hero-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cover-empty { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 34px; }
.hero-status { position: absolute; top: 8px; left: 8px; }
.hero-main { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
.detail-name { margin: 0 0 8px; font-size: 18px; font-weight: 800; color: #303133; word-break: break-all; }
.hero-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.city-chip { font-size: 12px; padding: 3px 9px; border-radius: 8px; background: #FFF0F3; color: #FC6076; font-weight: 600; }
.tag-chip { font-size: 12px; padding: 3px 9px; border-radius: 8px; background: #FFF9F0; color: #E6A23C; }
.hero-meta { display: flex; flex-wrap: wrap; gap: 6px 18px; font-size: 12.5px; color: #909399; }

.stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
.stat-box {
  background: #FFF9F0;
  border: 1px solid #FFEFDC;
  border-radius: 12px;
  padding: 10px 12px;
  text-align: center;
}
.stat-box b { display: block; font-size: 18px; color: #FF7A45; font-weight: 800; line-height: 1.3; }
.stat-box span { font-size: 12px; color: #909399; }

.detail-section { margin-bottom: 18px; }
.section-head {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  color: #303133;
  padding-left: 9px;
  border-left: 3px solid #FF9A44;
  line-height: 1.2;
}
.detail-desc {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.7;
  background: #F9FAFB;
  border-radius: 10px;
  padding: 10px 12px;
  word-break: break-word;
}
.empty-points { font-size: 13px; color: #A8ABB2; padding: 14px 0; }

.point-list { display: flex; flex-direction: column; gap: 10px; }
.point-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border: 1px solid #F0F2F5;
  border-radius: 12px;
  background: #fff;
}
.point-index {
  flex: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #FF9A44, #FC6076);
}
.point-cover {
  flex: none;
  width: 60px;
  height: 60px;
  border-radius: 10px;
  overflow: hidden;
  background: #F5F7FA;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #C0C4CC;
}
.point-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
.point-main { flex: 1; min-width: 0; }
.point-name-row { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 4px; }
.point-name { font-size: 14px; font-weight: 700; color: #303133; word-break: break-all; }
.mini-chip { font-size: 11.5px; padding: 2px 8px; border-radius: 7px; background: #F2F6FF; color: #409EFF; }
.point-line { font-size: 12.5px; color: #606266; line-height: 1.6; word-break: break-word; }
.point-line.desc { color: #909399; margin-top: 2px; }
.point-coord { font-size: 11.5px; color: #C0C4CC; margin-top: 4px; }

.dialog-footer { display: flex; justify-content: flex-end; gap: 8px; }

/* 评论区 */
.comment-list { display: flex; flex-direction: column; gap: 10px; }
.comment-item { background: #FAFAFB; border: 1px solid #EFEFF2; border-radius: 10px; padding: 10px 12px; }
.comment-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.comment-avatar { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; flex: none; }
.comment-avatar.sm { width: 20px; height: 20px; }
.avatar-empty { display: inline-flex; align-items: center; justify-content: center; background: #FFF1E6; font-size: 12px; }
.comment-user { font-size: 13px; font-weight: 600; color: #303133; }
.comment-time { font-size: 11.5px; color: #A8ABB2; }
.comment-like { margin-left: auto; font-size: 11.5px; color: #F08C4C; }
.comment-content { margin: 6px 0 0 32px; font-size: 13px; color: #494949; line-height: 1.65; word-break: break-word; }
.reply-list { margin: 8px 0 0 32px; padding-left: 10px; border-left: 2px solid #FFE6D5; display: flex; flex-direction: column; gap: 8px; }
.reply-item { background: #fff; border-radius: 8px; padding: 8px 10px; }
.reply-to { font-size: 11.5px; color: #909399; }
</style>