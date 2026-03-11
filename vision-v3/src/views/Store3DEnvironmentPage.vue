<template>
  <div class="store3d-container" :class="mainStore.theme">
    <header class="store3d-header">
      <div>
        <img :src="headerSrc" alt="">
      </div>
      <div class="title-left"></div>
      <span class="title">{{ store.store_name || '门店' }}</span>
      <div class="title-right">
        <img :src="themeSrc" class="qiehuan" @click="handleChangeTheme">
        <span class="datetime">{{ currentTime }}</span>
      </div>
    </header>
    <div class="store3d-body">
      <div class="top-row">
        <div class="store-info-card">
          <h3 class="card-title">门店信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">门店ID：</span>
              <span class="value">{{ store.store_id }}</span>
            </div>
            <div class="info-item">
              <span class="label">门店名称：</span>
              <span class="value">{{ store.store_name }}</span>
            </div>
            <div class="info-item">
              <span class="label">所属地区：</span>
              <span class="value">{{ store.region }}</span>
            </div>
            <div class="info-item">
              <span class="label">城市：</span>
              <span class="value">{{ store.city }}</span>
            </div>
            <div class="info-item">
              <span class="label">地址：</span>
              <span class="value">{{ store.address }}</span>
            </div>
            <div class="info-item">
              <span class="label">负责人：</span>
              <span class="value">{{ store.manager }}</span>
            </div>
            <div class="info-item">
              <span class="label">联系电话：</span>
              <span class="value">{{ store.phone }}</span>
            </div>
            <div class="info-item">
              <span class="label">开业时间：</span>
              <span class="value">{{ store.open_date }}</span>
            </div>
          </div>
        </div>
        <div v-if="hasStore3D" class="store-3d-card">
          <Store3D ref="store3dRef" :store-id="storeId" :store-name="store3DDisplayName" :sales-data="salesDataFor3D" :products-data="productsDataFor3D" @hotspot-click="handleHotspotClick" @data-bar-click="handleDataBarClick" />
        </div>
        <div v-else class="no-3d-card">
          <h3 class="card-title">门店3D环境</h3>
          <div class="no-3d-content">
            <p>该门店暂无3D环境展示</p>
            <p class="hint">目前仅支持部分门店查看3D环境</p>
          </div>
        </div>
        <div class="product-rank-card">
          <h3 class="card-title">商品销量排行榜</h3>
          <div class="rank-list" ref="rankListRef">
            <div 
              v-for="(item, index) in productRankData" 
              :key="item.name" 
              class="rank-item"
              :class="'rank-' + (index + 1)"
            >
              <div class="rank-badge" :class="'badge-' + (index + 1)">
                {{ getRankLabel(index + 1) }}
              </div>
              <div class="product-name">{{ item.name }}</div>
              <div class="product-bar-wrapper">
                <div class="product-bar" :style="{ width: getBarWidth(item.value) + '%' }"></div>
              </div>
              <div class="product-value">{{ item.value }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="bottom-row">
        <div class="chart-card trend-prediction-card">
          <div class="corner corner-tl"></div>
          <div class="corner corner-tr"></div>
          <div class="corner corner-bl"></div>
          <div class="corner corner-br"></div>
          <h3 class="card-title">销量趋势与预测</h3>
          <div ref="trendPredictionChartRef" class="chart-container"></div>
        </div>
        <div class="chart-card products-chart-card">
          <div class="corner corner-tl"></div>
          <div class="corner corner-tr"></div>
          <div class="corner corner-bl"></div>
          <div class="corner corner-br"></div>
          <h3 class="card-title">热销产品占比</h3>
          <div ref="productsChartRef" class="chart-container"></div>
        </div>
      </div>
    </div>
    <div class="back-btn" @click="goBack">返回门店列表</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, onActivated, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMainStore } from '@/store'
import { getThemeValue } from '@/utils/theme_utils'
import axios from 'axios'
import Store3D from '@/components/Store3D.vue'

const router = useRouter()
const route = useRoute()
const mainStore = useMainStore()
const currentTime = ref('')
const storeId = ref(route.query.store_id)
const store = ref({})
const salesChartRef = ref(null)
const productsChartRef = ref(null)
const trendPredictionChartRef = ref(null)
const rankListRef = ref(null)
const store3dRef = ref(null)
let salesChart = null
let productsChart = null
let trendPredictionChart = null
const productRankData = ref([])
const salesDataFor3D = ref([])
const productsDataFor3D = ref([])

