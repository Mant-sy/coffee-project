const Router = require('koa-router')
const fs = require('fs')
const path = require('path')
const { executeQuery } = require('../utils/db_utils')
const { parseSalesCSV, parseStoresCSV, parseProductsCSV } = require('../utils/csv_utils')

const router = new Router({
  prefix: '/api'
})

const uploadDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

router.get('/sales', async (ctx) => {
  try {
    const { limit = 100, offset = 0 } = ctx.query
    const sales = await executeQuery(
      'SELECT * FROM sales LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]
    )
    ctx.body = { success: true, data: sales }
  } catch (error) {
    ctx.body = { success: false, error: error.message }
  }
})

router.get('/sales/trend', async (ctx) => {
  try {
    const sales = await executeQuery(
      'SELECT DATE_FORMAT(sale_date, "%Y-%m-%d") as date, SUM(quantity) as total FROM sales GROUP BY date ORDER BY date'
    )
    const xData = sales.map(item => item.date)
    const series = sales.map(item => item.total)
    ctx.body = { success: true, data: { xData, series } }
  } catch (error) {
    ctx.body = { success: false, error: error.message }
  }
})

router.get('/sales/seller', async (ctx) => {
  try {
    const sales = await executeQuery(
      'SELECT store_name, SUM(price * quantity) as total FROM sales GROUP BY store_name ORDER BY total DESC LIMIT 10'
    )
    const xData = sales.map(item => item.store_name)
    const series = sales.map(item => item.total)
    ctx.body = { success: true, data: { xData, series } }
  } catch (error) {
    ctx.body = { success: false, error: error.message }
  }
})

router.get('/sales/rank', async (ctx) => {
  try {
    const sales = await executeQuery(
      'SELECT region, SUM(quantity) as total FROM sales GROUP BY region ORDER BY total DESC LIMIT 10'
    )
    const xData = sales.map(item => item.region)
    const series = sales.map(item => item.total)
    ctx.body = { success: true, data: { xData, series } }
  } catch (error) {
    ctx.body = { success: false, error: error.message }
  }
})

router.get('/sales/hot', async (ctx) => {
  try {
    const sales = await executeQuery(
      'SELECT product_name, SUM(quantity) as total FROM sales GROUP BY product_name ORDER BY total DESC LIMIT 8'
    )
    const data = sales.map(item => ({
      name: item.product_name,
      value: item.total
    }))
    ctx.body = { success: true, data }
  } catch (error) {
    ctx.body = { success: false, error: error.message }
  }
})

router.get('/sales/stock', async (ctx) => {
  try {
    const sales = await executeQuery(
      'SELECT product_name, SUM(quantity) as sales FROM sales GROUP BY product_name LIMIT 10'
    )
    const products = await executeQuery(
      'SELECT product_name, stock FROM products LIMIT 10'
    )
    
    const productMap = new Map()
    products.forEach(product => {
      productMap.set(product.product_name, product.stock)
    })
    
    const xData = []
    const stockData = []
    const salesData = []
    
    sales.forEach(item => {
      xData.push(item.product_name)
      stockData.push(productMap.get(item.product_name) || 0)
      salesData.push(item.sales)
    })
    
    ctx.body = { success: true, data: { xData, stockData, salesData } }
  } catch (error) {
    ctx.body = { success: false, error: error.message }
  }
})

