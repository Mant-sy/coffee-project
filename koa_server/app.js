// 服务器的入口文件
// 1.创建KOA的实例对象
const Koa = require('koa')
const http = require('http')
const app = new Koa()
const { koaBody } = require('koa-body')
const path = require('path')

// 2.绑定中间件
// CORS 跨域支持
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*')
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (ctx.method === 'OPTIONS') {
    ctx.status = 204
    return
  }
  await next()
})
// 绑定第一层中间件
const respDurationMiddleware =  require('./middleware/koa_response_duration')
app.use(respDurationMiddleware)
// 绑定第二层中间件
const respHeaderMiddleware = require('./middleware/koa_response_header')
app.use(respHeaderMiddleware)
// 绑定Koa Body中间件，用于处理文件上传
app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, 'uploads'),
    keepExtensions: true
  }
}))
// 绑定第三层中间件
const respDataMiddleware = require('./middleware/koa_response_data')
// 绑定路由
const apiRouter = require('./routes/api')
app.use(apiRouter.routes())
app.use(apiRouter.allowedMethods())
// 只有在没有路由匹配时才使用响应数据中间件
app.use(respDataMiddleware)

// 3.绑定端口号
const PORT = process.env.PORT || 8888
const server = http.createServer(app.callback())
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Koa 已启动 → http://0.0.0.0:${PORT}`);
})

// 初始化数据库
require('./utils/db_utils')

// WebSocket服务
const webSocketService = require('./service/web_socket_service')
// 开启服务端的监听, 监听客户端的连接
// 当某一个客户端连接成功之后, 就会对这个客户端进行message事件的监听
webSocketService.listen(server)