const storeName = computed(() => {
  return store.value.store_name || '门店'
})

const store3DDisplayName = computed(() => {
  return '门店3D环境 - ' + (store.value.store_name || '门店')
})

const hasStore3D = computed(() => {
  const id = storeId.value
  return id === 'S001' || id === 'S004'
})

watch(() => route.query.store_id, (newStoreId) => {
  if (newStoreId && newStoreId !== storeId.value) {
    storeId.value = newStoreId
    fetchStoreDetail()
    fetchTrendPredictionData()
    fetchProductRankData()
  }
})

const headerSrc = computed(() => {
  return '/static/img/' + getThemeValue(mainStore.theme).headerBorderSrc
})

const themeSrc = computed(() => {
  return '/static/img/' + getThemeValue(mainStore.theme).themeSrc
})

const containerStyle = computed(() => {
  return {
    backgroundColor: getThemeValue(mainStore.theme).backgroundColor,
    color: getThemeValue(mainStore.theme).titleColor
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

const fetchStoreDetail = async () => {
  if (!storeId.value) return
  try {
    const response = await axios.get('store/detail', {
      params: { store_id: storeId.value }
    })
    store.value = response.data.data
  } catch (error) {
    console.error('获取门店详情失败:', error)
  }
}

const fetchTrendPredictionData = async () => {
  if (!storeId.value) return
  try {
    const [salesRes, predictionRes] = await Promise.all([
      axios.get('store/sales', { params: { store_id: storeId.value } }),
      axios.get('store/prediction', { params: { store_id: storeId.value, days: predictionDays.value } })
    ])
    initTrendPredictionChart(salesRes.data.data, predictionRes.data.data)
  } catch (error) {
    console.error('获取趋势预测数据失败:', error)
  }
}

const fetchProductRankData = async () => {
  if (!storeId.value) return
  try {
    const response = await axios.get('store/productRank', {
      params: { store_id: storeId.value }
    })
    if (response.data.success) {
      productRankData.value = response.data.data
      productsDataFor3D.value = response.data.data.slice(0, 8)
      initProductsChart(response.data.data.slice(0, 10))
    }
  } catch (error) {
    console.error('获取商品排行榜失败:', error)
  }
}

const fetchSalesDataFor3D = async () => {
  if (!storeId.value) return
  try {
    const response = await axios.get('store/sales', {
      params: { store_id: storeId.value }
    })
    if (response.data.success) {
      const { xData, series, quantities } = response.data.data
      salesDataFor3D.value = xData.map((date, index) => ({
        date,
        sales: series[index],
        quantity: quantities ? quantities[index] : 0
      }))
    }
  } catch (error) {
    console.error('获取销售数据失败:', error)
  }
}

const predictionDays = ref(7)

const getRankLabel = (rank) => {
  if (rank <= 3) return `No.${rank}`
  return rank
}

const getBarWidth = (value) => {
  if (productRankData.value.length === 0) return 0
  const maxVal = Math.max(...productRankData.value.map(item => item.value))
  return (value / maxVal) * 100
}

const initTrendPredictionChart = (salesData, predictionData) => {
  if (trendPredictionChart) trendPredictionChart.dispose()
  trendPredictionChart = window.echarts.init(trendPredictionChartRef.value)
  
  const theme = getThemeValue(mainStore.theme)
  const historyLen = predictionData.historyData.length
  const lastHistoryValue = predictionData.historyData[historyLen - 1]
  const predictionSeries = new Array(historyLen - 1).fill(null).concat([lastHistoryValue]).concat(predictionData.predictionData)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: mainStore.theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: theme.primaryColor,
      textStyle: { color: theme.textColor }
    },
    legend: {
      data: ['历史销量', '预测销量'],
      textStyle: { color: theme.textColor, fontSize: 11 },
      top: 5
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '18%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: predictionData.xData,
      axisLine: { lineStyle: { color: mainStore.theme === 'dark' ? '#4c9bfd' : '#ccc' } },
      axisLabel: { color: theme.textColor, rotate: 45, fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: mainStore.theme === 'dark' ? '#4c9bfd' : '#ccc' } },
      axisLabel: { color: theme.textColor, fontSize: 10 },
      splitLine: { lineStyle: { color: theme.splitColor } }
    },
    series: [
      {
        name: '历史销量',
        type: 'line',
        data: predictionData.historyData,
        smooth: true,
        lineStyle: { color: '#4c9bfd', width: 2 },
        itemStyle: { color: '#4c9bfd' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(76, 155, 253, 0.3)' },
              { offset: 1, color: 'rgba(76, 155, 253, 0.05)' }
            ]
          }
        }
      },
      {
        name: '预测销量',
        type: 'line',
        data: predictionSeries,
        smooth: true,
        lineStyle: { color: '#91cc75', width: 2 },
        itemStyle: { color: '#91cc75' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(145, 204, 117, 0.3)' },
              { offset: 1, color: 'rgba(145, 204, 117, 0.05)' }
            ]
          }
        }
      }
    ]
  }
  
  trendPredictionChart.setOption(option)
}