router.get('/sales/prediction', async (ctx) => {
  try {
    const { days = 7, method = 'ema' } = ctx.query
    const predictionDays = parseInt(days)
    
    const sales = await executeQuery(
      'SELECT DATE_FORMAT(sale_date, "%Y-%m-%d") as date, SUM(quantity) as total FROM sales GROUP BY date ORDER BY date DESC LIMIT 30'
    )
    
    if (sales.length === 0) {
      ctx.body = { success: false, error: '暂无销售数据' }
      return
    }
    
    sales.reverse()
    
    const historyData = sales.map(item => item.total)
    const xData = sales.map(item => item.date)
    const predictionXData = []
    
    const lastHistoryDate = new Date(xData[xData.length - 1])
    for (let i = 0; i < predictionDays; i++) {
      const nextDate = new Date(lastHistoryDate)
      nextDate.setDate(lastHistoryDate.getDate() + i + 1)
      predictionXData.push(nextDate.toISOString().split('T')[0])
    }
    
    let predictionData = []
    
    if (method === 'ma') {
      const windowSize = 7
      const sum = historyData.slice(-windowSize).reduce((a, b) => a + b, 0)
      const ma = sum / windowSize
      
      for (let i = 0; i < predictionDays; i++) {
        const noise = (Math.random() - 0.5) * ma * 0.15
        const nextValue = Math.max(0, Math.round(ma + noise))
        predictionData.push(nextValue)
      }
    } else if (method === 'ema') {
      const alpha = 0.3
      let ema = historyData[0]
      for (let i = 1; i < historyData.length; i++) {
        ema = alpha * historyData[i] + (1 - alpha) * ema
      }
      
      for (let i = 0; i < predictionDays; i++) {
        const noise = (Math.random() - 0.5) * ema * 0.1
        const nextValue = Math.max(0, Math.round(ema + noise))
        predictionData.push(nextValue)
        ema = alpha * nextValue + (1 - alpha) * ema
      }
    } else {
      const n = historyData.length
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
      for (let i = 0; i < n; i++) {
        sumX += i
        sumY += historyData[i]
        sumXY += i * historyData[i]
        sumX2 += i * i
      }
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
      const intercept = (sumY - slope * sumX) / n
      
      for (let i = 0; i < predictionDays; i++) {
        const nextIndex = n + i
        const baseValue = slope * nextIndex + intercept
        const noise = (Math.random() - 0.5) * Math.abs(baseValue) * 0.1
        const nextValue = Math.max(0, Math.round(baseValue + noise))
        predictionData.push(nextValue)
      }
    }
    
    ctx.body = {
      success: true,
      data: {
        xData: [...xData, ...predictionXData],
        historyData,
        predictionData
      }
    }
  } catch (error) {
    ctx.body = { success: false, error: error.message }
  }
})

router.get('/stores/distribution', async (ctx) => {
  try {
    const stores = await executeQuery(
      'SELECT region, COUNT(*) as count FROM stores GROUP BY region'
    )
    const data = stores.map(item => ({
      name: item.region,
      value: item.count
    }))
    ctx.body = { success: true, data }
  } catch (error) {
    ctx.body = { success: false, error: error.message }
  }
})

router.get('/regions/tree', async (ctx) => {
  try {
    const stores = await executeQuery('SELECT region, city, store_id FROM stores')
    
    const regionTree = {}
    stores.forEach(store => {
      if (!regionTree[store.region]) {
        regionTree[store.region] = {
          name: store.region,
          cities: {}
        }
      }
      if (!regionTree[store.region].cities[store.city]) {
        regionTree[store.region].cities[store.city] = {
          name: store.city,
          count: 0
        }
      }
      regionTree[store.region].cities[store.city].count++
    })
    
    const result = Object.values(regionTree).map(region => ({
      name: region.name,
      cities: Object.values(region.cities).sort((a, b) => a.name.localeCompare(b.name))
    })).sort((a, b) => a.name.localeCompare(b.name))
    
    ctx.body = { success: true, data: result }
  } catch (error) {
    ctx.body = { success: false, error: error.message }
  }
})

router.get('/stores', async (ctx) => {
  console.log('收到门店列表请求:', ctx.query)
  try {
    const { region, city } = ctx.query
    let query = 'SELECT * FROM stores'
    let params = []
    
    if (city) {
      query += ' WHERE city = ?'
      params.push(city)
    } else if (region) {
      query += ' WHERE region = ?'
      params.push(region)
    }
    
    const stores = await executeQuery(query, params)
    console.log('查询到的门店数量:', stores.length)
    ctx.body = { success: true, data: stores }
  } catch (error) {
    console.error('获取门店列表失败:', error)
    ctx.body = { success: false, error: error.message }
  }
})

router.get('/store/detail', async (ctx) => {
  try {
    console.log('收到门店详情请求:', ctx.query)
    const { store_id } = ctx.query
    if (!store_id) {
      ctx.body = { success: false, error: '缺少门店ID参数' }
      return
    }
    
    const store = await executeQuery(
      'SELECT * FROM stores WHERE store_id = ?',
      [store_id]
    )
    
    if (store.length === 0) {
      ctx.body = { success: false, error: '门店不存在' }
      return
    }
    
    console.log('返回门店详情:', store[0])
    ctx.body = { success: true, data: store[0] }
  } catch (error) {
    console.error('门店详情错误:', error)
    ctx.body = { success: false, error: error.message }
  }
})

