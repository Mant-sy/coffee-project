const csv = require('csv-parser')
const fs = require('fs')

function parseSalesCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = []
    fs.createReadStream(filePath, { encoding: 'utf8' })
      .pipe(csv({ skipLines: 0 }))
      .on('data', (data) => {
        const cleanedData = {}
        Object.keys(data).forEach(key => {
          const cleanKey = key.replace(/^\uFEFF/, '').trim()
          cleanedData[cleanKey] = data[key]
        })
        results.push({
          store_id: cleanedData.store_id || '',
          store_name: cleanedData.store_name || '',
          product_id: cleanedData.product_id || '',
          product_name: cleanedData.product_name || '',
          category: cleanedData.category || '',
          price: parseFloat(cleanedData.price || cleanedData.unit_price) || 0,
          quantity: parseInt(cleanedData.quantity) || 1,
          sale_date: cleanedData.sale_date || cleanedData.date || new Date().toISOString().split('T')[0],
          region: cleanedData.region || '',
          city: cleanedData.city || ''
        })
      })
      .on('end', () => resolve(results))
      .on('error', reject)
  })
}

function parseStoresCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = []
    fs.createReadStream(filePath, { encoding: 'utf8' })
      .pipe(csv({ skipLines: 0 }))
      .on('data', (data) => {
        const cleanedData = {}
        Object.keys(data).forEach(key => {
          const cleanKey = key.replace(/^\uFEFF/, '').trim()
          cleanedData[cleanKey] = data[key]
        })
        results.push({
          store_id: cleanedData.store_id || '',
          store_name: cleanedData.store_name || '',
          region: cleanedData.region || '',
          city: cleanedData.city || '',
          address: cleanedData.address || '',
          manager: cleanedData.manager || '',
          phone: cleanedData.phone || '',
          open_date: cleanedData.open_date || new Date().toISOString().split('T')[0]
        })
      })
      .on('end', () => resolve(results))
      .on('error', reject)
  })
}

function parseProductsCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = []
    fs.createReadStream(filePath, { encoding: 'utf8' })
      .pipe(csv({ skipLines: 0 }))
      .on('data', (data) => {
        const cleanedData = {}
        Object.keys(data).forEach(key => {
          const cleanKey = key.replace(/^\uFEFF/, '').trim()
          cleanedData[cleanKey] = data[key]
        })
        results.push({
          product_id: cleanedData.product_id || '',
          product_name: cleanedData.product_name || '',
          category: cleanedData.category || '',
          price: parseFloat(cleanedData.price) || 0,
          cost: parseFloat(cleanedData.cost) || 0,
          stock: parseInt(cleanedData.stock) || 100
        })
      })
      .on('end', () => resolve(results))
      .on('error', reject)
  })
}

module.exports = {
  parseSalesCSV,
  parseStoresCSV,
  parseProductsCSV
}
