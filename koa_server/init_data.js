const mysql = require('mysql2/promise')
const dbConfig = require('./config/db_config')

const products = [
  { id: 'P001', name: '美式咖啡', category: '意式经典', price: 28 },
  { id: 'P002', name: '拿铁', category: '意式经典', price: 32 },
  { id: 'P003', name: '卡布奇诺', category: '意式经典', price: 32 },
  { id: 'P004', name: '摩卡', category: '意式经典', price: 35 },
  { id: 'P005', name: '焦糖玛奇朵', category: '季节&创意', price: 36 },
  { id: 'P006', name: '手冲咖啡', category: '手冲&冷萃', price: 45 },
  { id: 'P007', name: '冷萃咖啡', category: '手冲&冷萃', price: 38 },
  { id: 'P008', name: '提拉米苏', category: '烘焙甜品', price: 38 },
  { id: 'P009', name: '芝士蛋糕', category: '烘焙甜品', price: 42 },
  { id: 'P010', name: '抹茶拿铁', category: '季节&创意', price: 35 },
  { id: 'P011', name: '燕麦拿铁', category: '健康饮品', price: 34 },
  { id: 'P012', name: '椰子拿铁', category: '季节&创意', price: 36 },
  { id: 'P013', name: '冰美式', category: '意式经典', price: 26 },
  { id: 'P014', name: '浓缩咖啡', category: '意式经典', price: 22 },
  { id: 'P015', name: '芒果冰沙', category: '冰饮系列', price: 38 },
  { id: 'P016', name: '草莓冰沙', category: '冰饮系列', price: 38 },
  { id: 'P017', name: '巧克力蛋糕', category: '烘焙甜品', price: 45 },
  { id: 'P018', name: '牛角包', category: '烘焙甜品', price: 18 },
  { id: 'P019', name: '红茶拿铁', category: '茶饮系列', price: 32 },
  { id: 'P020', name: '绿茶拿铁', category: '茶饮系列', price: 32 }
]

const brandNames = ['星巴克', '瑞幸', 'Costa', '漫咖啡', '上岛咖啡', '太平洋咖啡', '咖啡陪你', 'COSTA']