const initProductsChart = (data) => {
  if (productsChart) productsChart.dispose()
  productsChart = window.echarts.init(productsChartRef.value)
  
  const theme = getThemeValue(mainStore.theme)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: mainStore.theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: theme.primaryColor,
      textStyle: { color: theme.textColor }
    },
    legend: {
      type: 'scroll',
      orient: 'horizontal',
      left: 'center',
      bottom: 5,
      textStyle: { color: theme.textColor, fontSize: 10 },
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 8
    },
    series: [{
      name: '热销产品',
      type: 'pie',
      radius: ['25%', '45%'],
      center: ['50%', '42%'],
      data: data,
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.3)' }
      },
      itemStyle: {
        borderRadius: 6,
        borderColor: mainStore.theme === 'dark' ? '#161522' : '#fff',
        borderWidth: 1
      },
      label: {
        show: true,
        formatter: '{b}\n{d}%',
        fontSize: 10
      },
      labelLine: { show: true, length: 6, length2: 6 }
    }],
    color: ['#FFD700', '#C0C0C0', '#CD7F32', '#4c9bfd', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452']
  }
  
  productsChart.setOption(option)
}

const handleChangeTheme = () => {
  mainStore.changeTheme()
}

const handleHotspotClick = (eventData) => {
  console.log('热点点击:', eventData)
  
  if (eventData.type === 'counter') {
    highlightTrendChart()
  } else if (eventData.type === 'seating') {
    highlightProductsChart()
  } else if (eventData.type === 'display') {
    highlightTopProduct()
  }
}

const handleDataBarClick = (eventData) => {
  console.log('数据条点击:', eventData)
  if (eventData.product && eventData.product.name) {
    highlightProductInChart(eventData.product.name)
  }
}

const highlightTrendChart = () => {
  if (trendPredictionChart) {
    trendPredictionChart.dispatchAction({
      type: 'highlight',
      seriesIndex: 0
    })
    trendPredictionChart.dispatchAction({
      type: 'showTip',
      seriesIndex: 0,
      dataIndex: trendPredictionChart.getOption().series[0].data.length - 1
    })
    setTimeout(() => {
      trendPredictionChart.dispatchAction({
        type: 'downplay',
        seriesIndex: 0
      })
    }, 2000)
  }
}

const highlightProductsChart = () => {
  if (productsChart) {
    productsChart.dispatchAction({
      type: 'highlight',
      seriesIndex: 0,
      dataIndex: 0
    })
    setTimeout(() => {
      productsChart.dispatchAction({
        type: 'downplay',
        seriesIndex: 0,
        dataIndex: 0
      })
    }, 2000)
  }
}

const highlightTopProduct = () => {
  if (productsChart) {
    productsChart.dispatchAction({
      type: 'highlight',
      seriesIndex: 0,
      dataIndex: 0
    })
    productsChart.dispatchAction({
      type: 'showTip',
      seriesIndex: 0,
      dataIndex: 0
    })
    setTimeout(() => {
      productsChart.dispatchAction({
        type: 'downplay',
        seriesIndex: 0,
        dataIndex: 0
      })
    }, 2000)
  }
}

