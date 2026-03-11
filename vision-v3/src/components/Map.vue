<template>
  <div class="map-container" :class="store.theme">
    <div class="map-header">
      <h3 class="title">商家分布</h3>
      <div class="breadcrumb">
        <span :class="{ clickable: mapLevel > 0 }" @click="goToLevel(0)">全国</span>
        <span v-if="mapLevel >= 1" class="separator">/</span>
        <span v-if="mapLevel >= 1" :class="{ clickable: mapLevel > 1 }" @click="goToLevel(1)">{{ currentProvince }}</span>
        <span v-if="mapLevel >= 2" class="separator">/</span>
        <span v-if="mapLevel >= 2">{{ currentCity }}</span>
      </div>
    </div>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMainStore } from '@/store'
import { getThemeValue } from '@/utils/theme_utils'
import socketService from '@/utils/socket_service'
import { getMapData } from '@/utils/map_utils'

const router = useRouter()
const store = useMainStore()
const chartRef = ref(null)
let chart = null
let isChartReady = false
let currentMapData = null

const mapLevel = ref(0)
const currentProvince = ref('')
const currentCity = ref('')
const mapName = ref('china')
const mapDataCache = {}

const provinceMapNames = {
  '北京': 'beijing', '天津': 'tianjin', '河北': 'hebei', '山西': 'shanxi', '内蒙古': 'neimenggu',
  '辽宁': 'liaoning', '吉林': 'jilin', '黑龙江': 'heilongjiang', '上海': 'shanghai',
  '江苏': 'jiangsu', '浙江': 'zhejiang', '安徽': 'anhui', '福建': 'fujian', '江西': 'jiangxi',
  '山东': 'shandong', '河南': 'henan', '湖北': 'hubei', '湖南': 'hunan', '广东': 'guangdong',
  '广西': 'guangxi', '海南': 'hainan', '重庆': 'chongqing', '四川': 'sichuan',
  '贵州': 'guizhou', '云南': 'yunnan', '西藏': 'xizang', '陕西': 'shanxi1',
  '甘肃': 'gansu', '青海': 'qinghai', '宁夏': 'ningxia', '新疆': 'xinjiang',
  '台湾': 'taiwan', '香港': 'xianggang', '澳门': 'aomen'
}

const loadMapData = async (mapKey) => {
  if (mapDataCache[mapKey]) {
    return mapDataCache[mapKey]
  }
  const data = await getMapData(mapKey)
  mapDataCache[mapKey] = data
  return data
}

const initChart = async () => {
  if (chart) {
    chart.dispose()
  }
  chart = window.echarts.init(chartRef.value)
  
  try {
    const chinaMapData = await loadMapData('china')
    window.echarts.registerMap('china', chinaMapData)
    isChartReady = true
    updateChart()
  } catch (error) {
    console.error('获取地图数据失败:', error)
  }
}

const updateChart = () => {
  if (!isChartReady) return
  
  const sendRequest = () => {
    if (socketService.isConnected) {
      socketService.send({
        action: 'getData',
        socketType: 'map',
        chartName: 'map',
        value: { 
          level: mapLevel.value, 
          province: currentProvince.value,
          city: currentCity.value
        }
      })
    } else {
      setTimeout(sendRequest, 100)
    }
  }
  sendRequest()
}

const handleData = async (data) => {
  if (data.socketType === 'map' && data.data) {
    currentMapData = data.data
    renderMap(data.data)
  }
}

const renderMap = (data) => {
  if (!chart) return
  
  const theme = getThemeValue(store.theme)
  const isDark = store.theme === 'dark'
  
  const option = {
    animation: true,
    animationDurationUpdate: 1000,
    animationEasingUpdate: 'cubicInOut',
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        return params.value > 0 ? `${params.name}: ${params.value}家门店` : `${params.name}: 暂无门店`
      },
      backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)',
      borderColor: theme.primaryColor,
      textStyle: { color: theme.textColor }
    },
    visualMap: {
      min: 0,
      max: 10,
      left: 'left',
      top: 'bottom',
      text: ['高', '低'],
      calculable: true,
      inRange: {
        color: isDark ? ['#1a2a4a', '#2a4a7a', '#4c9bfd'] : ['#e8f4ff', '#a8d4ff', '#4c9bfd']
      },
      textStyle: { color: theme.textColor },
      itemWidth: 15,
      itemHeight: 100
    },
    series: [
      {
        name: '门店数量',
        type: 'map',
        map: mapName.value,
        roam: true,
        label: {
          show: true,
          color: theme.textColor,
          fontSize: mapLevel.value === 0 ? 8 : 10,
          formatter: (params) => {
            return params.value > 0 ? `${params.name}\n${params.value}家` : params.name
          }
        },
        data: data,
        itemStyle: {
          areaColor: isDark ? '#1a2a4a' : '#f8fafc',
          borderColor: isDark ? '#3a5a8a' : '#d0e4ff',
          borderWidth: 1
        },
        emphasis: {
          label: {
            show: true,
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
            formatter: (params) => {
              return params.value > 0 ? `${params.name}\n${params.value}家门店` : `${params.name}\n暂无门店`
            }
          },
          itemStyle: {
            areaColor: '#4c9bfd',
            shadowBlur: 20,
            shadowColor: 'rgba(76, 155, 253, 0.5)'
          }
        },
        select: {
          label: { show: true, color: '#fff' },
          itemStyle: { areaColor: '#3a8ae8' }
        }
      }
    ]
  }
  chart.setOption(option, true)
  
  chart.off('click')
  chart.on('click', async (params) => {
    if (mapLevel.value === 0) {
      await drillDownToProvince(params.name)
    } else if (mapLevel.value === 1) {
      await drillDownToCity(params.name)
    } else if (mapLevel.value === 2) {
      router.push({
        path: '/stores',
        query: { 
          province: currentProvince.value,
          city: currentCity.value
        }
      })
    }
  })
}

