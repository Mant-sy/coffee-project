<template>
  <div class="stores-container" :class="store.theme">
    <header class="stores-header">
      <div>
        <img :src="headerSrc" alt="">
      </div>
      <div class="title-left"></div>
      <span class="title">全国门店列表</span>
      <div class="title-right">
        <img :src="themeSrc" class="qiehuan" @click="handleChangeTheme">
        <span class="datetime">{{ currentTime }}</span>
      </div>
    </header>
    <div class="filter-bar">
      <label class="filter-label">选择区域：</label>
      <select v-model="selectedProvince" class="region-select" @change="onProvinceChange">
        <option value="">全部省份</option>
        <option v-for="province in provinces" :key="province.name" :value="province.name">
          {{ province.name }}
        </option>
      </select>
      <select 
        v-model="selectedCity" 
        class="region-select" 
        @change="onCityChange"
        :disabled="!selectedProvince"
      >
        <option value="">全部城市</option>
        <option v-for="city in availableCities" :key="city.name" :value="city.name">
          {{ city.name }} ({{ city.count }}家)
        </option>
      </select>
      <button class="reset-btn" @click="resetFilter">重置</button>
      <span class="store-count">共 {{ filteredStores.length }} 家门店</span>
    </div>
    <div class="stores-body">
      <div class="stores-list">
        <div v-for="store in filteredStores" :key="store.store_id" class="store-card">
          <h4 class="store-name">{{ store.store_name }}</h4>
          <div class="store-info">
            <p><strong>省份：</strong>{{ store.region }}</p>
            <p><strong>城市：</strong>{{ store.city }}</p>
            <p><strong>地址：</strong>{{ store.address }}</p>
            <p><strong>负责人：</strong>{{ store.manager }}</p>
            <p><strong>联系电话：</strong>{{ store.phone }}</p>
          </div>
          <button class="detail-btn" @click="goToStoreDetail(store.store_id)">查看详情</button>
        </div>
        <div v-if="filteredStores.length === 0" class="empty-state">
          <p>暂无门店数据</p>
        </div>
      </div>
    </div>
    <div class="back-btn" @click="goBack">返回大屏</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { useMainStore } from '@/store'
import { getThemeValue } from '@/utils/theme_utils'
import axios from 'axios'

const router = useRouter()
const store = useMainStore()
const currentTime = ref('')
const allStores = ref([])
const provinces = ref([])
const selectedProvince = ref('')
const selectedCity = ref('')

const headerSrc = computed(() => {
  return '/static/img/' + getThemeValue(store.theme).headerBorderSrc
})

const themeSrc = computed(() => {
  return '/static/img/' + getThemeValue(store.theme).themeSrc
})

const containerStyle = computed(() => {
  return {
    backgroundColor: getThemeValue(store.theme).backgroundColor,
    color: getThemeValue(store.theme).titleColor
  }
})

const availableCities = computed(() => {
  if (!selectedProvince.value) return []
  const province = provinces.value.find(p => p.name === selectedProvince.value)
  return province ? province.cities : []
})

