<template>
  <div class="store3d-env-container" :style="containerStyle">
    <header class="env-header">
      <div>
        <img :src="headerSrc" alt="">
      </div>
      <span class="logo">
        <img :src="logoSrc" alt="" />
      </span>
      <span class="title">门店3D环境</span>
      <div class="title-right">
        <img :src="themeSrc" class="qiehuan" @click="handleChangeTheme">
        <span class="datetime">{{ currentTime }}</span>
      </div>
    </header>
    <div class="env-body">
      <div class="info-panel">
        <h3 class="store-name">{{ store.store_name }}</h3>
        <p class="store-info">地址：{{ store.address }}</p>
        <p class="store-info">负责人：{{ store.manager }}</p>
        <p class="store-info">联系电话：{{ store.phone }}</p>
      </div>
      <div ref="containerRef" class="canvas-container"></div>
    </div>
    <div class="back-btn" @click="goBack">返回门店列表</div>
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
const mainStore = useMainStore()
const currentTime = ref('')
const storeId = ref(route.query.store_id)
const store = ref({})
const containerRef = ref(null)
let scene = null
let camera = null
let renderer = null
let controls = null
let animationId = null

const logoSrc = computed(() => {
  return '/static/img/' + getThemeValue(mainStore.theme).logoSrc
})

const headerSrc = computed(() => {
  return '/static/img/' + getThemeValue(mainStore.theme).headerBorderSrc
})

const themeSrc = computed(() => {
  return '/static/img/' + getThemeValue(mainStore.theme).themeSrc
})

const containerStyle = computed(() => {
  return {
    backgroundColor: getThemeValue(mainStore.theme).backgroundColor,
    color: getThemeValue(mainStore.theme).titleColor
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

const fetchStoreDetail = async () => {
  try {
    const response = await axios.get('/api/store/detail', {
      params: {
        store_id: storeId.value
      }
    })
    store.value = response.data.data
  } catch (error) {
    console.error('获取门店详情失败:', error)
  }
}

const initScene = () => {
  if (!containerRef.value) return
  
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1a2e)
  scene.fog = new THREE.Fog(0x1a1a2e, 15, 30)
  
  const aspect = containerRef.value.clientWidth / containerRef.value.clientHeight
  camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100)
  camera.position.set(8, 6, 8)
  
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  containerRef.value.appendChild(renderer.domElement)
  
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.minDistance = 3
  controls.maxDistance = 20
  controls.maxPolarAngle = Math.PI / 2
  
  addLights()
  createCoffeeShop()
  
  animate()
}

const addLights = () => {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)
  
  const mainLight = new THREE.DirectionalLight(0xffffff, 0.8)
  mainLight.position.set(5, 10, 5)
  mainLight.castShadow = true
  mainLight.shadow.mapSize.width = 2048
  mainLight.shadow.mapSize.height = 2048
  mainLight.shadow.camera.near = 0.5
  mainLight.shadow.camera.far = 50
  mainLight.shadow.camera.left = -10
  mainLight.shadow.camera.right = 10
  mainLight.shadow.camera.top = 10
  mainLight.shadow.camera.bottom = -10
  scene.add(mainLight)
  
  const warmLight = new THREE.PointLight(0xffaa55, 0.6, 15)
  warmLight.position.set(0, 3, 0)
  scene.add(warmLight)
  
  const spotLight1 = new THREE.SpotLight(0xffffff, 0.5)
  spotLight1.position.set(-3, 4, 2)
  spotLight1.angle = Math.PI / 6
  spotLight1.penumbra = 0.3
  scene.add(spotLight1)
  
  const spotLight2 = new THREE.SpotLight(0xffffff, 0.5)
  spotLight2.position.set(3, 4, 2)
  spotLight2.angle = Math.PI / 6
  spotLight2.penumbra = 0.3
  scene.add(spotLight2)
}

const createCoffeeShop = () => {
  createFloor()
  createWalls()
  createCeiling()
  createCounter()
  createCoffeeMachine()
  createTables()
  createChairs()
  createMenuBoard()
  createDecorations()
  createDoor()
  createWindows()
}