const drillDownToProvince = async (provinceName) => {
  const mapKey = provinceMapNames[provinceName]
  if (!mapKey) {
    console.log('未找到省份地图:', provinceName)
    return
  }
  
  try {
    const provinceMapData = await loadMapData(mapKey)
    window.echarts.registerMap(mapKey, provinceMapData)
    
    mapName.value = mapKey
    currentProvince.value = provinceName
    mapLevel.value = 1
    
    chart.setOption({
      series: [{ map: mapKey }]
    }, false)
    
    updateChart()
  } catch (error) {
    console.error('加载省份地图失败:', provinceName, error)
  }
}

const drillDownToCity = async (cityName) => {
  const provinceMapKey = provinceMapNames[currentProvince.value]
  if (!provinceMapKey) return
  
  try {
    const provinceMapData = await loadMapData(provinceMapKey)
    const cityFeature = provinceMapData.features.find(f => f.properties.name === cityName)
    
    if (cityFeature) {
      const cityMapData = {
        type: 'FeatureCollection',
        features: [cityFeature]
      }
      const cityMapKey = `city_${cityName}`
      window.echarts.registerMap(cityMapKey, cityMapData)
      
      mapName.value = cityMapKey
      currentCity.value = cityName
      mapLevel.value = 2
      
      chart.setOption({
        series: [{ map: cityMapKey }]
      }, false)
      
      updateChart()
    } else {
      router.push({
        path: '/stores',
        query: { 
          province: currentProvince.value,
          city: cityName 
        }
      })
    }
  } catch (error) {
    console.error('加载城市地图失败:', cityName, error)
  }
}

const goToLevel = async (level) => {
  if (level === 0 && mapLevel.value > 0) {
    mapName.value = 'china'
    currentProvince.value = ''
    currentCity.value = ''
    mapLevel.value = 0
    chart.setOption({
      series: [{ map: 'china' }]
    }, false)
    updateChart()
  } else if (level === 1 && mapLevel.value > 1) {
    const mapKey = provinceMapNames[currentProvince.value]
    if (mapKey) {
      mapName.value = mapKey
      currentCity.value = ''
      mapLevel.value = 1
      chart.setOption({
        series: [{ map: mapKey }]
      }, false)
      updateChart()
    }
  }
}

const screenAdapter = () => {
  if (chart) {
    chart.resize()
  }
}

watch(() => store.theme, () => {
  if (chart && isChartReady && currentMapData) {
    renderMap(currentMapData)
  }
})

onMounted(() => {
  initChart()
  socketService.registerCallBack('map', handleData)
  window.addEventListener('resize', screenAdapter)
})

onUnmounted(() => {
  socketService.unRegisterCallBack('map')
  window.removeEventListener('resize', screenAdapter)
  if (chart) {
    chart.dispose()
  }
})

defineExpose({ screenAdapter })
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  padding: 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-shrink: 0;
  padding-right: 30px;
}

.title {
  font-size: clamp(12px, 1.5vw, 14px);
  margin: 0;
}

.map-container.dark .title {
  color: #4c9bfd;
}

.map-container.light .title {
  color: #333;
}

.breadcrumb {
  font-size: clamp(10px, 1.2vw, 12px);
}

.map-container.dark .breadcrumb {
  color: #aaa;
}

.map-container.light .breadcrumb {
  color: #666;
}

.breadcrumb .clickable {
  cursor: pointer;
}

.map-container.dark .breadcrumb .clickable {
  color: #4c9bfd;
}

.map-container.light .breadcrumb .clickable {
  color: #1a5bff;
}

.breadcrumb .clickable:hover {
  text-decoration: underline;
}

.breadcrumb .separator {
  margin: 0 5px;
}

.chart-container {
  width: 100%;
  flex: 1;
  min-height: 100px;
}
</style>
