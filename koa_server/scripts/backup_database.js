const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dbConfig = require('../config/db_config');

async function backupDatabase() {
  const connection = await mysql.createConnection(dbConfig);
  
  console.log('开始备份数据库...');
  
  const backupDir = path.join(__dirname, '..', 'DS', 'backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  
  const tables = ['stores', 'products', 'sales', 'hot_products', 'product_rank'];
  
  for (const table of tables) {
    try {
      const [rows] = await connection.execute(`SELECT * FROM ${table}`);
      if (rows.length > 0) {
        const backupPath = path.join(backupDir, `${table}_${timestamp}.json`);
        fs.writeFileSync(backupPath, JSON.stringify(rows, null, 2));
        console.log(`备份 ${table}: ${rows.length} 条记录 -> ${backupPath}`);
      } else {
        console.log(`表 ${table} 为空，跳过备份`);
      }
    } catch (error) {
      console.log(`表 ${table} 不存在或备份失败: ${error.message}`);
    }
  }
  
  await connection.end();
  console.log('数据库备份完成！');
}

backupDatabase().catch(console.error);
