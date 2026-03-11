const mysql = require('mysql2/promise');
const dbConfig = require('../config/db_config');

async function clearData() {
  const connection = await mysql.createConnection(dbConfig);
  
  console.log('清空数据库数据...\n');
  
  await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
  
  await connection.execute('TRUNCATE TABLE sales');
  console.log('✓ 销售数据已清空');
  
  await connection.execute('TRUNCATE TABLE stores');
  console.log('✓ 门店数据已清空');
  
  await connection.execute('TRUNCATE TABLE products');
  console.log('✓ 产品数据已清空');
  
  await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
  
  console.log('\n数据库已清空，等待上传新数据...');
  
  await connection.end();
}

clearData().catch(console.error);