const createFloor = () => {
  const floorGeometry = new THREE.PlaneGeometry(12, 10)
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8b7355,
    roughness: 0.8,
    metalness: 0.1
  })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)
  
  const plankWidth = 12
  const plankLength = 0.8
  const plankGeometry = new THREE.PlaneGeometry(plankWidth, plankLength)
  const plankMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x6b5344,
    roughness: 0.9
  })
  
  for (let z = -4.5; z <= 4.5; z += plankLength + 0.05) {
    const plank = new THREE.Mesh(plankGeometry, plankMaterial)
    plank.rotation.x = -Math.PI / 2
    plank.position.set(0, 0.01, z)
    plank.receiveShadow = true
    scene.add(plank)
  }
}

const createWalls = () => {
  const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xf5f0e6,
    roughness: 0.9
  })
  
  const backWallGeometry = new THREE.BoxGeometry(12, 5, 0.2)
  const backWall = new THREE.Mesh(backWallGeometry, wallMaterial)
  backWall.position.set(0, 2.5, -5)
  backWall.receiveShadow = true
  scene.add(backWall)
  
  const leftWallGeometry = new THREE.BoxGeometry(0.2, 5, 10)
  const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial)
  leftWall.position.set(-6, 2.5, 0)
  leftWall.receiveShadow = true
  scene.add(leftWall)
  
  const rightWallGeometry = new THREE.BoxGeometry(0.2, 5, 10)
  const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial)
  rightWall.position.set(6, 2.5, 0)
  rightWall.receiveShadow = true
  scene.add(rightWall)
  
  const wainscotMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4a3728,
    roughness: 0.7
  })
  
  const wainscotGeometry = new THREE.BoxGeometry(11.6, 1.2, 0.1)
  const wainscot = new THREE.Mesh(wainscotGeometry, wainscotMaterial)
  wainscot.position.set(0, 0.6, -4.85)
  scene.add(wainscot)
}

const createCeiling = () => {
  const ceilingGeometry = new THREE.PlaneGeometry(12, 10)
  const ceilingMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    roughness: 0.9
  })
  const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial)
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.y = 5
  scene.add(ceiling)
  
  const frameGeometry = new THREE.BoxGeometry(2, 0.1, 2)
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 })
  
  for (let x = -3; x <= 3; x += 3) {
    for (let z = -2; z <= 2; z += 2) {
      const frame = new THREE.Mesh(frameGeometry, frameMaterial)
      frame.position.set(x, 4.95, z)
      scene.add(frame)
      
      const lightGeometry = new THREE.BoxGeometry(1.8, 0.05, 1.8)
      const lightMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffee,
        emissive: 0xffffee,
        emissiveIntensity: 0.5
      })
      const light = new THREE.Mesh(lightGeometry, lightMaterial)
      light.position.set(x, 4.9, z)
      scene.add(light)
    }
  }
}

const createCounter = () => {
  const counterGroup = new THREE.Group()
  
  const counterGeometry = new THREE.BoxGeometry(5, 1.1, 1.2)
  const counterMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x5d4e37,
    roughness: 0.6
  })
  const counter = new THREE.Mesh(counterGeometry, counterMaterial)
  counter.position.set(-1.5, 0.55, -4)
  counter.castShadow = true
  counter.receiveShadow = true
  counterGroup.add(counter)
  
  const topGeometry = new THREE.BoxGeometry(5.2, 0.1, 1.4)
  const topMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2c2c2c,
    roughness: 0.3,
    metalness: 0.5
  })
  const top = new THREE.Mesh(topGeometry, topMaterial)
  top.position.set(-1.5, 1.15, -4)
  top.castShadow = true
  counterGroup.add(top)
  
  const frontPanelGeometry = new THREE.BoxGeometry(5, 0.8, 0.1)
  const frontPanelMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3d3d3d,
    roughness: 0.5
  })
  const frontPanel = new THREE.Mesh(frontPanelGeometry, frontPanelMaterial)
  frontPanel.position.set(-1.5, 0.4, -3.35)
  counterGroup.add(frontPanel)
  
  scene.add(counterGroup)
}

