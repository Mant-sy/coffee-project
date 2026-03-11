<template>
  <div class="screen-wrapper">
    <div class="screen-container" :style="containerStyle">
      <header class="screen-header">
        <div>
          <img :src="headerSrc" alt="">
        </div>
        <div class="title-left"></div>
        <span class="title">咖啡门店数字孪生大屏</span>
        <div class="title-right">
          <div class="upload-btn" @click="showUploadModal = true">
            <span class="iconfont icon-upload"></span>
            <span>上传数据</span>
          </div>
          <div class="delete-btn" @click="showDeleteModal = true">
            <span class="iconfont icon-delete"></span>
            <span>清除数据</span>
          </div>
          <img :src="themeSrc" class="qiehuan" @click="handleChangeTheme">
          <span class="datetime">{{ currentTime }}</span>
        </div>
      </header>
      <div class="screen-body">
        <section class="screen-left">
          <div class="chart-wrapper border-tech-1" :style="moduleStyle">
            <div class="corner corner-tl"></div>
            <div class="corner corner-tr"></div>
            <div class="corner corner-bl"></div>
            <div class="corner corner-br"></div>
            <TrendPrediction ref="trendPrediction"></TrendPrediction>
            <div class="resize">
              <span @click="changeSize('trendPrediction')" class="iconfont icon-expand-alt"></span>
            </div>
          </div>
          <div class="chart-wrapper border-tech-2" :style="moduleStyle">
            <div class="corner corner-tl"></div>
            <div class="corner corner-tr"></div>
            <div class="corner corner-bl"></div>
            <div class="corner corner-br"></div>
            <ProductRank ref="productRank"></ProductRank>
            <div class="resize">
              <span @click="changeSize('productRank')" class="iconfont icon-expand-alt"></span>
            </div>
          </div>
        </section>
        <section class="screen-center">
          <div class="chart-wrapper map-wrapper border-tech-3" :style="moduleStyle">
            <div class="corner corner-tl"></div>
            <div class="corner corner-tr"></div>
            <div class="corner corner-bl"></div>
            <div class="corner corner-br"></div>
            <Map ref="map"></Map>
            <div class="resize">
              <span @click="changeSize('map')" class="iconfont icon-expand-alt"></span>
            </div>
          </div>
          <div class="chart-wrapper border-tech-4" :style="moduleStyle">
            <div class="corner corner-tl"></div>
            <div class="corner corner-tr"></div>
            <div class="corner corner-bl"></div>
            <div class="corner corner-br"></div>
            <Store3D ref="store3d" store-id="S001" :store-name="store3DName" :sales-data="store3DSalesData" :products-data="store3DProductsData"></Store3D>
            <div class="resize">
              <span @click="changeSize('store3d')" class="iconfont icon-expand-alt"></span>
            </div>
          </div>
        </section>
        <section class="screen-right">
          <div class="chart-wrapper border-tech-5" :style="moduleStyle">
            <div class="corner corner-tl"></div>
            <div class="corner corner-tr"></div>
            <div class="corner corner-bl"></div>
            <div class="corner corner-br"></div>
            <Seller ref="seller"></Seller>
            <div class="resize">
              <span @click="changeSize('seller')" class="iconfont icon-expand-alt"></span>
            </div>
          </div>
          <div class="chart-wrapper border-tech-6" :style="moduleStyle">
            <div class="corner corner-tl"></div>
            <div class="corner corner-tr"></div>
            <div class="corner corner-bl"></div>
            <div class="corner corner-br"></div>
            <Hot ref="hot"></Hot>
            <div class="resize">
              <span @click="changeSize('hot')" class="iconfont icon-expand-alt"></span>
            </div>
          </div>
        </section>
      </div>
    </div>
    
    <!-- 全屏模块容器 - 使用Teleport移到body下 -->
    <Teleport to="body">
      <div v-if="currentFullScreen" class="fullscreen-overlay" :class="store.theme">
        <div class="fullscreen-content">
          <TrendPrediction v-if="currentFullScreen === 'trendPrediction'" ref="trendPredictionFull"></TrendPrediction>
          <ProductRank v-else-if="currentFullScreen === 'productRank'" ref="productRankFull"></ProductRank>
          <Map v-else-if="currentFullScreen === 'map'" ref="mapFull"></Map>
          <Store3D v-else-if="currentFullScreen === 'store3d'" ref="store3dFull" store-id="S001" :store-name="store3DName" :sales-data="store3DSalesData" :products-data="store3DProductsData"></Store3D>
          <Seller v-else-if="currentFullScreen === 'seller'" ref="sellerFull"></Seller>
          <Hot v-else-if="currentFullScreen === 'hot'" ref="hotFull"></Hot>
        </div>
        <div class="fullscreen-close" @click="closeFullScreen">
          <span class="iconfont icon-compress-alt"></span>
        </div>
      </div>
    </Teleport>
    
    <!-- 数据上传弹窗 -->
    <div v-if="showUploadModal" class="upload-modal-overlay" @click.self="showUploadModal = false">
      <div class="upload-modal">
        <div class="modal-header">
          <h3>数据上传</h3>
          <span class="close-btn" @click="showUploadModal = false">&times;</span>
        </div>
        <div class="modal-body">
          <div class="upload-tip">
            <p>⚠️ 请按以下顺序上传数据：</p>
            <ol>
              <li>门店数据</li>
              <li>产品数据</li>
              <li>销售数据</li>
            </ol>
          </div>
          <div class="upload-type">
            <label>数据类型：</label>
            <select v-model="uploadType">
              <option value="stores">① 门店数据</option>
              <option value="products">② 产品数据</option>
              <option value="sales">③ 销售数据</option>
            </select>
          </div>
          <div class="upload-file">
            <input type="file" ref="fileInput" accept=".csv" @change="handleFileSelect" style="display: none">
            <button class="select-file-btn" @click="$refs.fileInput.click()">选择CSV文件</button>
            <span class="file-name" v-if="selectedFile">{{ selectedFile.name }}</span>
          </div>
          <div class="upload-actions">
            <button class="upload-submit-btn" @click="uploadData" :disabled="!selectedFile || uploading">
              {{ uploading ? '上传中...' : '确认上传' }}
            </button>
          </div>
          <div class="upload-result" v-if="uploadResult">
            <p :class="uploadResult.success ? 'success' : 'error'">{{ uploadResult.message }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 数据清除弹窗 -->
    <div v-if="showDeleteModal" class="upload-modal-overlay" @click.self="showDeleteModal = false">
      <div class="upload-modal">
        <div class="modal-header">
          <h3>清除数据</h3>
          <span class="close-btn" @click="showDeleteModal = false">&times;</span>
        </div>
        <div class="modal-body">
          <div class="delete-tip">
            <p>⚠️ 选择要清除的数据类型：</p>
          </div>
          <div class="delete-options">
            <label class="delete-option">
              <input type="checkbox" v-model="deleteTypes.stores">
              <span>门店数据</span>
            </label>
            <label class="delete-option">
              <input type="checkbox" v-model="deleteTypes.products">
              <span>产品数据</span>
            </label>
            <label class="delete-option">
              <input type="checkbox" v-model="deleteTypes.sales">
              <span>销售数据</span>
            </label>
            <label class="delete-option delete-all">
              <input type="checkbox" v-model="deleteAll" @change="toggleDeleteAll">
              <span>全部清除</span>
            </label>
          </div>
          <div class="upload-actions">
            <button class="delete-submit-btn" @click="deleteData" :disabled="!hasSelectedType || deleting">
              {{ deleting ? '清除中...' : '确认清除' }}
            </button>
          </div>
          <div class="upload-result" v-if="deleteResult">
            <p :class="deleteResult.success ? 'success' : 'error'">{{ deleteResult.message }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useMainStore } from '@/store'
import Hot from '@/components/Hot.vue'
import Map from '@/components/Map.vue'
import Seller from '@/components/Seller.vue'
import TrendPrediction from '@/components/TrendPrediction.vue'
import Store3D from '@/components/Store3D.vue'
import ProductRank from '@/components/ProductRank.vue'
import { getThemeValue } from '@/utils/theme_utils'
import socketService from '@/utils/socket_service'
import axios from 'axios'

const store = useMainStore()
const trendPrediction = ref(null)
const seller = ref(null)
const map = ref(null)
const hot = ref(null)
const store3d = ref(null)
const productRank = ref(null)
const currentTime = ref('')
const store3DName = ref('门店3D环境 - 星巴克(银川金凤万达店)')
const store3DSalesData = ref([])
const store3DProductsData = ref([])

const currentFullScreen = ref(null)

const trendPredictionFull = ref(null)
const productRankFull = ref(null)
const mapFull = ref(null)
const store3dFull = ref(null)
const sellerFull = ref(null)
const hotFull = ref(null)

const showUploadModal = ref(false)
const uploadType = ref('stores')
const selectedFile = ref(null)
const uploading = ref(false)
const uploadResult = ref(null)

const showDeleteModal = ref(false)
const deleteTypes = ref({
  stores: false,
  products: false,
  sales: false
})
const deleteAll = ref(false)
const deleting = ref(false)
const deleteResult = ref(null)

const hasSelectedType = computed(() => {
  return deleteTypes.value.stores || deleteTypes.value.products || deleteTypes.value.sales
})

const toggleDeleteAll = () => {
  if (deleteAll.value) {
    deleteTypes.value = { stores: true, products: true, sales: true }
  } else {
    deleteTypes.value = { stores: false, products: false, sales: false }
  }
}

const deleteData = async () => {
  if (!hasSelectedType.value) return
  
  deleting.value = true
  deleteResult.value = null
  
  try {
    const types = []
    if (deleteTypes.value.stores) types.push('stores')
    if (deleteTypes.value.products) types.push('products')
    if (deleteTypes.value.sales) types.push('sales')
    
    const response = await axios.post('clear/data', { types })
    
    deleteResult.value = response.data
    
    if (response.data.success) {
      setTimeout(() => {
        showDeleteModal.value = false
        deleteTypes.value = { stores: false, products: false, sales: false }
        deleteAll.value = false
        window.location.reload()
      }, 1500)
    }
  } catch (error) {
    deleteResult.value = {
      success: false,
      message: error.response?.data?.error || error.message || '清除失败'
    }
  } finally {
    deleting.value = false
  }
}

const headerSrc = computed(() => {
  return '/static/img/' + getThemeValue(store.theme).headerBorderSrc
})

const themeSrc = computed(() => {
  return '/static/img/' + getThemeValue(store.theme).themeSrc
})

const containerStyle = computed(() => {
  const theme = getThemeValue(store.theme)
  return {
    backgroundColor: theme.backgroundColor,
    color: theme.titleColor
  }
})

const moduleStyle = computed(() => {
  const theme = getThemeValue(store.theme)
  return {
    background: theme.moduleBg,
    border: `1px solid ${theme.moduleBorder}`,
    boxShadow: `0 4px 20px ${theme.moduleShadow}`
  }
})

const updateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const changeSize = (chartName) => {
  currentFullScreen.value = chartName
  nextTick(() => {
    setTimeout(() => {
      adaptFullScreen(chartName)
    }, 100)
  })
}

const closeFullScreen = () => {
  currentFullScreen.value = null
  resize()
}

const adaptFullScreen = (chartName) => {
  const refs = {
    trendPrediction: trendPredictionFull,
    productRank: productRankFull,
    map: mapFull,
    store3d: store3dFull,
    seller: sellerFull,
    hot: hotFull
  }
  
  const ref = refs[chartName]
  if (ref && ref.value && ref.value.screenAdapter) {
    ref.value.screenAdapter()
  }
}

watch(currentFullScreen, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const handleChangeTheme = () => {
  store.changeTheme()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    uploadResult.value = null
  }
}

const uploadData = async () => {
  if (!selectedFile.value) return
  
  uploading.value = true
  uploadResult.value = null
  
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('type', uploadType.value)
    
    const response = await axios.post('import/data', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    uploadResult.value = response.data
    
    if (response.data.success) {
      setTimeout(() => {
        showUploadModal.value = false
        selectedFile.value = null
        window.location.reload()
      }, 1500)
    }
  } catch (error) {
    uploadResult.value = {
      success: false,
      message: error.response?.data?.error || error.message || '上传失败'
    }
  } finally {
    uploading.value = false
  }
}

const resize = () => {
  const wrapper = document.querySelector('.screen-wrapper')
  const container = document.querySelector('.screen-container')
  if (!wrapper || !container) return
  
  const wrapperWidth = wrapper.clientWidth
  const wrapperHeight = wrapper.clientHeight
  
  const baseWidth = 1920
  const baseHeight = 1080
  
  const scaleX = wrapperWidth / baseWidth
  const scaleY = wrapperHeight / baseHeight
  const scale = Math.min(scaleX, scaleY)
  
  container.style.width = `${baseWidth}px`
  container.style.height = `${baseHeight}px`
  container.style.transform = `scale(${scale})`
  container.style.transformOrigin = 'left top'
  
  const offsetX = (wrapperWidth - baseWidth * scale) / 2
  const offsetY = (wrapperHeight - baseHeight * scale) / 2
  container.style.marginLeft = `${offsetX > 0 ? offsetX : 0}px`
  container.style.marginTop = `${offsetY > 0 ? offsetY : 0}px`
}

onMounted(() => {
  socketService.connect()
  updateTime()
  setInterval(updateTime, 1000)
  resize()
  window.addEventListener('resize', resize)
  fetchStore3DName()
  fetchStore3DData()
})

const fetchStore3DName = async () => {
  try {
    const response = await axios.get('store/detail', {
      params: { store_id: 'S001' }
    })
    if (response.data && response.data.store_name) {
      store3DName.value = '门店3D环境 - ' + response.data.store_name
    }
  } catch (error) {
    console.error('获取门店名称失败:', error)
  }
}

const fetchStore3DData = async () => {
  try {
    const [salesRes, productsRes] = await Promise.all([
      axios.get('store/sales', { params: { store_id: 'S001' } }),
      axios.get('store/productRank', { params: { store_id: 'S001' } })
    ])
    
    if (salesRes.data.success) {
      const { xData, series, quantities } = salesRes.data.data
      store3DSalesData.value = xData.map((date, index) => ({
        date,
        sales: series[index],
        quantity: quantities ? quantities[index] : 0
      }))
    }
    
    if (productsRes.data.success) {
      store3DProductsData.value = productsRes.data.data.slice(0, 8)
    }
  } catch (error) {
    console.error('获取门店3D数据失败:', error)
  }
}

onUnmounted(() => {
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
.screen-wrapper {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #0d1117;
}

.screen-container {
  width: 1920px;
  height: 1080px;
  padding: 0 20px;
  background-color: #161522;
  color: #fff;
  box-sizing: border-box;
  overflow: hidden;
}

.screen-header {
  width: 100%;
  height: 60px;
  font-size: 20px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-sizing: border-box;
  flex-shrink: 0;
  
  > div img {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
  
  .title-left {
    flex: 1;
    min-width: 200px;
    z-index: 1;
  }
  
  .title {
    flex: 2;
    text-align: center;
    font-size: 24px;
    white-space: nowrap;
    z-index: 1;
  }
  
  .title-right {
    flex: 1;
    min-width: 200px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    z-index: 1;
  }
  
  .qiehuan {
    width: 28px;
    height: 21px;
    cursor: pointer;
    margin-right: 15px;
  }
  
  .datetime {
    font-size: 16px;
    white-space: nowrap;
  }
}

.screen-body {
  width: 100%;
  height: calc(100% - 80px);
  display: flex;
  gap: 20px;
  margin-top: 15px;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
}

.screen-left,
.screen-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
  min-height: 0;
}

.screen-center {
  flex: 1.5;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
  min-height: 0;
}

.chart-wrapper {
  flex: 1;
  position: relative;
  border-radius: 8px;
  transition: all 0.3s ease;
  overflow: visible;
  background: rgba(10, 20, 40, 0.6);
  border: 1px solid rgba(76, 155, 253, 0.3);
  min-width: 0;
  min-height: 0;
}

.chart-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px solid rgba(76, 155, 253, 0.4);
  border-radius: 8px;
  pointer-events: none;
  z-index: 10;
}

@keyframes borderBlink {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.border-tech-1 .corner {
  position: absolute;
  width: 24px;
  height: 24px;
  z-index: 11;
  pointer-events: none;
}

.border-tech-1 .corner-tl {
  top: 0;
  left: 0;
  border-top: 2px solid #4c9bfd;
  border-left: 2px solid #4c9bfd;
  border-top-left-radius: 6px;
}

.border-tech-1 .corner-tr {
  top: 0;
  right: 0;
  border-top: 2px solid #91cc75;
  border-right: 2px solid #91cc75;
  border-top-right-radius: 6px;
}

.border-tech-1 .corner-bl {
  bottom: 0;
  left: 0;
  border-bottom: 2px solid #fac858;
  border-left: 2px solid #fac858;
  border-bottom-left-radius: 6px;
}

.border-tech-1 .corner-br {
  bottom: 0;
  right: 0;
  border-bottom: 2px solid #ee6666;
  border-right: 2px solid #ee6666;
  border-bottom-right-radius: 6px;
}

.border-tech-1::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #4c9bfd, transparent);
  animation: borderBlink 2s ease-in-out infinite;
}

.border-tech-2 .corner {
  position: absolute;
  width: 20px;
  height: 20px;
  z-index: 11;
  pointer-events: none;
}

.border-tech-2 .corner-tl {
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top-color: #00ffff;
  border-left-color: #00ffff;
  clip-path: polygon(0 0, 100% 0, 100% 40%, 40% 40%, 40% 100%, 0 100%);
}

.border-tech-2 .corner-tr {
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top-color: #00ffff;
  border-right-color: #00ffff;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 60% 100%, 60% 40%, 0 40%);
}

.border-tech-2 .corner-bl {
  bottom: 0;
  left: 0;
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-bottom-color: #00ffff;
  border-left-color: #00ffff;
  clip-path: polygon(0 0, 40% 0, 40% 60%, 100% 60%, 100% 100%, 0 100%);
}

.border-tech-2 .corner-br {
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-bottom-color: #00ffff;
  border-right-color: #00ffff;
  clip-path: polygon(60% 0, 100% 0, 100% 100%, 0 100%, 0 60%, 60% 60%);
}

.border-tech-2::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00ffff, transparent);
  animation: borderBlink 2s ease-in-out infinite;
}

