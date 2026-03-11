const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dbConfig = require('../config/db_config');

async function exportCurrentData() {
  const connection = await mysql.createConnection(dbConfig);
  
  console.log('开始导出当前数据...\n');
  
  // 导出门店数据
  const [stores] = await connection.execute('SELECT * FROM stores');
  const storesPath = path.join(__dirname, '..', '..', 'DS', 'current_stores.json');
  fs.writeFileSync(storesPath, JSON.stringify(stores, null, 2));
  console.log(`✓ 门店数据已保存: ${stores.length} 条`);
  
  // 导出产品数据
  const [products] = await connection.execute('SELECT * FROM products');
  const productsPath = path.join(__dirname, '..', '..', 'DS', 'current_products.json');
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
  console.log(`✓ 产品数据已保存: ${products.length} 条`);
  
  // 导出销售数据
  const [sales] = await connection.execute('SELECT * FROM sales');
  const salesPath = path.join(__dirname, '..', '..', 'DS', 'current_sales.json');
  fs.writeFileSync(salesPath, JSON.stringify(sales, null, 2));
  console.log(`✓ 销售数据已保存: ${sales.length} 条`);
  
  console.log('\n数据导出完成！');
  
  await connection.end();
}

exportCurrentData().catch(console.error);
