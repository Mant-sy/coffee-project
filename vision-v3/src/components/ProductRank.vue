<template>
  <div class="product-rank-container" ref="containerRef" :class="store.theme">
    <h3 class="title">商品销量排行榜</h3>
    <div class="rank-list" ref="listRef">
      <div 
        v-for="(item, index) in allData" 
        :key="item.name" 
        class="rank-item"
        :class="'rank-' + (index + 1)"
      >
        <div class="rank-badge" :class="'badge-' + (index + 1)">
          {{ getRankLabel(index + 1) }}
        </div>
        <div class="product-name">{{ item.name }}</div>
        <div class="product-bar-wrapper">
          <div 
            class="product-bar" 
            :style="{ width: getBarWidth(item.value) + '%' }"
          ></div>
        </div>
        <div class="product-value">{{ item.value }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onActivated, nextTick } from 'vue'
import { useMainStore } from '@/store'
import socketService from '@/utils/socket_service'

const store = useMainStore()
const containerRef = ref(null)
const listRef = ref(null)
let isChartReady = false
const allData = ref([])

const maxValue = computed(() => {
  if (allData.value.length === 0) return 1
  return Math.max(...allData.value.map(item => item.value))
})

const getRankLabel = (rank) => {
  if (rank <= 3) return `No.${rank}`
  return rank
}

const getBarWidth = (value) => {
  return (value / maxValue.value) * 100
}

const updateChart = () => {
  if (!isChartReady) return
  
  const sendRequest = () => {
    if (socketService.isConnected) {
      socketService.send({
        action: 'getData',
        socketType: 'productRank',
        chartName: 'productRank',
        value: ''
      })
    } else {
      setTimeout(sendRequest, 100)
    }
  }
  sendRequest()
}

const handleData = (data) => {
  if (data.socketType === 'productRank' && data.data) {
    allData.value = data.data.sort((a, b) => b.value - a.value)
  }
}

const screenAdapter = () => {
}

onMounted(() => {
  isChartReady = true
  updateChart()
  socketService.registerCallBack('productRank', handleData)
  window.addEventListener('resize', screenAdapter)
})

onActivated(() => {
  if (isChartReady) {
    updateChart()
  }
})

onUnmounted(() => {
  socketService.unRegisterCallBack('productRank')
  window.removeEventListener('resize', screenAdapter)
})

defineExpose({ screenAdapter })
</script>

<style scoped>
.product-rank-container {
  width: 100%;
  height: 100%;
  padding: 15px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.product-rank-container .title {
  font-size: 18px;
  margin-bottom: 15px;
  flex-shrink: 0;
  font-weight: bold;
}

.product-rank-container.dark .title {
  color: #4c9bfd;
}

.product-rank-container.light .title {
  color: #333;
}

.rank-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
  max-height: 380px;
  min-height: 0;
}

.rank-list::-webkit-scrollbar {
  width: 8px;
}

.rank-list::-webkit-scrollbar-track {
  background: rgba(76, 155, 253, 0.15);
  border-radius: 4px;
  border: 1px solid rgba(76, 155, 253, 0.3);
}

.rank-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #4c9bfd, #1a5bff);
  border-radius: 4px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  min-height: 30px;
  box-shadow: 0 2px 6px rgba(76, 155, 253, 0.4);
}

.rank-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #5da9fd, #2a6bff);
  border-color: rgba(255, 255, 255, 0.5);
}

.rank-list::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, #6db9fe, #3a7cff);
  border-color: rgba(255, 255, 255, 0.7);
}

.rank-list::-webkit-scrollbar-button {
  display: none;
}

.rank-list::-webkit-scrollbar-corner {
  background: transparent;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  transition: all 0.3s ease;
  height: 40px;
  flex-shrink: 0;
  border-radius: 8px;
}

.product-rank-container.dark .rank-item {
  background: rgba(76, 155, 253, 0.05);
}

.product-rank-container.light .rank-item {
  background: rgba(76, 155, 253, 0.08);
}

.product-rank-container.dark .rank-item:hover {
  background: rgba(76, 155, 253, 0.12);
  transform: translateX(3px);
}

.product-rank-container.light .rank-item:hover {
  background: rgba(76, 155, 253, 0.15);
  transform: translateX(3px);
}

.rank-badge {
  min-width: 52px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  background: linear-gradient(135deg, #4c9bfd, #1a5bff);
  color: #fff;
  box-shadow: 0 2px 8px rgba(76, 155, 253, 0.3);
}

.rank-badge.badge-1 {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  box-shadow: 0 2px 8px rgba(255, 165, 0, 0.4);
}

.rank-badge.badge-2 {
  background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
  box-shadow: 0 2px 8px rgba(192, 192, 192, 0.3);
}

.rank-badge.badge-3 {
  background: linear-gradient(135deg, #CD7F32, #8B4513);
  box-shadow: 0 2px 8px rgba(205, 127, 50, 0.3);
}

.product-name {
  min-width: 100px;
  max-width: 100px;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  font-weight: 500;
}

.product-rank-container.dark .product-name {
  color: #fff;
}

.product-rank-container.light .product-name {
  color: #333;
}

.product-bar-wrapper {
  flex: 1;
  max-width: calc(100% - 200px);
  height: 20px;
  border-radius: 10px;
  overflow: hidden;
}

.product-rank-container.dark .product-bar-wrapper {
  background: rgba(76, 155, 253, 0.1);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.product-rank-container.light .product-bar-wrapper {
  background: rgba(76, 155, 253, 0.15);
  box-shadow: inset 0 1px 3px rgba(76, 155, 253, 0.1);
}

.product-bar {
  height: 100%;
  background: linear-gradient(90deg, #1a5bff, #4c9bfd);
  border-radius: 10px;
  transition: width 0.5s ease;
  box-shadow: 0 0 8px rgba(76, 155, 253, 0.3);
}

.rank-1 .product-bar {
  background: linear-gradient(90deg, #FFA500, #FFD700);
  box-shadow: 0 0 8px rgba(255, 165, 0, 0.4);
}

.rank-2 .product-bar {
  background: linear-gradient(90deg, #A0A0A0, #C0C0C0);
  box-shadow: 0 0 8px rgba(192, 192, 192, 0.3);
}

.rank-3 .product-bar {
  background: linear-gradient(90deg, #8B4513, #CD7F32);
  box-shadow: 0 0 8px rgba(205, 127, 50, 0.3);
}

.product-value {
  min-width: 60px;
  font-size: 16px;
  font-weight: bold;
  text-align: right;
}

.product-rank-container.dark .product-value {
  color: #4c9bfd;
}

.product-rank-container.light .product-value {
  color: #1a5bff;
}
</style>
