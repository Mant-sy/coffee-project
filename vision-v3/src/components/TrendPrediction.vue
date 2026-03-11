<template>
  <div class="trend-prediction-container" :class="store.theme">
    <div class="header">
      <h3 class="title">销量趋势与预测</h3>
      <div class="controls">
        <label>预测天数：</label>
        <select v-model="predictionDays" @change="updatePrediction">
          <option value="7">7天</option>
          <option value="14">14天</option>
          <option value="30">30天</option>
        </select>
      </div>
    </div>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useMainStore } from '@/store'
import { getThemeValue } from '@/utils/theme_utils'
import socketService from '@/utils/socket_service'
import axios from 'axios'

const store = useMainStore()
const chartRef = ref(null)
const predictionDays = ref(7)
let chart = null
let historyData = { xData: [], series: [] }
let currentPredData = { xData: [], historyData: [], predictionData: [] }

const initChart = () => {
  chart = window.echarts.init(chartRef.value)
  socketService.send({
    action: 'getData',
    socketType: 'trend',
    chartName: 'trend',
    value: ''
  })
}

const handleTrendData = (data) => {
  if (data.socketType === 'trend' && data.data) {
    historyData = data.data
    updatePrediction()
  }
}

const updatePrediction = async () => {
  try {
    const response = await axios.get('sales/prediction', {
      params: { days: predictionDays.value }
    })
    if (response.data.success) {
      currentPredData = response.data.data
      renderChart(currentPredData)
    }
  } catch (error) {
    console.error('获取预测数据失败:', error)
    renderChart({ xData: historyData.xData, historyData: historyData.series, predictionData: [] })
  }
}

const renderChart = (predData) => {
  if (!chart) return
  
  const theme = getThemeValue(store.theme)
  
  const allXData = historyData.xData.concat(predData.xData.slice(historyData.xData.length))
  const historyLen = historyData.series.length
  const lastHistoryValue = historyData.series[historyLen - 1]
  
  const predictionSeries = new Array(historyLen - 1).fill(null)
    .concat([lastHistoryValue])
    .concat(predData.predictionData)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: store.theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: theme.primaryColor,
      textStyle: { color: theme.textColor }
    },
    legend: {
      data: ['历史销量', '预测销量'],
      textStyle: { color: theme.textColor, fontSize: 11 },
      top: 5,
      itemWidth: 15,
      itemHeight: 10
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
      data: allXData,
      axisLabel: { 
        color: theme.textColor, 
        fontSize: 9, 
        rotate: 45,
        interval: Math.floor(allXData.length / 10)
      },
      axisLine: { lineStyle: { color: store.theme === 'dark' ? '#4c9bfd' : '#ccc' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: theme.textColor, fontSize: 10 },
      splitLine: { lineStyle: { color: theme.splitColor } },
      axisLine: { lineStyle: { color: store.theme === 'dark' ? '#4c9bfd' : '#ccc' } }
    },
    series: [
      {
        name: '历史销量',
        type: 'line',
        data: historyData.series,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
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
        symbol: 'circle',
        symbolSize: 5,
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
  chart.setOption(option)
}

const screenAdapter = () => {
  if (chart) chart.resize()
}

watch(() => store.theme, () => {
  if (chart && historyData.series.length > 0) {
    renderChart(currentPredData)
  }
})

onMounted(() => {
  initChart()
  socketService.registerCallBack('trend', handleTrendData)
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
.trend-prediction-container {
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
  flex-shrink: 0;
  padding-right: 30px;
}

.title {
  font-size: clamp(12px, 1.5vw, 14px);
  margin: 0;
}

.trend-prediction-container.dark .title {
  color: #4c9bfd;
}

.trend-prediction-container.light .title {
  color: #333;
}

.controls {
  display: flex;
  align-items: center;
}

.controls label {
  margin-right: 6px;
  font-size: clamp(10px, 1vw, 12px);
}

.trend-prediction-container.dark .controls label {
  color: #aaa;
}

.trend-prediction-container.light .controls label {
  color: #666;
}

.controls select {
  padding: 3px 6px;
  border: 1px solid rgba(76, 155, 253, 0.5);
  border-radius: 4px;
  cursor: pointer;
  font-size: clamp(10px, 1vw, 12px);
}

.trend-prediction-container.dark .controls select {
  background-color: rgba(76, 155, 253, 0.1);
  color: #4c9bfd;
}

.trend-prediction-container.light .controls select {
  background-color: rgba(76, 155, 253, 0.1);
  color: #1a5bff;
}

.chart-container {
  width: 100%;
  flex: 1;
  min-height: 100px;
}
</style>