router.get('/store/sales', async (ctx) => {
  try {
    console.log('收到销售数据请求:', ctx.query)
    const { store_id } = ctx.query
    if (!store_id) {
      ctx.body = { success: false, error: '缺少门店ID参数' }
      return
    }
    
    const sales = await executeQuery(
      'SELECT DATE_FORMAT(sale_date, "%Y-%m-%d") as date, SUM(price * quantity) as total, SUM(quantity) as quantity FROM sales WHERE store_id = ? GROUP BY date ORDER BY date LIMIT 30',
      [store_id]
    )
    
    const xData = sales.map(item => item.date)
    const series = sales.map(item => item.total)
    const quantities = sales.map(item => item.quantity)
    
    console.log('返回销售数据:', { xData: xData.length, series: series.length })
    ctx.body = { success: true, data: { xData, series, quantities } }
  } catch (error) {
    console.error('销售数据错误:', error)
    ctx.body = { success: false, error: error.message }
  }
})

router.get('/store/products', async (ctx) => {
  try {
    console.log('收到产品数据请求:', ctx.query)
    const { store_id } = ctx.query
    if (!store_id) {
      ctx.body = { success: false, error: '缺少门店ID参数' }
      return
    }
    
    const products = await executeQuery(
      'SELECT product_name, SUM(quantity) as total FROM sales WHERE store_id = ? GROUP BY product_name ORDER BY total DESC LIMIT 8',
      [store_id]
    )
    
    const data = products.map(item => ({
      name: item.product_name,
      value: item.total
    }))
    
    console.log('返回产品数据:', data.length)
    ctx.body = { success: true, data }
  } catch (error) {
    console.error('产品数据错误:', error)
    ctx.body = { success: false, error: error.message }
  }
})

router.get('/store/productRank', async (ctx) => {
  try {
    const { store_id } = ctx.query
    if (!store_id) {
      ctx.body = { success: false, error: '缺少门店ID参数' }
      return
    }
    
    const products = await executeQuery(
      'SELECT product_name, SUM(quantity) as total FROM sales WHERE store_id = ? GROUP BY product_name ORDER BY total DESC LIMIT 7',
      [store_id]
    )
    
    const data = products.map(item => ({
      name: item.product_name,
      value: item.total
    }))
    
    ctx.body = { success: true, data }
  } catch (error) {
    console.error('门店商品排行榜错误:', error)
    ctx.body = { success: false, error: error.message }
  }
})

router.get('/store/prediction', async (ctx) => {
  try {
    const { store_id, days = 7 } = ctx.query
    const predictionDays = parseInt(days)
    
    if (!store_id) {
      ctx.body = { success: false, error: '缺少门店ID参数' }
      return
    }
    
    const sales = await executeQuery(
      'SELECT DATE_FORMAT(sale_date, "%Y-%m-%d") as date, SUM(quantity) as total FROM sales WHERE store_id = ? GROUP BY date ORDER BY date DESC LIMIT 30',
      [store_id]
    )
    
    if (sales.length === 0) {
      ctx.body = { success: false, error: '该门店暂无销售数据' }
      return
    }
    
    sales.reverse()
    
    const historyData = sales.map(item => item.total)
    const xData = sales.map(item => item.date)
    const predictionXData = []
    
    const lastHistoryDate = new Date(xData[xData.length - 1])
    for (let i = 0; i < predictionDays; i++) {
      const nextDate = new Date(lastHistoryDate)
      nextDate.setDate(lastHistoryDate.getDate() + i + 1)
      predictionXData.push(nextDate.toISOString().split('T')[0])
    }
    
    const alpha = 0.3
    let ema = historyData[0]
    for (let i = 1; i < historyData.length; i++) {
      ema = alpha * historyData[i] + (1 - alpha) * ema
    }
    
    const predictionData = []
    for (let i = 0; i < predictionDays; i++) {
      const noise = (Math.random() - 0.5) * ema * 0.1
      const nextValue = Math.max(0, Math.round(ema + noise))
      predictionData.push(nextValue)
      ema = alpha * nextValue + (1 - alpha) * ema
    }
    
    ctx.body = {
      success: true,
      data: {
        xData: [...xData, ...predictionXData],
        historyData,
        predictionData
      }
    }
  } catch (error) {
    ctx.body = { success: false, error: error.message }
  }
})

router.post('/upload/sales', async (ctx) => {
  try {
    const file = ctx.request.files.file
    if (!file) {
      ctx.body = { success: false, error: '请选择文件' }
      return
    }
    
    const filePath = path.join(uploadDir, file.name)
    fs.renameSync(file.path, filePath)
    
    const result = await parseSalesCSV(filePath)
    ctx.body = result
  } catch (error) {
    ctx.body = { success: false, error: error.message }
  }
})

