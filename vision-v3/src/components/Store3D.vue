<template>
  <div class="store3d-container" :class="mainStore.theme">
    <h3 class="title">{{ displayStoreName }}</h3>
    <div ref="containerRef" class="canvas-container"></div>
    <div class="controls-panel">
      <div class="control-group">
        <button @click="resetView" class="control-btn">重置视角</button>
        <button @click="toggleAutoRotate" class="control-btn">{{ autoRotate ? '停止旋转' : '自动旋转' }}</button>
      </div>
      <div class="control-group">
        <span class="view-label">视角:</span>
        <button @click="setView('front')" class="control-btn small">正面</button>
        <button @click="setView('top')" class="control-btn small">俯视</button>
        <button @click="setView('side')" class="control-btn small">侧面</button>
      </div>
    </div>
    <div class="info-panel">
      <p>鼠标左键拖拽旋转 | 滚轮缩放 | 点击热点查看详情</p>
    </div>
    <div v-if="showInfoPanel" class="detail-panel">
      <div class="detail-header">
        <span>{{ infoPanelData.title }}</span>
        <button @click="closeInfoPanel" class="close-btn">×</button>
      </div>
      <div class="detail-content">
        <p v-for="(item, index) in infoPanelData.items" :key="index">
          {{ item.label }}: <span class="value">{{ item.value }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useMainStore } from '@/store'

const mainStore = useMainStore()

const props = defineProps({
  storeId: {
    type: String,
    default: ''
  },
  storeName: {
    type: String,
    default: ''
  },
  salesData: {
    type: Array,
    default: () => []
  },
  productsData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['hotspot-click', 'data-bar-click'])

const containerRef = ref(null)
let scene = null
let camera = null
let renderer = null
let controls = null
let animationId = null
let raycaster = null
let mouse = null
let hotspots = []
let dataBars = []
let particleSystems = []
let storeGroup = null

const autoRotate = ref(false)
const showInfoPanel = ref(false)
const infoPanelData = ref({ title: '', items: [] })

const storeType = computed(() => {
  if (!props.storeId) return 'coffee'
  if (props.storeId === 'S001') return 'coffee'
  if (props.storeId === 'S004') return 'tea'
  return 'coffee'
})

const displayStoreName = computed(() => {
  if (props.storeName) return props.storeName
  if (!props.storeId) return '门店3D环境'
  return '门店3D环境'
})

const initScene = () => {
  if (!containerRef.value) return
  
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1a2e)
  scene.fog = new THREE.Fog(0x1a1a2e, 15, 35)
  
  const aspect = containerRef.value.clientWidth / containerRef.value.clientHeight
  camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100)
  camera.position.set(8, 6, 8)
  
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
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
  
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()
  
  addLights()
  createStore()
  createDataVisualization()
  createParticleSystem()
  
  renderer.domElement.addEventListener('click', onMouseClick)
  renderer.domElement.addEventListener('mousemove', onMouseMove)
  
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
  scene.add(mainLight)
  
  const warmLight = new THREE.PointLight(0xffaa55, 0.5, 15)
  warmLight.position.set(0, 3, 0)
  scene.add(warmLight)
  
  const accentLight = new THREE.PointLight(0x4c9bfd, 0.3, 10)
  accentLight.position.set(-4, 2, -3)
  scene.add(accentLight)
}

const createStore = () => {
  storeGroup = new THREE.Group()
  
  createFloor()
  createWalls()
  createCeiling()
  
  if (storeType.value === 'coffee') {
    createCoffeeCounter()
  } else {
    createTeaCounter()
  }
  
  createTables()
  createChairs()
  createDecorations()
  createHotspots()
  
  scene.add(storeGroup)
}

const createFloor = () => {
  const floorGeometry = new THREE.PlaneGeometry(12, 10)
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: storeType.value === 'coffee' ? 0x8b7355 : 0xdeb887,
    roughness: 0.8,
    metalness: 0.1
  })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  storeGroup.add(floor)
  
  const gridHelper = new THREE.GridHelper(12, 24, 0x333333, 0x222222)
  gridHelper.position.y = 0.01
  storeGroup.add(gridHelper)
}

