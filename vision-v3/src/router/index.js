import { createRouter, createWebHashHistory } from 'vue-router'
import ScreenPage from '@/views/ScreenPage.vue'
import RegionStoresPage from '@/views/RegionStoresPage.vue'
import AllStoresPage from '@/views/AllStoresPage.vue'
import Store3DEnvironmentPage from '@/views/Store3DEnvironmentPage.vue'

const routes = [
  {
    path: '/',
    redirect: '/screen'
  },
  {
    path: '/screen',
    component: ScreenPage
  },
  {
    path: '/stores',
    component: RegionStoresPage
  },
  {
    path: '/stores/all',
    component: AllStoresPage
  },
  {
    path: '/store/3d',
    component: Store3DEnvironmentPage
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
export default router