.border-tech-3 .corner {
  position: absolute;
  width: 18px;
  height: 18px;
  z-index: 11;
  pointer-events: none;
}

.border-tech-3 .corner-tl {
  top: 0;
  left: 0;
  border-top: 2px solid #ff6b6b;
  border-left: 2px solid #ff6b6b;
  border-radius: 50% 0 0 0;
}

.border-tech-3 .corner-tr {
  top: 0;
  right: 0;
  border-top: 2px solid #4ecdc4;
  border-right: 2px solid #4ecdc4;
  border-radius: 0 50% 0 0;
}

.border-tech-3 .corner-bl {
  bottom: 0;
  left: 0;
  border-bottom: 2px solid #ffe66d;
  border-left: 2px solid #ffe66d;
  border-radius: 0 0 0 50%;
}

.border-tech-3 .corner-br {
  bottom: 0;
  right: 0;
  border-bottom: 2px solid #95e1d3;
  border-right: 2px solid #95e1d3;
  border-radius: 0 0 50% 0;
}

.border-tech-3::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(180deg, transparent, #ff6b6b, transparent);
  animation: borderBlink 2.5s ease-in-out infinite;
}

.border-tech-4 .corner {
  position: absolute;
  width: 22px;
  height: 22px;
  z-index: 11;
  pointer-events: none;
}

