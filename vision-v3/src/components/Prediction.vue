<template>
  <div class="prediction-container">
    <h3 class="title">销量预测</h3>
    <div ref="chartRef" class="chart-container"></div>
    <div class="prediction-controls">
      <label>预测天数：</label>
      <select v-model="predictionDays" @change="updatePrediction">
        <option value="7">7天</option>
        <option value="14">14天</option>
        <option value="30">30天</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useMainStore } from '@/store'
import { getThemeValue } from '@/utils/theme_utils'
import axios from 'axios'

const store = useMainStore()
const chartRef = ref(null)
const predictionDays = ref(7)
let chart = null

const initChart = () => {
  chart = window.echarts.init(chartRef.value)
  updatePrediction()
}

const updatePrediction = async () => {
  try {
    const response = await axios.get('sales/prediction', {
      params: { days: predictionDays.value }
    })
    if (response.data.success) {
      renderChart(response.data.data)
    }
  } catch (error) {
    console.error('获取预测数据失败:', error)
  }
}

const renderChart = (data) => {
  if (!chart || !data) return
  
  const theme = getThemeValue(store.theme)
  const historyLen = data.historyData.length
  
  const predictionSeries = new Array(historyLen).fill(null).concat(data.predictionData)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['历史销量', '预测销量'],
      textStyle: { color: theme.textColor },
      top: 5
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.xData,
      axisLabel: { color: theme.textColor, rotate: 45, fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: theme.textColor },
      splitLine: { lineStyle: { color: theme.splitColor } }
    },
    series: [
      {
        name: '历史销量',
        type: 'line',
        data: data.historyData,
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
        lineStyle: { color: '#91cc75', type: 'dashed', width: 2 },
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

onMounted(() => {
  initChart()
  window.addEventListener('resize', screenAdapter)
})

onUnmounted(() => {
  window.removeEventListener('resize', screenAdapter)
  if (chart) chart.dispose()
})

defineExpose({ screenAdapter })
</script>

<style scoped>
.prediction-container {
  width: 100%;
  height: 100%;
  padding: 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.title {
  font-size: clamp(12px, 1.5vw, 14px);
  margin-bottom: 10px;
  color: #4c9bfd;
}
.chart-container {
  width: 100%;
  flex: 1;
  min-height: 100px;
}
.prediction-controls {
  margin-top: 10px;
  display: flex;
  align-items: center;
}
.prediction-controls label {
  margin-right: 10px;
  font-size: clamp(11px, 1vw, 14px);
}
.prediction-controls select {
  padding: 4px 8px;
  background-color: rgba(76, 155, 253, 0.1);
  color: #4c9bfd;
  border: 1px solid rgba(76, 155, 253, 0.5);
  border-radius: 4px;
  cursor: pointer;
  font-size: clamp(11px, 1vw, 13px);
}
</style>
