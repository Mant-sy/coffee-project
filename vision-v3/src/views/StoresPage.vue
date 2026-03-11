<template>
  <div class="stores-container" :style="containerStyle">
    <header class="stores-header">
      <div>
        <img :src="headerSrc" alt="">
      </div>
      <span class="logo">
        <img :src="logoSrc" alt="" />
      </span>
      <span class="title">{{ region }}门店列表</span>
      <div class="title-right">
        <img :src="themeSrc" class="qiehuan" @click="handleChangeTheme">
        <span class="datetime">{{ currentTime }}</span>
      </div>
    </header>
    <div class="stores-body">
      <div class="stores-list">
        <div v-for="store in stores" :key="store.id" class="store-card">
          <h4 class="store-name">{{ store.store_name }}</h4>
          <div class="store-info">
            <p><strong>地址：</strong>{{ store.address }}</p>
            <p><strong>负责人：</strong>{{ store.manager }}</p>
            <p><strong>联系电话：</strong>{{ store.phone }}</p>
            <p><strong>开业时间：</strong>{{ store.open_date }}</p>
          </div>
          <button class="detail-btn" @click="goToStoreDetail(store.store_id)">查看详情</button>
        </div>
        <div v-if="stores.length === 0" class="empty-state">
          <p>该地区暂无门店数据</p>
        </div>
      </div>
    </div>
    <div class="all-stores-btn" @click="goToAllStores">全国门店</div>
    <div class="back-btn" @click="goBack">返回地图</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMainStore } from '@/store'
import { getThemeValue } from '@/utils/theme_utils'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const store = useMainStore()
const currentTime = ref('')
const stores = ref([])
const region = ref(route.query.city || route.query.region || '全国')

const logoSrc = computed(() => {
  return '/static/img/' + getThemeValue(store.theme).logoSrc
})

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

const fetchStores = async () => {
  try {
    const params = {}
    if (route.query.city) {
      params.city = route.query.city
    } else if (route.query.region) {
      params.region = route.query.region
    }
    const response = await axios.get('stores', { params })
    stores.value = response.data.data
  } catch (error) {
    console.error('获取门店数据失败:', error)
  }
}

const goToStoreDetail = (storeId) => {
  router.push({
    path: '/store/3d',
    query: {
      store_id: storeId
    }
  })
}

const goToAllStores = () => {
  router.push({
    path: '/stores'
  })
}

const handleChangeTheme = () => {
  store.changeTheme()
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
  fetchStores()
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
  background-color: #161522;
  color: #fff;
  box-sizing: border-box;
}

.stores-header {
  width: 100%;
  height: 64px;
  font-size: 20px;
  position: relative;
}
.stores-header > div img {
  width: 100%;
}
.stores-header .title {
  position: absolute;
  left: 50%;
  top: 50%;
  font-size: 20px;
  transform: translate(-50%, -50%);
}
.stores-header .title-right {
  display: flex;
  align-items: center;
  position:absolute;
  right: 0px;
  top: 50%;
  transform: translateY(-80%);
}
.stores-header .qiehuan {
  width: 28px;
  height: 21px;
  cursor: pointer;
}
.stores-header .datetime {
  font-size: 15px;
  margin-left: 10px;
}
.stores-header .logo {
  position: absolute;
  left: 0px;
  top: 50%;
  transform: translateY(-80%);
}
.stores-header .logo img {
  height: 35px;
  width: 128px;
}

.stores-body {
  width: 100%;
  height: calc(100% - 100px);
  margin-top: 20px;
  overflow-y: auto;
}

.stores-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.store-card {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 20px;
  box-sizing: border-box;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}
.store-card:hover {
  box-shadow: 0 4px 16px rgba(76, 155, 253, 0.3);
}
.store-card .store-name {
  font-size: 16px;
  margin-bottom: 15px;
  color: #4c9bfd;
}
.store-card .store-info {
  margin-bottom: 20px;
}
.store-card .store-info p {
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.4;
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
  color: #999;
}

.all-stores-btn {
  position: absolute;
  top: 80px;
  right: 20px;
  padding: 8px 16px;
  background-color: rgba(67, 162, 117, 0.8);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  z-index: 10;
}
.all-stores-btn:hover {
  background-color: #43a275;
  box-shadow: 0 2px 8px rgba(67, 162, 117, 0.5);
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