const createWalls = () => {
  const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xf5f0e6,
    roughness: 0.9
  })
  
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(12, 5, 0.2), wallMaterial)
  backWall.position.set(0, 2.5, -5)
  backWall.receiveShadow = true
  storeGroup.add(backWall)
  
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 10), wallMaterial)
  leftWall.position.set(-6, 2.5, 0)
  leftWall.receiveShadow = true
  storeGroup.add(leftWall)
  
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 10), wallMaterial)
  rightWall.position.set(6, 2.5, 0)
  rightWall.receiveShadow = true
  storeGroup.add(rightWall)
  
  const frameGeometry = new THREE.BoxGeometry(1.5, 1, 0.05)
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  
  ;[-3, 3].forEach(x => {
    const frame = new THREE.Mesh(frameGeometry, frameMaterial)
    frame.position.set(x, 2.5, -4.85)
    frame.castShadow = true
    storeGroup.add(frame)
  })
}

const createCeiling = () => {
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 10),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
  )
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.y = 5
  storeGroup.add(ceiling)
  
  const lightFrameGeometry = new THREE.BoxGeometry(2, 0.1, 2)
  const lightFrameMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 })
  const lightGeometry = new THREE.BoxGeometry(1.8, 0.05, 1.8)
  const lightMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffee, emissive: 0xffffee, emissiveIntensity: 0.5 
  })
  
  for (let x = -3; x <= 3; x += 3) {
    for (let z = -2; z <= 2; z += 2) {
      const frame = new THREE.Mesh(lightFrameGeometry, lightFrameMaterial)
      frame.position.set(x, 4.95, z)
      storeGroup.add(frame)
      
      const light = new THREE.Mesh(lightGeometry, lightMaterial)
      light.position.set(x, 4.9, z)
      storeGroup.add(light)
    }
  }
}

const createCoffeeCounter = () => {
  const counterGroup = new THREE.Group()
  
  const counter = new THREE.Mesh(
    new THREE.BoxGeometry(5, 1.1, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x5d4e37, roughness: 0.6 })
  )
  counter.position.set(-1.5, 0.55, -4)
  counter.castShadow = true
  counter.receiveShadow = true
  counterGroup.add(counter)
  
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, 0.1, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x2c2c2c, roughness: 0.3, metalness: 0.5 })
  )
  top.position.set(-1.5, 1.15, -4)
  top.castShadow = true
  counterGroup.add(top)
  
  const machine = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.8, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.8 })
  )
  machine.position.set(-3, 1.6, -4)
  machine.castShadow = true
  counterGroup.add(machine)
  
  const cupGeometry = new THREE.CylinderGeometry(0.08, 0.06, 0.15, 16)
  const cupMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })
  for (let i = 0; i < 3; i++) {
    const cup = new THREE.Mesh(cupGeometry, cupMaterial)
    cup.position.set(-1 + i * 0.3, 1.28, -4)
    cup.castShadow = true
    counterGroup.add(cup)
  }
  
  storeGroup.add(counterGroup)
}

const createTeaCounter = () => {
  const counterGroup = new THREE.Group()
  
  const counter = new THREE.Mesh(
    new THREE.BoxGeometry(5, 1.1, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.6 })
  )
  counter.position.set(-1.5, 0.55, -4)
  counter.castShadow = true
  counter.receiveShadow = true
  counterGroup.add(counter)
  
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, 0.1, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x90ee90, roughness: 0.4, metalness: 0.5 })
  )
  top.position.set(-1.5, 1.15, -4)
  top.castShadow = true
  counterGroup.add(top)
  
  const teapot = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.5 })
  )
  teapot.position.set(-3, 1.5, -4)
  teapot.scale.set(1, 0.8, 1)
  teapot.castShadow = true
  counterGroup.add(teapot)
  
  storeGroup.add(counterGroup)
}

const createTables = () => {
  const tablePositions = [
    { x: 3, z: 0 }, { x: 3, z: 3 }, { x: -3, z: 0 }, { x: -3, z: 3 }
  ]
  
  tablePositions.forEach((pos, index) => {
    const tableGroup = new THREE.Group()
    
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.6, 0.05, 32),
      new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.6 })
    )
    top.position.y = 0.75
    top.castShadow = true
    top.receiveShadow = true
    tableGroup.add(top)
    
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.7, 16),
      new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 })
    )
    leg.position.y = 0.35
    leg.castShadow = true
    tableGroup.add(leg)
    
    tableGroup.position.set(pos.x, 0, pos.z)
    tableGroup.userData = { type: 'table', id: index }
    storeGroup.add(tableGroup)
  })
}