const filteredStores = computed(() => {
  if (!selectedProvince.value && !selectedCity.value) {
    return allStores.value
  }
  
  return allStores.value.filter(s => {
    if (selectedCity.value) {
      return s.city === selectedCity.value
    }
    if (selectedProvince.value) {
      return s.region === selectedProvince.value
    }
    return true
  })
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

const fetchRegionTree = async () => {
  try {
    const response = await axios.get('regions/tree')
    if (response.data.success) {
      provinces.value = response.data.data
    }
  } catch (error) {
    console.error('获取区域数据失败:', error)
  }
}

const fetchAllStores = async () => {
  try {
    const response = await axios.get('stores')
    allStores.value = response.data.data
  } catch (error) {
    console.error('获取门店数据失败:', error)
  }
}

const onProvinceChange = () => {
  selectedCity.value = ''
}

const onCityChange = () => {
}

const resetFilter = () => {
  selectedProvince.value = ''
  selectedCity.value = ''
}

const goToStoreDetail = (storeId) => {
  router.push({
    path: '/store/3d',
    query: {
      store_id: storeId,
      from: 'all'
    }
  })
}

const handleChangeTheme = () => {
  store.changeTheme()
}

const goBack = () => {
  router.push('/screen')
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
  fetchRegionTree()
  fetchAllStores()
})

onActivated(() => {
  fetchRegionTree()
  fetchAllStores()
})

onUnmounted(() => {
  clearInterval(updateTime)
})
</script>

<style scoped>
.stores-container {
  width: 100%;
  height: 100vh;
  padding: 0 20px;
  box-sizing: border-box;
}

.stores-container.dark {
  background-color: #161522;
  color: #fff;
}

.stores-container.light {
  background-color: #f0f2f5;
  color: #333;
}

.stores-header {
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
.stores-header > div img {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
.stores-header .title-left {
  flex: 1;
  min-width: 200px;
  z-index: 1;
}
.stores-header .title {
  flex: 2;
  text-align: center;
  font-size: 24px;
  white-space: nowrap;
  z-index: 1;
}
.stores-header .title-right {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  z-index: 1;
}
.stores-header .qiehuan {
  width: 28px;
  height: 21px;
  cursor: pointer;
  margin-right: 15px;
}
.stores-header .datetime {
  font-size: 16px;
  white-space: nowrap;
}

.filter-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 15px 20px;
  border-radius: 8px;
  margin: 10px 0;
  gap: 15px;
}

.stores-container.dark .filter-bar {
  background-color: rgba(0, 0, 0, 0.2);
}

.stores-container.light .filter-bar {
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(76, 155, 253, 0.1);
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
}

.stores-container.dark .filter-label {
  color: #ccc;
}

.stores-container.light .filter-label {
  color: #333;
}

.region-select {
  padding: 8px 16px;
  border: 1px solid;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  min-width: 150px;
}

.stores-container.dark .region-select {
  background-color: rgba(76, 155, 253, 0.2);
  color: #fff;
  border-color: rgba(76, 155, 253, 0.5);
}

.stores-container.light .region-select {
  background-color: rgba(76, 155, 253, 0.1);
  color: #1a5bff;
  border-color: rgba(76, 155, 253, 0.3);
}

.region-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.region-select:focus {
  outline: none;
  border-color: #4c9bfd;
}

.region-select option {
  background-color: #1a1a2e;
  color: #fff;
}

.reset-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stores-container.dark .reset-btn {
  background-color: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.5);
}

.stores-container.light .reset-btn {
  background-color: rgba(255, 107, 107, 0.15);
  color: #e55555;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.reset-btn:hover {
  background-color: rgba(255, 107, 107, 0.4);
}

.store-count {
  font-size: 14px;
  margin-left: auto;
}

.stores-container.dark .store-count {
  color: #4c9bfd;
}

.stores-container.light .store-count {
  color: #1a5bff;
}

.stores-body {
  width: 100%;
  height: calc(100% - 176px);
  overflow-y: auto;
}

.stores-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.store-card {
  border-radius: 8px;
  padding: 20px;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.stores-container.dark .store-card {
  background-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stores-container.light .store-card {
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 12px rgba(76, 155, 253, 0.15);
  border: 1px solid rgba(76, 155, 253, 0.2);
}

.store-card:hover {
  box-shadow: 0 4px 16px rgba(76, 155, 253, 0.3);
}

.store-card .store-name {
  font-size: 16px;
  margin-bottom: 15px;
}

.stores-container.dark .store-card .store-name {
  color: #4c9bfd;
}

.stores-container.light .store-card .store-name {
  color: #1a5bff;
}

.store-card .store-info {
  margin-bottom: 20px;
}

.store-card .store-info p {
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.4;
}

.stores-container.dark .store-card .store-info p {
  color: #ccc;
}

.stores-container.light .store-card .store-info p {
  color: #555;
}

.store-card .detail-btn {
  padding: 8px 16px;
  background-color: rgba(76, 155, 253, 0.8);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.store-card .detail-btn:hover {
  background-color: #4c9bfd;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  font-size: 16px;
}

.stores-container.dark .empty-state {
  color: #999;
}

.stores-container.light .empty-state {
  color: #666;
}

.back-btn {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  background-color: rgba(76, 155, 253, 0.8);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background-color: #4c9bfd;
  box-shadow: 0 2px 8px rgba(76, 155, 253, 0.5);
}
</style>
