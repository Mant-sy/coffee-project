const mysql = require('mysql2/promise')
const dbConfig = require('../config/db_config')

let pool = null

const initPool = async () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
    console.log('MySQL连接池创建成功')
    await initDatabase()
  }
  return pool
}

const initDatabase = async () => {
  const connection = await pool.getConnection()
  
  try {
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
    console.log('销售表创建成功')

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
    console.log('门店表创建成功')

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
    console.log('产品表创建成功')
  } finally {
    connection.release()
  }
}

const executeQuery = async (sql, params = []) => {
  await initPool()
  const [rows] = await pool.execute(sql, params)
  return rows
}

const executeInsert = async (sql, params = []) => {
  await initPool()
  const [result] = await pool.execute(sql, params)
  return { id: result.insertId }
}

const executeUpdate = async (sql, params = []) => {
  await initPool()
  const [result] = await pool.execute(sql, params)
  return { changes: result.affectedRows }
}

const executeDelete = async (sql, params = []) => {
  await initPool()
  const [result] = await pool.execute(sql, params)
  return { changes: result.affectedRows }
}

const closePool = async () => {
  if (pool) {
    await pool.end()
    pool = null
    console.log('MySQL连接池已关闭')
  }
}

module.exports = {
  initPool,
  executeQuery,
  executeInsert,
  executeUpdate,
  executeDelete,
  closePool,
  pool: () => pool
}