const highlightProductInChart = (productName) => {
  if (productsChart) {
    const option = productsChart.getOption()
    const dataIndex = option.series[0].data.findIndex(
      item => item.name === productName
    )
    if (dataIndex !== -1) {
      productsChart.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex
      })
      productsChart.dispatchAction({
        type: 'showTip',
        seriesIndex: 0,
        dataIndex
      })
      setTimeout(() => {
        productsChart.dispatchAction({
          type: 'downplay',
          seriesIndex: 0,
          dataIndex
        })
      }, 2000)
    }
  }
  
  const rankIndex = productRankData.value.findIndex(
    item => item.name === productName
  )
  if (rankIndex !== -1 && rankListRef.value) {
    const items = rankListRef.value.querySelectorAll('.rank-item')
    if (items[rankIndex]) {
      items[rankIndex].classList.add('highlight')
      items[rankIndex].scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => {
        items[rankIndex].classList.remove('highlight')
      }, 2000)
    }
  }
}

watch(() => mainStore.theme, () => {
  if (trendPredictionChartRef.value && productsChartRef.value) {
    fetchTrendPredictionData()
    fetchProductRankData()
  }
})

const goBack = () => {
  const from = route.query.from
  if (from === 'all') {
    router.push('/stores/all')
  } else if (from === 'region') {
    const query = {}
    if (route.query.city) query.city = route.query.city
    if (route.query.region) query.region = route.query.region
    router.push({ path: '/stores', query })
  } else {
    router.push('/stores')
  }
}

const screenAdapter = () => {
  if (trendPredictionChart) trendPredictionChart.resize()
  if (productsChart) productsChart.resize()
  if (store3dRef.value && store3dRef.value.screenAdapter) {
    store3dRef.value.screenAdapter()
  }
}

onMounted(async () => {
  storeId.value = route.query.store_id
  updateTime()
  setInterval(updateTime, 1000)
  window.addEventListener('resize', screenAdapter)
  await nextTick()
  if (storeId.value) {
    fetchStoreDetail()
    fetchTrendPredictionData()
    fetchProductRankData()
    fetchSalesDataFor3D()
  }
})

onActivated(async () => {
  const currentStoreId = route.query.store_id
  if (currentStoreId) {
    storeId.value = currentStoreId
    await nextTick()
    fetchStoreDetail()
    fetchTrendPredictionData()
    fetchProductRankData()
    fetchSalesDataFor3D()
  }
})

onUnmounted(() => {
  clearInterval(updateTime)
  window.removeEventListener('resize', screenAdapter)
  if (trendPredictionChart) trendPredictionChart.dispose()
  if (productsChart) productsChart.dispose()
})
</script>

<style scoped>
.store3d-container {
  width: 100%;
  height: 100vh;
  padding: 15px;
  color: #fff;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.store3d-container.dark {
  background-color: #161522;
}

.store3d-container.light {
  background-color: #f0f2f5;
  color: #333;
}

.store3d-header {
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
}