const createChairs = () => {
  const chairPositions = [
    { x: 2.2, z: 0.5, rot: Math.PI / 4 },
    { x: 3.8, z: 0.5, rot: -Math.PI / 4 },
    { x: 2.2, z: 3.5, rot: 3 * Math.PI / 4 },
    { x: 3.8, z: 2.5, rot: Math.PI / 4 },
    { x: -2.2, z: 0.5, rot: 3 * Math.PI / 4 },
    { x: -3.8, z: 0.5, rot: -3 * Math.PI / 4 },
    { x: -2.2, z: 3.5, rot: Math.PI / 4 },
    { x: -3.8, z: 2.5, rot: 3 * Math.PI / 4 }
  ]
  
  const chairColor = storeType.value === 'coffee' ? 0x4a6741 : 0x228b22
  
  chairPositions.forEach((pos, index) => {
    const chairGroup = new THREE.Group()
    
    const seat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.22, 0.05, 32),
      new THREE.MeshStandardMaterial({ color: chairColor, roughness: 0.7 })
    )
    seat.position.y = 0.45
    seat.castShadow = true
    chairGroup.add(seat)
    
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.4, 0.4),
      new THREE.MeshStandardMaterial({ color: chairColor, roughness: 0.7 })
    )
    back.position.set(0, 0.7, -0.15)
    back.castShadow = true
    chairGroup.add(back)
    
    const legGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8)
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 })
    
    ;[
      { x: 0.15, z: 0.15 }, { x: -0.15, z: 0.15 },
      { x: 0.15, z: -0.15 }, { x: -0.15, z: -0.15 }
    ].forEach(legPos => {
      const leg = new THREE.Mesh(legGeometry, legMaterial)
      leg.position.set(legPos.x, 0.2, legPos.z)
      leg.castShadow = true
      chairGroup.add(leg)
    })
    
    chairGroup.position.set(pos.x, 0, pos.z)
    chairGroup.rotation.y = pos.rot
    chairGroup.userData = { type: 'chair', id: index }
    storeGroup.add(chairGroup)
  })
}

const createDecorations = () => {
  const plantColor = storeType.value === 'coffee' ? 0x228b22 : 0x32cd32
  
  ;[[-5, -4], [-5, 4], [5, 4]].forEach(([x, z]) => {
    const plantGroup = new THREE.Group()
    
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.15, 0.3, 16),
      new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 })
    )
    pot.position.y = 0.15
    pot.castShadow = true
    plantGroup.add(pot)
    
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 8, 8),
      new THREE.MeshStandardMaterial({ color: plantColor, roughness: 0.8 })
    )
    leaf.position.y = 0.55
    leaf.scale.set(1, 1.2, 1)
    leaf.castShadow = true
    plantGroup.add(leaf)
    
    plantGroup.position.set(x, 0, z)
    storeGroup.add(plantGroup)
  })
  
  const lampGeometry = new THREE.SphereGeometry(0.15, 16, 16)
  const lampMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffee, emissive: 0xffaa55, emissiveIntensity: 0.5 
  })
  
  ;[[-5, -4], [5, -4]].forEach(([x, z]) => {
    const lamp = new THREE.Mesh(lampGeometry, lampMaterial)
    lamp.position.set(x, 4, z)
    storeGroup.add(lamp)
  })
}

