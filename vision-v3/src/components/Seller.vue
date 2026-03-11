<template>
  <div class="seller-container" :class="store.theme">
    <h3 class="title">商家销售金额</h3>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onActivated, watch } from 'vue'
import { useMainStore } from '@/store'
import { getThemeValue } from '@/utils/theme_utils'
import socketService from '@/utils/socket_service'

const store = useMainStore()
const chartRef = ref(null)
let chart = null
let isChartReady = false
let autoPlayTimer = null
let currentIndex = 0
let allData = { xData: [], series: [] }
const displayCount = 6

const initChart = () => {
  if (chart) {
    chart.dispose()
  }
  chart = window.echarts.init(chartRef.value)
  isChartReady = true
  updateChart()
}

const updateChart = () => {
  if (!isChartReady) return
  
  const sendRequest = () => {
    if (socketService.isConnected) {
      socketService.send({
        action: 'getData',
        socketType: 'seller',
        chartName: 'seller',
        value: ''
      })
    } else {
      setTimeout(sendRequest, 100)
    }
  }
  sendRequest()
}

const handleData = (data) => {
  if (data.socketType === 'seller' && data.data) {
    allData = data.data
    currentIndex = 0
    renderChart()
    startAutoPlay()
  }
}

const renderChart = (animDuration = 800) => {
  if (!chart || allData.xData.length === 0) return
  
  const theme = getThemeValue(store.theme)
  const total = allData.xData.length
  
  const extendedXData = [...allData.xData, ...allData.xData.slice(0, displayCount - 1)]
  const extendedSeries = [...allData.series, ...allData.series.slice(0, displayCount - 1)]
  
  const option = {
    animation: animDuration > 0,
    animationDuration: animDuration,
    animationEasing: 'cubicInOut',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: store.theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)',
      borderColor: theme.primaryColor,
      textStyle: { color: theme.textColor }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: extendedXData,
      axisLine: { lineStyle: { color: theme.axisColor } },
      axisLabel: { 
        color: theme.textColor, 
        rotate: 30, 
        fontSize: 11,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: theme.axisColor } },
      axisLabel: { color: theme.textColor, fontSize: 10 },
      splitLine: { lineStyle: { color: theme.splitColor } }
    },
    dataZoom: [{
      type: 'inside',
      xAxisIndex: 0,
      startValue: currentIndex,
      endValue: currentIndex + displayCount - 1,
      zoomOnMouseWheel: false,
      moveOnMouseMove: false,
      moveOnMouseWheel: false,
      preventDefaultMouseMove: false
    }],
    series: [
      {
        name: '销售金额',
        type: 'bar',
        data: extendedSeries,
        barWidth: '50%',
        barGap: '20%',
        itemStyle: {
          color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: theme.primaryColor },
            { offset: 1, color: '#1a5bff' }
          ]),
          borderRadius: [6, 6, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#6cb9ff' },
              { offset: 1, color: theme.primaryColor }
            ])
          }
        },
        label: {
          show: true,
          position: 'top',
          color: theme.textColor,
          fontSize: 11,
          formatter: '{c}'
        }
      }
    ]
  }
  
  chart.setOption(option)
}

const startAutoPlay = () => {
  stopAutoPlay()
  
  if (allData.xData.length <= displayCount) return
  
  const total = allData.xData.length
  
  autoPlayTimer = setInterval(() => {
    currentIndex++
    
    if (currentIndex >= total) {
      renderChart(800)
      setTimeout(() => {
        currentIndex = 0
        renderChart(0)
      }, 850)
    } else {
      renderChart(800)
    }
  }, 2000)
}

const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

const screenAdapter = () => {
  if (chart) {
    chart.resize()
  }
}

watch(() => store.theme, () => {
  if (chart && isChartReady && allData.xData.length > 0) {
    updateChart()
  }
})

onMounted(() => {
  initChart()
  socketService.registerCallBack('seller', handleData)
  window.addEventListener('resize', screenAdapter)
})

onActivated(() => {
  if (chart && isChartReady) {
    updateChart()
  }
})

onUnmounted(() => {
  stopAutoPlay()
  socketService.unRegisterCallBack('seller')
  window.removeEventListener('resize', screenAdapter)
  if (chart) {
    chart.dispose()
  }
})

defineExpose({ screenAdapter })
</script>

<style scoped>
.seller-container {
  width: 100%;
  height: 100%;
  padding: 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.seller-container .title {
  font-size: clamp(12px, 1.5vw, 14px);
  margin-bottom: 10px;
  flex-shrink: 0;
}

.seller-container.dark .title {
  color: #4c9bfd;
}

.seller-container.light .title {
  color: #333;
}

.seller-container .chart-container {
  width: 100%;
  flex: 1;
  min-height: 100px;
}
</style>
