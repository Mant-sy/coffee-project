module.exports = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '123456',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'coffee_stores',
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
}
