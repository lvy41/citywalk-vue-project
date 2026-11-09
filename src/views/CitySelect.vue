<template>
  <div class="city-select-page">
    <!-- 顶部搜索栏 -->
    <div class="search-bar">
      <el-button text @click="$router.back()" class="back-icon">
        <span class="back-btn-style">＜ 返回</span>
      </el-button>
      <el-input
        v-model="searchKey"
        placeholder="省份/城市等地点"
        class="search-input"
        clearable
        @keyup.enter="handleSearch"
      />
      <el-button text @click="handleSearch" class="search-btn">搜索</el-button>
    </div>
    <!-- Tab栏：第一个标签改为【历史搜索】 -->
    <el-tabs v-model="activeTab" class="city-tabs">
      <el-tab-pane label="历史搜索" name="myAddr">
        <div class="location-wrap">
          <div v-if="historyList.length > 0" class="history-block">
            <div class="history-item" v-for="(item, idx) in historyList" :key="idx">
              <span @click="selectCity(item)" class="history-name">{{ item }}</span>
              <el-button text type="danger" @click="deleteHistory(idx)" class="del-btn">🗑️</el-button>
            </div>
          </div>
          <div v-else class="empty-history">暂无历史搜索</div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="国内城市" name="china">
        <!-- 推荐城市区域 -->
        <div class="section">
          <div class="section-title">推荐城市</div>
          <div class="recommend-wrap">
            <div
              class="city-tag"
              v-for="item in recommendCityList"
              :key="item"
              @click="selectCity(item)"
            >
              {{item}}
            </div>
          </div>
        </div>
        <!-- 字母索引 -->
        <div class="section">
          <div class="section-title">城市开头字母</div>
          <div class="letter-wrap">
            <div
              class="letter-item"
              v-for="letter in letterList"
              :key="letter"
              @click="scrollToLetter(letter)"
            >
              {{letter}}
            </div>
          </div>
        </div>
        <!-- 字母分组城市列表 -->
        <div class="city-list-wrap" ref="listRef">
          <div
            class="letter-group"
            v-for="group in groupCityList"
            :key="group.letter"
            :ref="el => setGroupRef(el, group.letter)"
          >
            <div class="group-letter">{{group.letter}}</div>
            <div
              class="city-item"
              v-for="city in group.list"
              :key="city"
              @click="selectCity(city)"
            >
              {{city}}
            </div>
          </div>
        </div>
        <!-- 右侧悬浮字母导航 -->
        <div class="side-letter">
          <div
            class="side-letter-item"
            v-for="letter in letterList"
            :key="letter"
            @click="scrollToLetter(letter)"
          >
            {{letter}}
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
const router = useRouter()
const searchKey = ref('')
const activeTab = ref('myAddr')
const listRef = ref(null)
const groupDomMap = ref({})