router.post('/upload/stores', async (ctx) => {
  try {
    const file = ctx.request.files.file
    if (!file) {
      ctx.body = { success: false, error: '请选择文件' }
      return
    }
    
    const filePath = path.join(uploadDir, file.name)
    fs.renameSync(file.path, filePath)
    
    const result = await parseStoresCSV(filePath)
    ctx.body = result
  } catch (error) {
    ctx.body = { success: false, error: error.message }
  }
})

router.post('/upload/products', async (ctx) => {
  try {
    const file = ctx.request.files.file
    if (!file) {
      ctx.body = { success: false, error: '请选择文件' }
      return
    }
    
    const filePath = path.join(uploadDir, file.name)
    fs.renameSync(file.path, filePath)
    
    const result = await parseProductsCSV(filePath)
    ctx.body = result
  } catch (error) {
    ctx.body = { success: false, error: error.message }
  }
})

router.post('/import/data', async (ctx) => {
  try {
    const { type } = ctx.request.body
    const file = ctx.request.files?.file
    
    if (!file) {
      ctx.body = { success: false, error: '请选择文件' }
      return
    }
    
    const filePath = path.join(uploadDir, file.newFilename || file.name)
    const fileContent = fs.readFileSync(file.filepath || file.path)
    fs.writeFileSync(filePath, fileContent)
    
    let data = []
    let insertCount = 0
    
    if (type === 'sales') {
      data = await parseSalesCSV(filePath)
      await executeQuery('TRUNCATE TABLE sales')
      
      for (const item of data) {
        await executeQuery(
          'INSERT INTO sales (store_id, store_name, product_id, product_name, category, price, quantity, sale_date, region, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [item.store_id, item.store_name, item.product_id, item.product_name, item.category, item.price, item.quantity, item.sale_date, item.region, item.city]
        )
        insertCount++
      }
    } else if (type === 'stores') {
      data = await parseStoresCSV(filePath)
      await executeQuery('TRUNCATE TABLE stores')
      
      for (const item of data) {
        await executeQuery(
          'INSERT INTO stores (store_id, store_name, region, city, address, manager, phone, open_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [item.store_id, item.store_name, item.region, item.city, item.address, item.manager, item.phone, item.open_date]
        )
        insertCount++
      }
    } else if (type === 'products') {
      data = await parseProductsCSV(filePath)
      await executeQuery('TRUNCATE TABLE products')
      
      for (const item of data) {
        await executeQuery(
          'INSERT INTO products (product_id, product_name, category, price, cost, stock) VALUES (?, ?, ?, ?, ?, ?)',
          [item.product_id, item.product_name, item.category, item.price, item.cost, item.stock]
        )
        insertCount++
      }
    } else {
      ctx.body = { success: false, error: '未知的数据类型' }
      return
    }
    
    ctx.body = { 
      success: true, 
      message: `成功导入 ${insertCount} 条${type === 'sales' ? '销售' : type === 'stores' ? '门店' : '产品'}数据`,
      count: insertCount
    }
  } catch (error) {
    console.error('数据导入错误:', error)
    ctx.body = { success: false, error: error.message }
  }
})

router.post('/clear/data', async (ctx) => {
  console.log('收到清除数据请求:', ctx.request.body)
  try {
    const { types } = ctx.request.body
    console.log('types:', types)
    
    if (!types || types.length === 0) {
      ctx.body = { success: false, error: '请选择要清除的数据类型' }
      return
    }
    
    let clearedCount = 0
    
    await executeQuery('SET FOREIGN_KEY_CHECKS = 0')
    
    if (types.includes('stores')) {
      await executeQuery('TRUNCATE TABLE stores')
      clearedCount++
    }
    
    if (types.includes('products')) {
      await executeQuery('TRUNCATE TABLE products')
      clearedCount++
    }
    
    if (types.includes('sales')) {
      await executeQuery('TRUNCATE TABLE sales')
      clearedCount++
    }
    
    await executeQuery('SET FOREIGN_KEY_CHECKS = 1')
    
    ctx.body = { 
      success: true, 
      message: `成功清除 ${clearedCount} 种数据类型`
    }
  } catch (error) {
    console.error('数据清除错误:', error)
    ctx.body = { success: false, error: error.message }
  }
})

module.exports = router
