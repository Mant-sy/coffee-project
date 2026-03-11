<template>
  <div class="trend-container">
    <div class="header">
      <h3 class="title">销量趋势</h3>
    </div>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useMainStore } from '@/store'
import { getThemeValue } from '@/utils/theme_utils'
import socketService from '@/utils/socket_service'

const store = useMainStore()
const chartRef = ref(null)
let chart = null

const initChart = () => {
  chart = window.echarts.init(chartRef.value)
  socketService.send({
    action: 'getData',
    socketType: 'trend',
    chartName: 'trend',
    value: ''
  })
}

const handleData = (data) => {
  if (data.socketType === 'trend' && data.data) {
    renderChart(data.data)
  }
}

const renderChart = (data) => {
  if (!chart) return
  
  const theme = getThemeValue(store.theme)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['销量柱形', '销量趋势'],
      textStyle: { color: theme.textColor },
      top: 5
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '18%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.xData,
      axisLabel: { color: theme.textColor, fontSize: 10, rotate: 45 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: theme.textColor },
      splitLine: { lineStyle: { color: theme.splitColor } }
    },
    series: [
      {
        name: '销量柱形',
        type: 'bar',
        data: data.series,
        barMaxWidth: 25,
        itemStyle: {
          color: 'rgba(76, 155, 253, 0.6)',
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '销量趋势',
        type: 'line',
        data: data.series,
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { color: '#91cc75', width: 2 },
        itemStyle: { color: '#91cc75' }
      }
    ]
  }
  chart.setOption(option)
}

const screenAdapter = () => {
  if (chart) chart.resize()
}

onMounted(() => {
  initChart()
  socketService.registerCallBack('trend', handleData)
  window.addEventListener('resize', screenAdapter)
})

onUnmounted(() => {
  socketService.unRegisterCallBack('trend')
  window.removeEventListener('resize', screenAdapter)
  if (chart) chart.dispose()
})

defineExpose({ screenAdapter })
</script>

<style scoped>
.trend-container {
  width: 100%;
  height: 100%;
  padding: 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.title {
  font-size: clamp(12px, 1.5vw, 14px);
  margin: 0;
  color: #4c9bfd;
}
.chart-container {
  width: 100%;
  flex: 1;
  min-height: 100px;
}
</style>
