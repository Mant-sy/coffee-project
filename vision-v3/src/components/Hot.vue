<template>
  <div class="hot-container" :class="store.theme">
    <h3 class="title">热销商品占比</h3>
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
let currentData = null

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
        socketType: 'hot',
        chartName: 'hot',
        value: ''
      })
    } else {
      setTimeout(sendRequest, 100)
    }
  }
  sendRequest()
}

const handleData = (data) => {
  if (data.socketType === 'hot' && data.data) {
    currentData = data.data
    renderChart(data.data)
  }
}

const renderChart = (data) => {
  if (!chart) return
  
  const theme = getThemeValue(store.theme)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: store.theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: theme.primaryColor,
      textStyle: { color: theme.textColor }
    },
    legend: {
      type: 'scroll',
      orient: 'horizontal',
      left: 'center',
      bottom: 5,
      textStyle: { 
        color: theme.textColor, 
        fontSize: 11 
      },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 10
    },
    series: [
      {
        name: '热销商品',
        type: 'pie',
        radius: ['25%', '45%'],
        center: ['50%', '42%'],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          },
          label: {
            show: true,
            fontSize: 13,
            fontWeight: 'bold'
          }
        },
        itemStyle: {
          borderRadius: 6,
          borderColor: store.theme === 'dark' ? '#161522' : '#fff',
          borderWidth: 1
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          fontSize: 12
        },
        labelLine: {
          show: true,
          length: 8,
          length2: 8
        }
      }
    ],
    color: ['#FFD700', '#C0C0C0', '#CD7F32', '#4c9bfd', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452']
  }
  chart.setOption(option)
}

const screenAdapter = () => {
  if (chart) {
    chart.resize()
  }
}

watch(() => store.theme, () => {
  if (chart && isChartReady && currentData) {
    renderChart(currentData)
  }
})

onMounted(() => {
  initChart()
  socketService.registerCallBack('hot', handleData)
  window.addEventListener('resize', screenAdapter)
})

onActivated(() => {
  if (chart && isChartReady) {
    updateChart()
  }
})

onUnmounted(() => {
  socketService.unRegisterCallBack('hot')
  window.removeEventListener('resize', screenAdapter)
  if (chart) {
    chart.dispose()
  }
})

defineExpose({ screenAdapter })
</script>

<style scoped>
.hot-container {
  width: 100%;
  height: 100%;
  padding: 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.hot-container .title {
  font-size: clamp(12px, 1.5vw, 14px);
  margin-bottom: 10px;
  flex-shrink: 0;
}

.hot-container.dark .title {
  color: #4c9bfd;
}

.hot-container.light .title {
  color: #333;
}

.hot-container .chart-container {
  width: 100%;
  flex: 1;
  min-height: 100px;
}
</style>
