<template>
  <div class="rank-container">
    <h3 class="title">地区销量排行</h3>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useMainStore } from '@/store'
import socketService from '@/utils/socket_service'

const store = useMainStore()
const chartRef = ref(null)
let chart = null

const initChart = () => {
  if (chart) {
    chart.dispose()
  }
  chart = window.echarts.init(chartRef.value)
  updateChart()
}

const updateChart = () => {
  socketService.send({
    action: 'getData',
    socketType: 'rank',
    chartName: 'rank',
    value: ''
  })
}

const handleData = (data) => {
  if (data.socketType === 'rank' && data.data) {
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: store.theme === 'dark' ? '#4c9bfd' : '#333'
          }
        },
        axisLabel: {
          color: store.theme === 'dark' ? '#fff' : '#333'
        },
        splitLine: {
          lineStyle: {
            color: store.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      yAxis: {
        type: 'category',
        data: data.data.xData,
        axisLine: {
          lineStyle: {
            color: store.theme === 'dark' ? '#4c9bfd' : '#333'
          }
        },
        axisLabel: {
          color: store.theme === 'dark' ? '#fff' : '#333'
        }
      },
      series: [
        {
          name: '销量',
          type: 'bar',
          data: data.data.series,
          itemStyle: {
            color: new window.echarts.graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 0, color: '#4c9bfd' },
              { offset: 1, color: '#1a5bff' }
            ])
          }
        }
      ]
    }
    chart.setOption(option)
  }
}

const screenAdapter = () => {
  if (chart) {
    chart.resize()
  }
}

onMounted(() => {
  initChart()
  socketService.registerCallBack('rank', handleData)
  window.addEventListener('resize', screenAdapter)
})

onUnmounted(() => {
  socketService.unRegisterCallBack('rank')
  window.removeEventListener('resize', screenAdapter)
  if (chart) {
    chart.dispose()
  }
})

defineExpose({
  screenAdapter
})
</script>

<style scoped>
.rank-container {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 10px;
  box-sizing: border-box;
  .title {
    font-size: 14px;
    margin-bottom: 10px;
  }
  .chart-container {
    width: 100%;
    height: calc(100% - 30px);
  }
}
</style>
