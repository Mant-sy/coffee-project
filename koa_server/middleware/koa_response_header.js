// 设置响应头的中间件
module.exports = async (ctx, next) => {
  const contentType = 'application/json; charset=utf-8'
  ctx.set('Content-Type', contentType)
  ctx.set("Access-Control-Allow-Origin", "*")
  ctx.set("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, POST, DELETE")
  ctx.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept")
  
  // 处理OPTIONS预检请求
  if (ctx.method === 'OPTIONS') {
    ctx.status = 204
    return
  }
  
  await next()
}