const createHotspots = () => {
  hotspots = []
  
  const topProduct = props.productsData.length > 0 ? props.productsData[0] : null
  const topProductName = topProduct ? topProduct.name : (storeType.value === 'coffee' ? '拿铁' : '珍珠奶茶')
  
  const totalQuantity = props.salesData.reduce((a, b) => a + (b.quantity || 0), 0)
  const avgDailySales = props.salesData.length > 0 ? Math.round(totalQuantity / props.salesData.length) : 0
  
  const hotspotPositions = storeType.value === 'coffee' ? [
    { x: -1.5, y: 1.5, z: -3.5, data: { 
      type: 'counter',
      title: '咖啡吧台', 
      items: [
        { label: '日均销量', value: avgDailySales > 0 ? `${avgDailySales}杯` : '156杯' },
        { label: '热门产品', value: topProductName },
        { label: '营业时间', value: '8:00-22:00' }
      ]
    }},
    { x: 3, y: 1, z: 0, data: { 
      type: 'seating',
      title: '座位区A', 
      items: [
        { label: '座位数', value: '4个' },
        { label: '平均停留', value: '45分钟' },
        { label: '翻台率', value: '3.2次/天' }
      ]
    }},
    { x: -3, y: 1, z: 3, data: { 
      type: 'seating',
      title: '座位区B', 
      items: [
        { label: '座位数', value: '4个' },
        { label: '平均停留', value: '38分钟' },
        { label: '翻台率', value: '3.8次/天' }
      ]
    }}
  ] : [
    { x: -1.5, y: 1.5, z: -3.5, data: { 
      type: 'counter',
      title: '茶饮吧台', 
      items: [
        { label: '日均销量', value: avgDailySales > 0 ? `${avgDailySales}杯` : '203杯' },
        { label: '热门产品', value: topProductName },
        { label: '营业时间', value: '9:00-21:00' }
      ]
    }},
    { x: 3, y: 1, z: 0, data: { 
      type: 'seating',
      title: '座位区A', 
      items: [
        { label: '座位数', value: '4个' },
        { label: '平均停留', value: '32分钟' },
        { label: '翻台率', value: '4.5次/天' }
      ]
    }},
    { x: 2, y: 2, z: -4.5, data: { 
      type: 'display',
      title: '茶叶展示柜', 
      items: [
        { label: '茶叶品种', value: '12种' },
        { label: '月销量', value: '89罐' },
        { label: '热销品种', value: topProductName }
      ]
    }}
  ]
  
  const hotspotGeometry = new THREE.SphereGeometry(0.15, 16, 16)
  const hotspotMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4c9bfd, emissive: 0x4c9bfd, emissiveIntensity: 0.5,
    transparent: true, opacity: 0.8
  })
  
  hotspotPositions.forEach((pos, index) => {
    const hotspot = new THREE.Mesh(hotspotGeometry, hotspotMaterial.clone())
    hotspot.position.set(pos.x, pos.y, pos.z)
    hotspot.userData = { type: 'hotspot', id: index, data: pos.data, originalY: pos.y }
    hotspots.push(hotspot)
    storeGroup.add(hotspot)
  })
}

const createDataVisualization = () => {
  clearDataBars()
  
  const data = props.salesData.length > 0 ? props.salesData : 
    (props.productsData.length > 0 ? props.productsData : [])
  
  if (data.length === 0) {
    for (let i = 0; i < 6; i++) {
      const height = 0.5 + Math.random() * 1.5
      const hue = (i / 6) * 0.3 + 0.5
      const color = new THREE.Color().setHSL(hue, 0.8, 0.5)
      
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, height, 0.3),
        new THREE.MeshStandardMaterial({ 
          color, emissive: color, emissiveIntensity: 0.2,
          transparent: true, opacity: 0.9
        })
      )
      bar.position.set(-4 + i * 0.5, height / 2 + 0.01, 4.5)
      bar.castShadow = true
      dataBars.push(bar)
      storeGroup.add(bar)
    }
    return
  }
  
  const maxVal = Math.max(...data.map(d => d.value || d.sales || d.total || 0))
  const displayData = data.slice(0, 8)
  
  displayData.forEach((item, index) => {
    const value = item.value || item.sales || item.total || 0
    const height = maxVal > 0 ? (value / maxVal) * 2 + 0.2 : 0.5
    const hue = (index / displayData.length) * 0.3 + 0.5
    const color = new THREE.Color().setHSL(hue, 0.8, 0.5)
    
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, height, 0.3),
      new THREE.MeshStandardMaterial({ 
        color, emissive: color, emissiveIntensity: 0.2,
        transparent: true, opacity: 0.9
      })
    )
    bar.position.set(-4 + index * 0.5, height / 2 + 0.01, 4.5)
    bar.castShadow = true
    bar.userData = { type: 'dataBar', data: item }
    dataBars.push(bar)
    storeGroup.add(bar)
  })
}

const clearDataBars = () => {
  dataBars.forEach(bar => {
    if (storeGroup) storeGroup.remove(bar)
    bar.geometry.dispose()
    bar.material.dispose()
  })
  dataBars = []
}