.border-tech-4 .corner-tl {
  top: 0;
  left: 0;
  border-top: 2px double #4c9bfd;
  border-left: 2px double #4c9bfd;
}

.border-tech-4 .corner-tr {
  top: 0;
  right: 0;
  border-top: 2px double #91cc75;
  border-right: 2px double #91cc75;
}

.border-tech-4 .corner-bl {
  bottom: 0;
  left: 0;
  border-bottom: 2px double #fac858;
  border-left: 2px double #fac858;
}

.border-tech-4 .corner-br {
  bottom: 0;
  right: 0;
  border-bottom: 2px double #ee6666;
  border-right: 2px double #ee6666;
}

.border-tech-4::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(180deg, transparent, #91cc75, transparent);
  animation: borderBlink 2s ease-in-out infinite;
}

.border-tech-5 .corner {
  position: absolute;
  width: 20px;
  height: 20px;
  z-index: 11;
  pointer-events: none;
}

.border-tech-5 .corner-tl {
  top: 0;
  left: 0;
  border-top: 2px dashed #ffd700;
  border-left: 2px dashed #ffd700;
}

.border-tech-5 .corner-tr {
  top: 0;
  right: 0;
  border-top: 2px dashed #ffa500;
  border-right: 2px dashed #ffa500;
}

