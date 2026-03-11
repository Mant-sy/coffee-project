<template>
  <div class="stock-container">
    <h3 class="title">库存销量分析</h3>
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
    socketType: 'stock',
    chartName: 'stock',
    value: ''
  })
}

const handleData = (data) => {
  if (data.socketType === 'stock' && data.data) {
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        }
      },
      legend: {
        data: ['库存', '销量'],
        textStyle: {
          color: store.theme === 'dark' ? '#fff' : '#333'
        }
      },
      xAxis: [
        {
          type: 'category',
          data: data.data.xData,
          axisPointer: {
            type: 'shadow'
          },
          axisLine: {
            lineStyle: {
              color: store.theme === 'dark' ? '#4c9bfd' : '#333'
            }
          },
          axisLabel: {
            color: store.theme === 'dark' ? '#fff' : '#333'
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '库存',
          min: 0,
          max: 250,
          interval: 50,
          axisLine: {
            lineStyle: {
              color: '#5470c6'
            }
          },
          axisLabel: {
            color: store.theme === 'dark' ? '#fff' : '#333',
            formatter: '{value}'
          },
          splitLine: {
            lineStyle: {
              color: store.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        {
          type: 'value',
          name: '销量',
          min: 0,
          max: 250,
          interval: 50,
          axisLine: {
            lineStyle: {
              color: '#91cc75'
            }
          },
          axisLabel: {
            color: store.theme === 'dark' ? '#fff' : '#333',
            formatter: '{value}'
          },
          splitLine: {
            show: false
          }
        }
      ],
      series: [
        {
          name: '库存',
          type: 'bar',
          data: data.data.stockData,
          itemStyle: {
            color: '#5470c6'
          }
        },
        {
          name: '销量',
          type: 'line',
          yAxisIndex: 1,
          data: data.data.salesData,
          itemStyle: {
            color: '#91cc75'
          },
          lineStyle: {
            color: '#91cc75'
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
  socketService.registerCallBack('stock', handleData)
  window.addEventListener('resize', screenAdapter)
})

onUnmounted(() => {
  socketService.unRegisterCallBack('stock')
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
.stock-container {
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