.store3d-header > div img {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.store3d-header .title-left {
  flex: 1;
  min-width: 200px;
  z-index: 1;
}

.store3d-header .title {
  flex: 2;
  text-align: center;
  font-size: 24px;
  white-space: nowrap;
  z-index: 1;
}

.store3d-header .title-right {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  z-index: 1;
}

.store3d-header .qiehuan {
  width: 28px;
  height: 21px;
  cursor: pointer;
  margin-right: 15px;
}

.store3d-header .datetime {
  font-size: 16px;
  white-space: nowrap;
}

.store3d-body {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-height: 0;
}

.top-row {
  width: 100%;
  flex: 1;
  display: flex;
  gap: 15px;
  min-height: 0;
}

.store-info-card {
  flex: 3;
  min-width: 180px;
  border-radius: 8px;
  padding: 12px;
  box-sizing: border-box;
  overflow-y: auto;
}

.store3d-container.dark .store-info-card {
  background-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.store3d-container.light .store-info-card {
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 12px rgba(76, 155, 253, 0.1);
}

.store-info-card .card-title {
  font-size: clamp(12px, 1.5vw, 14px);
  margin-bottom: 10px;
}

.store3d-container.dark .store-info-card .card-title {
  color: #4c9bfd;
}

.store3d-container.light .store-info-card .card-title {
  color: #1a5bff;
}

.store-info-card .info-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.store-info-card .info-grid .info-item {
  display: flex;
  flex-wrap: wrap;
  font-size: clamp(11px, 1.2vw, 13px);
}

.store-info-card .info-grid .info-item .label {
  font-weight: bold;
  margin-right: 8px;
  min-width: 70px;
}

.store-info-card .info-grid .info-item .value {
  flex: 1;
}

.store-3d-card {
  flex: 4;
  min-width: 200px;
  border-radius: 8px;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.store3d-container.dark .store-3d-card {
  background-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.store3d-container.light .store-3d-card {
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 12px rgba(76, 155, 253, 0.15);
}

.no-3d-card {
  flex: 4;
  min-width: 200px;
  border-radius: 8px;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.store3d-container.dark .no-3d-card {
  background-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.store3d-container.light .no-3d-card {
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 12px rgba(76, 155, 253, 0.15);
}

.no-3d-card .card-title {
  font-size: clamp(12px, 1.5vw, 14px);
  margin-bottom: 10px;
}

.store3d-container.dark .no-3d-card .card-title {
  color: #4c9bfd;
}

.store3d-container.light .no-3d-card .card-title {
  color: #1a5bff;
}

.no-3d-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.store3d-container.dark .no-3d-content {
  color: #888;
}

.store3d-container.light .no-3d-content {
  color: #666;
}

.no-3d-content p {
  font-size: clamp(12px, 1.2vw, 14px);
  margin-bottom: 8px;
}

.no-3d-content .hint {
  font-size: clamp(10px, 1vw, 12px);
}

.store3d-container.dark .no-3d-content .hint {
  color: #666;
}

.store3d-container.light .no-3d-content .hint {
  color: #888;
}

.product-rank-card {
  flex: 3;
  min-width: 200px;
  border-radius: 8px;
  padding: 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.store3d-container.dark .product-rank-card {
  background-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.store3d-container.light .product-rank-card {
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 12px rgba(76, 155, 253, 0.15);
}

.product-rank-card .card-title {
  font-size: 16px;
  margin-bottom: 12px;
  flex-shrink: 0;
  font-weight: bold;
}

.store3d-container.dark .product-rank-card .card-title {
  color: #4c9bfd;
}

.store3d-container.light .product-rank-card .card-title {
  color: #1a5bff;
}

.rank-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  padding-right: 5px;
  max-height: 280px;
}

.rank-list::-webkit-scrollbar {
  width: 6px;
}

.rank-list::-webkit-scrollbar-track {
  background: rgba(76, 155, 253, 0.1);
  border-radius: 3px;
}

.rank-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #4c9bfd, #1a5bff);
  border-radius: 3px;
}

.rank-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #5da9fd, #2a6bff);
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  height: 36px;
  background: rgba(76, 155, 253, 0.05);
  border-radius: 6px;
}

.rank-badge {
  min-width: 45px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  font-size: 12px;
  font-weight: bold;
  background: linear-gradient(135deg, #4c9bfd, #1a5bff);
  color: #fff;
}

.rank-badge.badge-1 { background: linear-gradient(135deg, #FFD700, #FFA500); }
.rank-badge.badge-2 { background: linear-gradient(135deg, #C0C0C0, #A0A0A0); }
.rank-badge.badge-3 { background: linear-gradient(135deg, #CD7F32, #8B4513); }

.product-name {
  min-width: 80px;
  max-width: 80px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  font-weight: 500;
}

.store3d-container.dark .product-name {
  color: #fff;
}

.store3d-container.light .product-name {
  color: #333;
}

.product-bar-wrapper {
  flex: 1;
  max-width: calc(100% - 170px);
  height: 16px;
  border-radius: 8px;
  overflow: hidden;
}

.store3d-container.dark .product-bar-wrapper {
  background: rgba(76, 155, 253, 0.1);
}

.store3d-container.light .product-bar-wrapper {
  background: rgba(76, 155, 253, 0.15);
}

.product-bar {
  height: 100%;
  background: linear-gradient(90deg, #1a5bff, #4c9bfd);
  border-radius: 6px;
  transition: width 0.5s ease;
}

.rank-1 .product-bar { background: linear-gradient(90deg, #FFA500, #FFD700); }
.rank-2 .product-bar { background: linear-gradient(90deg, #A0A0A0, #C0C0C0); }
.rank-3 .product-bar { background: linear-gradient(90deg, #8B4513, #CD7F32); }

.product-value {
  min-width: 40px;
  font-size: 14px;
  font-weight: bold;
  text-align: right;
}

.store3d-container.dark .product-value {
  color: #4c9bfd;
}

.store3d-container.light .product-value {
  color: #1a5bff;
}.store3d-container.dark .product-value {
  color: #4c9bfd;
}

.store3d-container.light .product-value {
  color: #1a5bff;
}

.bottom-row {
  width: 100%;
  flex: 1;
  display: flex;
  gap: 15px;
  min-height: 0;
}

.chart-card {
  flex: 1;
  min-width: 200px;
  border-radius: 8px;
  padding: 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.store3d-container.dark .chart-card {
  background-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.store3d-container.light .chart-card {
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 12px rgba(76, 155, 253, 0.15);
}

.chart-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 8px;
  pointer-events: none;
  z-index: 10;
}

.store3d-container.dark .chart-card::before {
  border: 1px solid rgba(76, 155, 253, 0.4);
}

.store3d-container.light .chart-card::before {
  border: 1px solid rgba(76, 155, 253, 0.2);
}

.trend-prediction-card {
  flex: 1.5;
}

.trend-prediction-card .corner {
  position: absolute;
  width: 20px;
  height: 20px;
  z-index: 11;
  pointer-events: none;
}

.trend-prediction-card .corner-tl {
  top: 0;
  left: 0;
  border-top: 2px solid #4c9bfd;
  border-left: 2px solid #4c9bfd;
}

.trend-prediction-card .corner-tr {
  top: 0;
  right: 0;
  border-top: 2px solid #91cc75;
  border-right: 2px solid #91cc75;
}

.trend-prediction-card .corner-bl {
  bottom: 0;
  left: 0;
  border-bottom: 2px solid #fac858;
  border-left: 2px solid #fac858;
}

.trend-prediction-card .corner-br {
  bottom: 0;
  right: 0;
  border-bottom: 2px solid #ee6666;
  border-right: 2px solid #ee6666;
}

.products-chart-card .corner {
  position: absolute;
  width: 18px;
  height: 18px;
  z-index: 11;
  pointer-events: none;
}

.products-chart-card .corner-tl {
  top: 0;
  left: 0;
  border-top: 2px solid #ff6b6b;
  border-left: 2px solid #ff6b6b;
  border-radius: 50% 0 0 0;
}

.products-chart-card .corner-tr {
  top: 0;
  right: 0;
  border-top: 2px solid #4ecdc4;
  border-right: 2px solid #4ecdc4;
  border-radius: 0 50% 0 0;
}

.products-chart-card .corner-bl {
  bottom: 0;
  left: 0;
  border-bottom: 2px solid #ffe66d;
  border-left: 2px solid #ffe66d;
  border-radius: 0 0 0 50%;
}

.products-chart-card .corner-br {
  bottom: 0;
  right: 0;
  border-bottom: 2px solid #95e1d3;
  border-right: 2px solid #95e1d3;
  border-radius: 0 0 50% 0;
}

.chart-card .card-title {
  font-size: clamp(12px, 1.5vw, 14px);
  margin-bottom: 8px;
  flex-shrink: 0;
}

.store3d-container.dark .chart-card .card-title {
  color: #4c9bfd;
}

.store3d-container.light .chart-card .card-title {
  color: #1a5bff;
}

.chart-container {
  width: 100%;
  flex: 1;
  min-height: 100px;
}

.back-btn {
  padding: 8px 16px;
  background-color: rgba(76, 155, 253, 0.8);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: clamp(11px, 1.2vw, 13px);
  transition: all 0.3s ease;
  margin: 10px auto 0;
  display: block;
  flex-shrink: 0;
}

.back-btn:hover {
  background-color: #4c9bfd;
  box-shadow: 0 2px 8px rgba(76, 155, 253, 0.5);
}

.rank-item.highlight {
  background: linear-gradient(135deg, rgba(76, 155, 253, 0.3), rgba(26, 91, 255, 0.3));
  transform: scale(1.02);
  box-shadow: 0 0 15px rgba(76, 155, 253, 0.5);
  transition: all 0.3s ease;
}

.rank-item.highlight .product-name {
  color: #4c9bfd !important;
  font-weight: bold;
}
</style>