.border-tech-5 .corner-bl {
  bottom: 0;
  left: 0;
  border-bottom: 2px dashed #ffd700;
  border-left: 2px dashed #ffd700;
}

.border-tech-5 .corner-br {
  bottom: 0;
  right: 0;
  border-bottom: 2px dashed #ffa500;
  border-right: 2px dashed #ffa500;
}

.border-tech-5::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #ffd700, transparent);
  animation: borderBlink 1.5s ease-in-out infinite;
}

.border-tech-6 .corner {
  position: absolute;
  width: 20px;
  height: 20px;
  z-index: 11;
  pointer-events: none;
}

.border-tech-6 .corner-tl {
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 20px 20px 0 0;
  border-color: #4c9bfd transparent transparent transparent;
  opacity: 0.6;
}

.border-tech-6 .corner-tr {
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 20px 20px 0;
  border-color: transparent #91cc75 transparent transparent;
  opacity: 0.6;
}

.border-tech-6 .corner-bl {
  bottom: 0;
  left: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 20px 0 0 20px;
  border-color: transparent transparent transparent #fac858;
  opacity: 0.6;
}

.border-tech-6 .corner-br {
  bottom: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 0 20px 20px;
  border-color: transparent transparent #ee6666 transparent;
  opacity: 0.6;
}