const chinaProvinces = {
  '北京': ['东城区', '西城区', '朝阳区', '海淀区', '丰台区'],
  '上海': ['黄浦区', '徐汇区', '静安区', '浦东新区', '虹口区'],
  '广东': ['广州市', '深圳市', '东莞市', '佛山市', '珠海市'],
  '浙江': ['杭州市', '宁波市', '温州市', '绍兴市', '嘉兴市'],
  '江苏': ['南京市', '苏州市', '无锡市', '常州市', '南通市'],
  '四川': ['成都市', '绵阳市', '德阳市', '宜宾市', '泸州市'],
  '湖北': ['武汉市', '宜昌市', '襄阳市', '荆州市', '黄石市'],
  '湖南': ['长沙市', '株洲市', '湘潭市', '衡阳市', '岳阳市'],
  '福建': ['福州市', '厦门市', '泉州市', '漳州市', '莆田市'],
  '山东': ['济南市', '青岛市', '烟台市', '潍坊市', '威海市'],
  '河南': ['郑州市', '洛阳市', '开封市', '新乡市', '许昌市'],
  '陕西': ['西安市', '咸阳市', '宝鸡市', '渭南市', '延安市'],
  '重庆': ['渝中区', '江北区', '南岸区', '沙坪坝区', '九龙坡区'],
  '天津': ['和平区', '河东区', '河西区', '南开区', '河北区'],
  '广西': ['南宁市', '柳州市', '桂林市', '梧州市', '北海市', '钦州市', '贵港市', '玉林市']
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateStores() {
  const stores = []
  let storeIndex = 1
  
  for (const [province, cities] of Object.entries(chinaProvinces)) {
    const storesPerProvince = province === '广西' ? 3 : randomInt(1, 3)
    
    for (let i = 0; i < storesPerProvince; i++) {
      const city = cities[randomInt(0, cities.length - 1)]
      const brand = brandNames[randomInt(0, brandNames.length - 1)]
      const region = city.includes('区') || city.includes('市') ? city : cities[0]
      
      stores.push({
        store_id: `S${String(storeIndex).padStart(3, '0')}`,
        store_name: `${brand}(${region}店)`,
        region: province,
        city: city,
        address: `${province}${city}中山路${randomInt(1, 500)}号`,
        manager: '经理' + storeIndex,
        phone: '138' + String(randomInt(10000000, 99999999)),
        open_date: `2023-${String(randomInt(1, 12)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`
      })
      storeIndex++
    }
  }
  
  return stores
}

function generateSales(stores, days = 60) {
  const sales = []
  const today = new Date()
  
  stores.forEach(store => {
    for (let d = 0; d < days; d++) {
      const date = new Date(today)
      date.setDate(date.getDate() - d)
      const dateStr = date.toISOString().split('T')[0]
      
      const dailyOrders = randomInt(20, 60)
      
      for (let o = 0; o < dailyOrders; o++) {
        const product = products[randomInt(0, products.length - 1)]
        const quantity = randomInt(1, 4)
        
        sales.push({
          store_id: store.store_id,
          store_name: store.store_name,
          product_id: product.id,
          product_name: product.name,
          category: product.category,
          price: product.price,
          quantity: quantity,
          sale_date: dateStr,
          region: store.region,
          city: store.city
        })
      }
    }
  })
  
  return sales
}

async function insertStores(connection, stores) {
  const sql = `
    INSERT INTO stores (store_id, store_name, region, city, address, manager, phone, open_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE store_name = VALUES(store_name)
  `
  
  for (const store of stores) {
    await connection.execute(sql, [
      store.store_id,
      store.store_name,
      store.region,
      store.city,
      store.address,
      store.manager,
      store.phone,
      store.open_date
    ])
  }
  console.log(`门店数据插入完成，共 ${stores.length} 条`)
}

async function insertProducts(connection) {
  const sql = `
    INSERT INTO products (product_id, product_name, category, price, cost, stock)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE product_name = VALUES(product_name)
  `
  
  for (const product of products) {
    const cost = Math.round(product.price * 0.4)
    const stock = randomInt(50, 200)
    
    await connection.execute(sql, [
      product.id,
      product.name,
      product.category,
      product.price,
      cost,
      stock
    ])
  }
  console.log(`产品数据插入完成，共 ${products.length} 条`)
}

async function insertSales(connection, sales) {
  const sql = `
    INSERT INTO sales (store_id, store_name, product_id, product_name, category, price, quantity, sale_date, region, city)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  
  const batchSize = 500
  let count = 0
  
  for (let i = 0; i < sales.length; i += batchSize) {
    const batch = sales.slice(i, i + batchSize)
    
    for (const sale of batch) {
      await connection.execute(sql, [
        sale.store_id,
        sale.store_name,
        sale.product_id,
        sale.product_name,
        sale.category,
        sale.price,
        sale.quantity,
        sale.sale_date,
        sale.region,
        sale.city
      ])
      count++
    }
    
    console.log(`已插入 ${count}/${sales.length} 条销售记录...`)
  }
  
  console.log(`销售数据插入完成，共 ${count} 条`)
}

async function init() {
  console.log('开始初始化咖啡门店数据...\n')
  
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password
  })
  
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
    console.log(`数据库 ${dbConfig.database} 创建成功`)
    await connection.changeUser({ database: dbConfig.database })
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        store_id VARCHAR(50),
        store_name VARCHAR(100),
        product_id VARCHAR(50),
        product_name VARCHAR(100),
        category VARCHAR(50),
        price DECIMAL(10, 2),
        quantity INT,
        sale_date DATE,
        region VARCHAR(50),
        city VARCHAR(50),
        INDEX idx_store_id (store_id),
        INDEX idx_sale_date (sale_date),
        INDEX idx_region (region)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        store_id VARCHAR(50) UNIQUE,
        store_name VARCHAR(100),
        region VARCHAR(50),
        city VARCHAR(50),
        address VARCHAR(200),
        manager VARCHAR(50),
        phone VARCHAR(20),
        open_date DATE,
        INDEX idx_region (region),
        INDEX idx_city (city)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(50) UNIQUE,
        product_name VARCHAR(100),
        category VARCHAR(50),
        price DECIMAL(10, 2),
        cost DECIMAL(10, 2),
        stock INT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
    
    console.log('生成门店数据...')
    const stores = generateStores()
    console.log(`生成了 ${stores.length} 个门店`)
    
    const provinceCount = {}
    stores.forEach(s => {
      provinceCount[s.region] = (provinceCount[s.region] || 0) + 1
    })
    console.log('各省份门店分布:')
    Object.entries(provinceCount).forEach(([p, c]) => {
      console.log(`  - ${p}: ${c} 家`)
    })
    console.log('')
    
    console.log('生成销售数据...')
    const sales = generateSales(stores, 60)
    console.log(`生成了 ${sales.length} 条销售记录\n`)
    
    console.log('清空现有数据...')
    await connection.query('DELETE FROM sales')
    await connection.query('DELETE FROM stores')
    await connection.query('DELETE FROM products')
    
    console.log('插入门店数据...')
    await insertStores(connection, stores)
    
    console.log('插入产品数据...')
    await insertProducts(connection)
    
    console.log('插入销售数据...')
    await insertSales(connection, sales)
    
    console.log('\n数据初始化完成!')
  } finally {
    await connection.end()
  }
}

init().catch(err => {
  console.error('初始化失败:', err.message)
  process.exit(1)
})
