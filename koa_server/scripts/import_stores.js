const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dbConfig = require('../config/db_config');

async function importStores() {
  const connection = await mysql.createConnection(dbConfig);
  
  console.log('开始导入门店数据...');
  
  const storesPath = path.join(__dirname, '..', '..', 'DS', 'stores_china_mainland.json');
  const stores = JSON.parse(fs.readFileSync(storesPath, 'utf-8'));
  
  console.log(`读取到 ${stores.length} 家门店数据`);
  
  await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
  
  console.log('清空原有门店数据...');
  await connection.execute('TRUNCATE TABLE stores');
  
  console.log('开始插入新数据...');
  
  const insertSql = `
    INSERT INTO stores (store_id, store_name, region, city, address, manager, phone, open_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  let inserted = 0;
  for (const store of stores) {
    await connection.execute(insertSql, [
      store.store_id,
      store.store_name,
      store.region,
      store.city,
      store.address,
      store.manager,
      store.phone,
      store.open_date
    ]);
    inserted++;
    if (inserted % 100 === 0) {
      console.log(`已插入 ${inserted}/${stores.length} 条记录...`);
    }
  }
  
  await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
  
  const [rows] = await connection.execute('SELECT COUNT(*) as count FROM stores');
  console.log(`\n导入完成！当前门店总数: ${rows[0].count}`);
  
  await connection.end();
}

importStores().catch(console.error);