const createParticleSystem = () => {
  const particleCount = 80
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12
    positions[i * 3 + 1] = Math.random() * 5
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
    
    const color = new THREE.Color()
    color.setHSL(Math.random() * 0.2 + 0.5, 0.8, 0.6)
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  
  const material = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  })
  
  const particles = new THREE.Points(geometry, material)
  particles.userData = { type: 'particles' }
  particleSystems.push(particles)
  scene.add(particles)
}

const updateParticles = () => {
  particleSystems.forEach(particles => {
    const positions = particles.geometry.attributes.position.array
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += 0.01
      if (positions[i + 1] > 5) positions[i + 1] = 0
    }
    particles.geometry.attributes.position.needsUpdate = true
  })
}

const onMouseClick = (event) => {
  if (!containerRef.value || !raycaster || !camera) return
  
  const rect = containerRef.value.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  
  raycaster.setFromCamera(mouse, camera)
  
  const hotspotIntersects = raycaster.intersectObjects(hotspots)
  
  if (hotspotIntersects.length > 0) {
    const hotspot = hotspotIntersects[0].object
    if (hotspot.userData.data) {
      infoPanelData.value = hotspot.userData.data
      showInfoPanel.value = true
      emit('hotspot-click', {
        type: hotspot.userData.data.type,
        title: hotspot.userData.data.title,
        data: hotspot.userData.data
      })
    }
    return
  }
  
  const barIntersects = raycaster.intersectObjects(dataBars)
  if (barIntersects.length > 0) {
    const bar = barIntersects[0].object
    if (bar.userData && bar.userData.data) {
      emit('data-bar-click', {
        product: bar.userData.data
      })
    }
  }
}

const onMouseMove = (event) => {
  if (!containerRef.value || !raycaster || !camera) return
  
  const rect = containerRef.value.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  
  raycaster.setFromCamera(mouse, camera)
  
  hotspots.forEach(hotspot => {
    hotspot.material.emissiveIntensity = 0.5
    hotspot.scale.set(1, 1, 1)
  })
  
  dataBars.forEach(bar => {
    bar.material.emissiveIntensity = 0.2
    bar.scale.set(1, 1, 1)
  })
  
  const hotspotIntersects = raycaster.intersectObjects(hotspots)
  
  if (hotspotIntersects.length > 0) {
    const hotspot = hotspotIntersects[0].object
    hotspot.material.emissiveIntensity = 1
    hotspot.scale.set(1.3, 1.3, 1.3)
    containerRef.value.style.cursor = 'pointer'
    return
  }
  
  const barIntersects = raycaster.intersectObjects(dataBars)
  if (barIntersects.length > 0) {
    const bar = barIntersects[0].object
    bar.material.emissiveIntensity = 0.6
    bar.scale.set(1.1, 1.1, 1.1)
    containerRef.value.style.cursor = 'pointer'
    return
  }
  
  containerRef.value.style.cursor = 'default'
}

const closeInfoPanel = () => {
  showInfoPanel.value = false
}

const animate = () => {
  animationId = requestAnimationFrame(animate)
  
  if (controls) controls.update()
  
  if (autoRotate.value && storeGroup) {
    storeGroup.rotation.y += 0.002
  }
  
  const time = Date.now() * 0.001
  hotspots.forEach((hotspot, index) => {
    if (hotspot.userData.originalY !== undefined) {
      hotspot.position.y = hotspot.userData.originalY + Math.sin(time * 2 + index) * 0.1
    }
  })
  
  updateParticles()
  
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

const resetView = () => {
  if (camera && controls && storeGroup) {
    camera.position.set(8, 6, 8)
    controls.target.set(0, 1, 0)
    controls.update()
    storeGroup.rotation.y = 0
  }
}

const toggleAutoRotate = () => {
  autoRotate.value = !autoRotate.value
}

const setView = (view) => {
  if (!camera || !controls) return
  
  switch (view) {
    case 'front':
      camera.position.set(0, 2, 10)
      controls.target.set(0, 1, 0)
      break
    case 'top':
      camera.position.set(0, 12, 0)
      controls.target.set(0, 0, 0)
      break
    case 'side':
      camera.position.set(12, 3, 0)
      controls.target.set(0, 1, 0)
      break
  }
  
  controls.update()
}

const screenAdapter = () => {
  if (camera && renderer && containerRef.value) {
    camera.aspect = containerRef.value.clientWidth / containerRef.value.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
  }
}

watch(() => props.salesData, () => {
  if (scene) createDataVisualization()
}, { deep: true })

watch(() => props.productsData, () => {
  if (scene) createDataVisualization()
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    initScene()
    window.addEventListener('resize', screenAdapter)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', screenAdapter)
  if (animationId) cancelAnimationFrame(animationId)
  if (controls) controls.dispose()
  if (renderer) {
    renderer.dispose()
    if (containerRef.value && renderer.domElement) {
      containerRef.value.removeChild(renderer.domElement)
    }
  }
  if (scene) scene.clear()
})

defineExpose({ screenAdapter })
</script>

<style scoped>
.store3d-container {
  width: 100%;
  height: 100%;
  padding: 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
}

.title {
  font-size: clamp(12px, 1.5vw, 14px);
  margin: 0 0 10px 0;
  flex-shrink: 0;
}

.store3d-container.dark .title {
  color: #4c9bfd;
}

.store3d-container.light .title {
  color: #333;
}

.canvas-container {
  flex: 1;
  width: 100%;
  min-height: 200px;
  border-radius: 8px;
  overflow: hidden;
}

.store3d-container.dark .canvas-container {
  background: rgba(0, 0, 0, 0.2);
}

.store3d-container.light .canvas-container {
  background: rgba(76, 155, 253, 0.1);
}

.controls-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid;
  flex-shrink: 0;
}