// ========== 历史搜索记录 localStorage ==========
const HISTORY_KEY = 'citywalk_city_history'
const historyList = ref([])
// 读取本地历史
const loadHistory = () => {
  const str = localStorage.getItem(HISTORY_KEY)
  if (str) {
    historyList.value = JSON.parse(str)
  }
}
// 保存到本地
const saveHistory = () => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(historyList.value))
}
// 新增历史（去重，最多保存8条）
const addHistory = (cityName) => {
  let arr = historyList.value.filter(item => item !== cityName)
  arr.unshift(cityName)
  if (arr.length > 8) arr = arr.slice(0,8)
  historyList.value = arr
  saveHistory()
}
// 删除单条历史
const deleteHistory = (index) => {
  historyList.value.splice(index, 1)
  saveHistory()
}
// ========== 城市选择（点击城市，存入历史，跳转citywalk详情） ==========
const selectCity = (cityName) => {
  addHistory(cityName)
  router.push(`/city/${cityName}`)
}
// 点击搜索 / 回车搜索，跳转
const handleSearch = () => {
  const city = searchKey.value.trim()
  if(!city) return
  selectCity(city)
}
// A-Z字母
const letterList = ref(['A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T','W','X','Y','Z'])
// 推荐城市
const recommendCityList = ref(['广州','北京','上海','深圳','成都','武汉','杭州','天津','西安','南京','重庆','长沙'])
// 全部国内城市，按首字母分组
const allCityGroup = ref([
  { letter:'A', list:['阿坝','阿城区','阿克苏','阿拉尔','阿拉善盟'] },
  { letter:'B', list:['北京','保定','包头','巴彦淖尔','白山'] },
  { letter:'C', list:['成都','重庆','长沙','常州','沧州'] },
  { letter:'D', list:['达拉特旗','达州','大安市','大厂回族自治县','大丰','大理','大连','大庆','大同'] },
  { letter:'F', list:['福州','佛山','阜阳','抚顺'] },
  { letter:'G', list:['广州','贵阳','桂林','赣州','广元'] },
  { letter:'H', list:['杭州','合肥','海口','哈尔滨','惠州'] },
  { letter:'J', list:['济南','嘉兴','金华','九江','荆州'] },
  { letter:'K', list:['昆明','开封','喀什'] },
  { letter:'L', list:['洛阳','丽江','拉萨','兰州','连云港'] },
  { letter:'M', list:['马鞍山','茂名','梅州'] },
  { letter:'N', list:['南京','宁波','南宁','南昌'] },
  { letter:'P', list:['莆田','盘锦','平顶山'] },
  { letter:'Q', list:['青岛','泉州','衢州','秦皇岛'] },
  { letter:'R', list:['日照','日喀则'] },
  { letter:'S', list:['上海','苏州','三亚','汕头','邵阳'] },
  { letter:'T', list:['天津','太原','唐山','泰安','台州'] },
  { letter:'W', list:['武汉','无锡','威海','潍坊','温州'] },
  { letter:'X', list:['西安','厦门','襄阳','孝感','西宁'] },
  { letter:'Y', list:['烟台','扬州','盐城','银川','宜宾'] },
  { letter:'Z', list:['郑州','珠海','漳州','湛江','淄博'] },
])
// 搜索过滤
const groupCityList = computed(()=>{
  if(!searchKey.value) return allCityGroup.value
  return allCityGroup.value.map(g=>{
    return {
      letter: g.letter,
      list: g.list.filter(city=> city.includes(searchKey.value))
    }
  }).filter(g=>g.list.length>0)
})
// 保存分组dom引用
const setGroupRef = (el, letter)=>{
  if(el) groupDomMap.value[letter] = el
}
// 点击字母，滚动到对应分组
const scrollToLetter = (letter)=>{
  const dom = groupDomMap.value[letter]
  if(dom){
    dom.scrollIntoView({behavior:'smooth'})
  }
}
onMounted(()=>{
  loadHistory()
})
</script>
<style scoped>
.city-select-page{
  background:#fff;
  min-height:100vh;
}
.search-bar{
  display:flex;
  align-items:center;
  gap:8px;
  padding:12px 16px;
}
.back-icon{
  padding: 6px 10px !important;
}
.back-btn-style{
  color:#ff6b35;
  font-size:17px;
  font-weight:500;
}
.search-input{
  flex:1;
}
.search-btn{
  color:#ff6b35;
  font-size:16px;
  white-space:nowrap;
}
.city-tabs{
  --el-tabs-header-height:44px;
}
.location-wrap{
  padding:24px 16px;
}
.history-block{
  margin-top:0;
}
.history-item{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:12px 10px;
  border-bottom:1px solid #eee;
}
.history-name{
  font-size:16px;
  cursor:pointer;
}
.del-btn{
  padding:0 4px;
  font-size:16px;
}
.empty-history{
  text-align:center;
  padding:40px 0;
  color:#999;
}
.section{
  padding:12px 16px;
}
.section-title{
  font-size:14px;
  color:#666;
  margin-bottom:10px;
}
.recommend-wrap{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
}
.city-tag{
  padding:6px 14px;
  background:#f5f5f5;
  border-radius:20px;
  font-size:14px;
  cursor:pointer;
}
.letter-wrap{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
}
.letter-item{
  width:44px;
  height:44px;
  background:#f5f5f5;
  border-radius:8px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:15px;
  cursor:pointer;
}
.city-list-wrap{
  padding:0 16px;
  position:relative;
  padding-right:36px;
}
.letter-group{
  padding:8px 0;
  border-bottom:1px solid #eee;
}
.group-letter{
  font-size:15px;
  color:#888;
  padding:4px 0;
}
.city-item{
  padding:12px 0;
  font-size:16px;
  cursor:pointer;
}
.side-letter{
  position:fixed;
  right:6px;
  top:220px;
  display:flex;
  flex-direction:column;
  gap:4px;
}
.side-letter-item{
  font-size:12px;
  color:#666;
  text-align:center;
  width:24px;
  cursor:pointer;
}
</style>
