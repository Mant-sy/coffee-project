const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dbConfig = require('../config/db_config');

async function importSalesData() {
  const connection = await mysql.createConnection(dbConfig);
  
  console.log('开始导入数据...\n');
  
  // 1. 导入产品数据
  console.log('1. 导入产品数据...');
  const productsPath = path.join(__dirname, '..', '..', 'DS', 'products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
  
  await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
  await connection.execute('TRUNCATE TABLE products');
  
  const productSql = `
    INSERT INTO products (product_id, product_name, category, price, cost, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  for (const product of products) {
    await connection.execute(productSql, [
      product.product_id,
      product.product_name,
      product.category,
      product.price,
      Math.round(product.price * 0.4),
      Math.floor(Math.random() * 150) + 50
    ]);
  }
  console.log(`   ✓ 导入 ${products.length} 个产品\n`);
  
  // 2. 导入销售数据
  console.log('2. 导入销售数据...');
  const salesPath = path.join(__dirname, '..', '..', 'DS', 'sales.json');
  const sales = JSON.parse(fs.readFileSync(salesPath, 'utf-8'));
  
  await connection.execute('TRUNCATE TABLE sales');
  
  const saleSql = `
    INSERT INTO sales (store_id, store_name, product_id, product_name, category, price, quantity, sale_date, region, city)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  let imported = 0;
  for (const sale of sales) {
    await connection.execute(saleSql, [
      sale.store_id,
      sale.store_name || '',
      sale.product_id,
      sale.product_name,
      sale.category,
      sale.unit_price || sale.price,
      sale.quantity,
      sale.date || sale.sale_time.split(' ')[0],
      sale.region || '',
      sale.city || ''
    ]);
    imported++;
    if (imported % 5000 === 0) {
      console.log(`   已导入 ${imported}/${sales.length} 条...`);
    }
  }
  console.log(`   ✓ 导入 ${imported} 条销售记录\n`);
  
  await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
  
  // 统计
  const [productCount] = await connection.execute('SELECT COUNT(*) as count FROM products');
  const [salesCount] = await connection.execute('SELECT COUNT(*) as count FROM sales');
  const [totalAmount] = await connection.execute('SELECT SUM(price * quantity) as total FROM sales');
  
  console.log('='.repeat(50));
  console.log('导入完成！');
  console.log(`  产品数量: ${productCount[0].count} 种`);
  console.log(`  销售记录: ${salesCount[0].count} 条`);
  console.log(`  总销售额: ¥${totalAmount[0].total.toLocaleString()}`);
  console.log('='.repeat(50));
  
  await connection.end();
}

importSalesData().catch(console.error);