.border-tech-6::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #4c9bfd, transparent);
  animation: borderBlink 2s ease-in-out infinite;
}

.chart-wrapper:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(76, 155, 253, 0.2);
}

.map-wrapper {
  flex: 1.5;
}

.resize {
  position: absolute;
  right: 15px;
  top: 15px;
  cursor: pointer;
  z-index: 10;
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 70px;
  height: 28px;
  background: linear-gradient(135deg, #4c9bfd, #1a5bff);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
  z-index: 2;
  margin-right: 50px;
}

.upload-btn:hover {
  background: linear-gradient(135deg, #6cb9ff, #3a7cff);
  transform: scale(1.05);
}

.upload-btn .iconfont {
  font-size: 12px;
}

.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 70px;
  height: 28px;
  background: linear-gradient(135deg, #ee6666, #c93c3c);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
  z-index: 2;
  margin-right: 10px;
}

.delete-btn:hover {
  background: linear-gradient(135deg, #ff8888, #e55555);
  transform: scale(1.05);
}

.delete-btn .iconfont {
  font-size: 12px;
}

.upload-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.upload-modal {
  background: #1a1f2e;
  border-radius: 12px;
  width: 450px;
  max-width: 90vw;
  border: 1px solid rgba(76, 155, 253, 0.3);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(76, 155, 253, 0.2);
}

.modal-header h3 {
  margin: 0;
  color: #4c9bfd;
  font-size: 18px;
}

.close-btn {
  font-size: 24px;
  color: #666;
  cursor: pointer;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #fff;
}

.modal-body {
  padding: 20px;
}

.upload-tip {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 6px;
  padding: 12px 15px;
  margin-bottom: 20px;
}

.upload-tip p {
  margin: 0 0 8px 0;
  color: #ffc107;
  font-size: 14px;
  font-weight: 500;
}

.upload-tip ol {
  margin: 0;
  padding-left: 20px;
  color: #ccc;
  font-size: 13px;
}

.upload-tip li {
  margin: 4px 0;
}

.upload-type {
  margin-bottom: 20px;
}

.upload-type label {
  display: block;
  margin-bottom: 8px;
  color: #aaa;
  font-size: 14px;
}

.upload-type select {
  width: 100%;
  padding: 10px 12px;
  background: #0d1117;
  border: 1px solid rgba(76, 155, 253, 0.3);
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}

.upload-type select:focus {
  outline: none;
  border-color: #4c9bfd;
}

.file-upload {
  border: 2px dashed rgba(76, 155, 253, 0.3);
  border-radius: 8px;
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.file-upload:hover {
  border-color: #4c9bfd;
  background: rgba(76, 155, 253, 0.05);
}

.file-upload input {
  display: none;
}

.file-upload-text {
  color: #666;
  font-size: 14px;
}

.file-upload-text .iconfont {
  font-size: 32px;
  color: #4c9bfd;
  display: block;
  margin-bottom: 10px;
}

.file-name {
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(76, 155, 253, 0.1);
  border-radius: 4px;
  color: #4c9bfd;
  font-size: 13px;
}

.upload-actions {
  margin-top: 20px;
  text-align: right;
}

.upload-submit-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #4c9bfd, #1a5bff);
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #6cb9ff, #3a7cff);
}

.upload-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-result {
  margin-top: 16px;
  padding: 12px;
  border-radius: 6px;
}

.upload-result .success {
  color: #91cc75;
  background: rgba(145, 204, 117, 0.1);
}

.upload-result .error {
  color: #ee6666;
  background: rgba(238, 102, 102, 0.1);
}

.delete-tip {
  background: rgba(238, 102, 102, 0.1);
  border: 1px solid rgba(238, 102, 102, 0.3);
  border-radius: 6px;
  padding: 12px 15px;
  margin-bottom: 20px;
}

.delete-tip p {
  margin: 0;
  color: #ee6666;
  font-size: 14px;
  font-weight: 500;
}

.delete-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.delete-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.delete-option:hover {
  background: rgba(0, 0, 0, 0.3);
}

.delete-option input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.delete-option span {
  color: #ccc;
  font-size: 14px;
}

.delete-option.delete-all {
  background: rgba(238, 102, 102, 0.1);
  border: 1px solid rgba(238, 102, 102, 0.3);
}

.delete-option.delete-all span {
  color: #ee6666;
  font-weight: 500;
}

.delete-submit-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #ee6666, #c93c3c);
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.delete-submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #ff8888, #e55555);
}

.delete-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

<style>
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
}

.fullscreen-overlay.dark {
  background: rgba(10, 10, 18, 0.98);
}

.fullscreen-overlay.light {
  background: rgba(240, 242, 245, 0.98);
}

.fullscreen-content {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 12px;
}

.fullscreen-overlay.dark .fullscreen-content {
  background: rgba(22, 21, 34, 0.95);
  border: 1px solid rgba(76, 155, 253, 0.3);
}

.fullscreen-overlay.light .fullscreen-content {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(76, 155, 253, 0.2);
  box-shadow: 0 4px 20px rgba(76, 155, 253, 0.15);
}

.fullscreen-close {
  position: absolute;
  top: 30px;
  right: 30px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
}

.fullscreen-overlay.dark .fullscreen-close {
  background: rgba(76, 155, 253, 0.9);
  box-shadow: 0 4px 15px rgba(76, 155, 253, 0.4);
}

.fullscreen-overlay.light .fullscreen-close {
  background: rgba(76, 155, 253, 0.9);
  box-shadow: 0 4px 15px rgba(76, 155, 253, 0.3);
}

.fullscreen-close:hover {
  background: rgba(76, 155, 253, 1);
  transform: scale(1.1);
}

.fullscreen-overlay.dark .fullscreen-close:hover {
  box-shadow: 0 6px 20px rgba(76, 155, 253, 0.6);
}

.fullscreen-overlay.light .fullscreen-close:hover {
  box-shadow: 0 6px 20px rgba(76, 155, 253, 0.4);
}

.fullscreen-close .iconfont {
  font-size: 22px;
  color: #fff;
}
</style>
