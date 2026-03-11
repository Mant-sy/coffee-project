import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import axios from 'axios'
import socketService from './utils/socket_service'

// 引入字体的文件
import './assets/font/iconfont.css'
// 引入全局的样式文件
import './assets/css/global.css'

const app = createApp(App)
const pinia = createPinia()

// 对服务端进行websocket的连接
socketService.connect()

// 请求基准路径的配置
axios.defaults.baseURL = 'http://localhost:8888/api/'

// 全局属性
app.config.globalProperties.$socket = socketService
app.config.globalProperties.$http = axios
app.config.globalProperties.$echarts = window.echarts

app.use(router)
app.use(pinia)
app.mount('#app')