const createCoffeeMachine = () => {
  const machineGroup = new THREE.Group()
  
  const bodyGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.5)
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a,
    roughness: 0.3,
    metalness: 0.8
  })
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.position.set(-3, 1.6, -4)
  body.castShadow = true
  machineGroup.add(body)
  
  const topGeometry = new THREE.BoxGeometry(0.65, 0.15, 0.55)
  const topMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x333333,
    metalness: 0.9
  })
  const topPart = new THREE.Mesh(topGeometry, topMaterial)
  topPart.position.set(-3, 2.05, -4)
  machineGroup.add(topPart)
  
  const portafilterGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 16)
  const portafilterMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x666666,
    metalness: 0.9
  })
  const portafilter = new THREE.Mesh(portafilterGeometry, portafilterMaterial)
  portafilter.position.set(-3, 1.35, -3.7)
  portafilter.rotation.x = Math.PI / 2
  machineGroup.add(portafilter)
  
  const cupGeometry = new THREE.CylinderGeometry(0.06, 0.05, 0.12, 16)
  const cupMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    roughness: 0.5
  })
  const cup = new THREE.Mesh(cupGeometry, cupMaterial)
  cup.position.set(-3, 1.26, -3.65)
  machineGroup.add(cup)
  
  scene.add(machineGroup)
}

const createTables = () => {
  const tablePositions = [
    { x: 3, z: 0 },
    { x: 3, z: 3 },
    { x: -3, z: 0 },
    { x: -3, z: 3 }
  ]
  
  tablePositions.forEach(pos => {
    const tableGroup = new THREE.Group()
    
    const topGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.05, 32)
    const topMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8b7355,
      roughness: 0.6
    })
    const top = new THREE.Mesh(topGeometry, topMaterial)
    top.position.y = 0.75
    top.castShadow = true
    top.receiveShadow = true
    tableGroup.add(top)
    
    const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 16)
    const legMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      metalness: 0.8
    })
    const leg = new THREE.Mesh(legGeometry, legMaterial)
    leg.position.y = 0.35
    leg.castShadow = true
    tableGroup.add(leg)
    
    const baseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.03, 32)
    const base = new THREE.Mesh(baseGeometry, legMaterial)
    base.position.y = 0.015
    base.receiveShadow = true
    tableGroup.add(base)
    
    tableGroup.position.set(pos.x, 0, pos.z)
    scene.add(tableGroup)
  })
}

const createChairs = () => {
  const chairPositions = [
    { x: 2.2, z: 0.5, rot: Math.PI / 4 },
    { x: 3.8, z: 0.5, rot: -Math.PI / 4 },
    { x: 2.2, z: -0.5, rot: 3 * Math.PI / 4 },
    { x: 3.8, z: -0.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: Math.PI / 4 },
    { x: 3.8, z: 3.5, rot: -Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: 3 * Math.PI / 4 },
    { x: 3.8, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: 3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: 3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: 3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: 3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: 3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: 3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.纹 -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.js / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 }
  ]
  
  tablePositions.forEach(pos => {
    const tableGroup = new THREE.Group()
    
    const topGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.05, 32)
    const topMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8b7355,
      roughness: 0.6
    })
    const top = new THREE.Mesh(topGeometry, topMaterial)
    top.position.y = 0.75
    top.castShadow = true
    top.receiveShadow = true
    tableGroup.add(top)
    
    const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 16)
    const legMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      metalness: 0.8
    })
    const leg = new THREE.Mesh(legGeometry, legMaterial)
    leg.position.y = 0.35
    leg.castShadow = true
    tableGroup.add(leg)
    
    const baseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.03, 32)
    const base = new THREE.Mesh(baseGeometry, legMaterial)
    base.position.y = 0.015
    base.receiveShadow = true
    tableGroup.add(base)
    
    tableGroup.position.set(pos.x, 0, pos.z)
    scene.add(tableGroup)
  })
}

const createChairs = () => {
  const chairPositions = [
    { x: 2.2, z: 0.5, rot: Math.PI / 4 },
    { x: 3.8, z: 0.5, rot: -Math.PI / 4 },
    { x: 2.2, z: -0.5, rot: 3 * Math.PI / 4 },
    { x: 3.8, z: -0.5, rot: -3 * Math.PI / 4 },
    { x: 3.8, z: -0.5, rot: -Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: Math.PI / 4 },
    { x: 3.8, z: 3.5, rot: -Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: 3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: 3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: 3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: 3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: 3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: 3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: 3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: 3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 },
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2, z: 2.5, rot: -3 * Math.PI / 4 }
    { x: 2.2,