.store3d-container.dark .controls-panel {
  background-color: rgba(76, 155, 253, 0.1);
  border-color: rgba(76, 155, 253, 0.2);
}

.store3d-container.light .controls-panel {
  background-color: rgba(76, 155, 253, 0.08);
  border-color: rgba(76, 155, 253, 0.2);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.view-label {
  font-size: clamp(10px, 1vw, 12px);
  margin-right: 3px;
}

.store3d-container.dark .view-label {
  color: #888;
}

.store3d-container.light .view-label {
  color: #666;
}

.control-btn {
  padding: 5px 10px;
  background-color: rgba(76, 155, 253, 0.8);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: clamp(10px, 1vw, 12px);
  transition: all 0.3s ease;
  white-space: nowrap;
}

.control-btn:hover {
  background-color: rgba(76, 155, 253, 1);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(76, 155, 253, 0.4);
}

.control-btn.small {
  padding: 4px 8px;
  font-size: clamp(9px, 0.9vw, 11px);
}

.info-panel {
  margin-top: 8px;
  text-align: center;
  flex-shrink: 0;
}

.info-panel p {
  font-size: clamp(9px, 0.9vw, 11px);
  margin: 0;
}

.store3d-container.dark .info-panel p {
  color: #888;
}

.store3d-container.light .info-panel p {
  color: #666;
}

.detail-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 12px;
  padding: 15px;
  min-width: 200px;
  max-width: 280px;
  z-index: 100;
  animation: fadeIn 0.3s ease;
}

.store3d-container.dark .detail-panel {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(42, 42, 62, 0.95));
  border: 1px solid rgba(76, 155, 253, 0.5);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.store3d-container.light .detail-panel {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98));
  border: 1px solid rgba(76, 155, 253, 0.3);
  box-shadow: 0 10px 40px rgba(76, 155, 253, 0.2);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
}

.store3d-container.dark .detail-header {
  border-bottom: 1px solid rgba(76, 155, 253, 0.3);
}

.store3d-container.light .detail-header {
  border-bottom: 1px solid rgba(76, 155, 253, 0.2);
}

.detail-header span {
  font-size: clamp(12px, 1.2vw, 14px);
  font-weight: bold;
}

.store3d-container.dark .detail-header span {
  color: #4c9bfd;
}

.store3d-container.light .detail-header span {
  color: #1a5bff;
}

.close-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(255, 100, 100, 0.3);
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 100, 100, 0.6);
  transform: scale(1.1);
}

.detail-content p {
  font-size: clamp(10px, 1vw, 12px);
  margin: 8px 0;
}

.store3d-container.dark .detail-content p {
  color: #aaa;
}

.store3d-container.light .detail-content p {
  color: #555;
}

.detail-content .value {
  font-weight: bold;
}

.store3d-container.dark .detail-content .value {
  color: #4c9bfd;
}

.store3d-container.light .detail-content .value {
  color: #1a5bff;
}
</style>
