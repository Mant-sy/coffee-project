# 咖啡门店数字孪生大屏项目 - 启动说明

## 项目概述
本项目是一个基于Vue3+Three.js+ECharts技术栈的咖啡门店数字孪生可视化系统，实现了"数据-可视化-预测"的完整闭环。

## 技术栈
- **前端**: Vue 3 + Three.js + ECharts + Pinia + Vue Router
- **后端**: Node.js + Koa + SQLite + WebSocket
- **开发工具**: Vite

## 功能模块

### 1. 数字孪生3D场景
- 使用Three.js渲染门店3D模型
- 支持模型旋转、缩放等交互操作
- 提供直观的3D可视化效果

### 2. 数据可视化
- ECharts展示实时销量趋势
- 商家销售金额图表
- 地区销量排行
- 热销商品占比
- 库存销量分析

### 3. 销量预测
- 支持7天、14天、30天预测周期
- 基于历史数据的预测算法
- 可视化展示预测结果

### 4. 用户登录退出
- 用户登录状态管理
- 本地存储登录信息
- 敏感操作权限验证

### 5. 数据上传
- CSV文件上传支持
- 销售数据、门店数据、产品数据上传
- 自动解析并写入SQLite数据库

### 6. 门店下钻
- 从地图到门店列表
- 从门店列表到门店详情
- 详细销售数据和热销产品展示

## 启动步骤

### 后端启动
```bash
cd koa_server
node app.js
```
后端服务将启动在:
- HTTP服务器: http://localhost:8888
- WebSocket服务: ws://localhost:9998

### 前端启动

#### 方法1: 使用npm命令
```bash
cd vision-v3
npm run dev
```

#### 方法2: 使用批处理文件
双击运行 `start.bat` 文件

#### 方法3: 直接访问
在浏览器中打开 `test.html` 查看系统状态

## 访问地址
- **大屏页面**: http://localhost:5173
- **API接口**: http://localhost:8888/api
- **测试页面**: test.html

## 项目结构
```
vision-project/
├── koa_server/              # 后端服务
│   ├── app.js              # 主入口文件
│   ├── routes/             # API路由
│   ├── service/             # WebSocket服务
│   ├── utils/               # 工具函数
│   └── data/                # 数据文件
└── vision-v3/             # 前端项目
    ├── src/
    │   ├── components/      # Vue组件
    │   ├── views/           # 页面组件
    │   ├── router/          # 路由配置
    │   ├── store/           # 状态管理
    │   └── utils/           # 工具函数
    ├── public/              # 静态资源
    └── index.html           # 入口文件
```

## 主要文件说明

### 后端核心文件
- `app.js`: Koa服务器主入口
- `routes/api.js`: RESTful API接口
- `service/web_socket_service.js`: WebSocket实时通信
- `utils/csv_utils.js`: CSV文件解析
- `utils/db_utils.js`: SQLite数据库操作

### 前端核心文件
- `src/main.js`: Vue应用入口
- `src/App.vue`: 根组件
- `src/views/ScreenPage.vue`: 大屏主页面
- `src/components/Store3D.vue`: 3D门店模型
- `src/components/Prediction.vue`: 销量预测组件

## 数据库表结构

### sales表 (销售数据)
- store_id: 门店ID
- store_name: 门店名称
- product_id: 产品ID
- product_name: 产品名称
- category: 产品类别
- price: 价格
- quantity: 数量
- sale_date: 销售日期
- region: 地区
- city: 城市

### stores表 (门店数据)
- store_id: 门店ID
- store_name: 门店名称
- region: 地区
- city: 城市
- address: 地址
- manager: 负责人
- phone: 联系电话
- open_date: 开业日期

### products表 (产品数据)
- product_id: 产品ID
- product_name: 产品名称
- category: 产品类别
- price: 价格
- cost: 成本
- stock: 库存

## API接口

### 销售数据接口
- `GET /api/sales`: 获取销售数据
- `GET /api/sales/trend`: 获取销量趋势
- `GET /api/sales/seller`: 获取商家销售金额
- `GET /api/sales/rank`: 获取地区销量排行
- `GET /api/sales/hot`: 获取热销商品
- `GET /api/sales/stock`: 获取库存销量分析
- `GET /api/sales/prediction`: 获取销量预测

### 门店数据接口
- `GET /api/stores`: 获取门店列表
- `GET /api/store/detail`: 获取门店详情
- `GET /api/store/sales`: 获取门店销售数据
- `GET /api/store/products`: 获取门店热销产品

### 数据上传接口
- `POST /api/upload/sales`: 上传销售数据CSV
- `POST /api/upload/stores`: 上传门店数据CSV
- `POST /api/upload/products`: 上传产品数据CSV

## WebSocket通信

### 客户端发送消息格式
```javascript
{
  action: 'getData',      // 动作类型
  socketType: 'trend',  // 消息类型
  chartName: 'trend',   // 图表名称
  value: ''             // 数据值
}
```

### 服务端返回消息格式
```javascript
{
  action: 'getData',
  socketType: 'trend',
  chartName: 'trend',
  value: '',
  data: {              // 实际数据
    xData: [...],
    series: [...]
  }
}
```

## 常见问题

### 1. 前端无法启动
- 确保已安装依赖: `npm install`
- 检查端口5173是否被占用
- 尝试使用其他端口: `npm run dev -- --port 3000`

### 2. 后端无法启动
- 确保已安装依赖: `npm install`
- 检查端口8888和9998是否被占用
- 检查SQLite数据库文件权限

### 3. WebSocket连接失败
- 确保后端WebSocket服务正常运行
- 检查防火墙设置
- 确认WebSocket地址: ws://localhost:9998

### 4. 3D场景无法显示
- 检查Three.js是否正确安装
- 确认浏览器支持WebGL
- 查看控制台错误信息

### 5. ECharts图表无法显示
- 确认ECharts库正确加载
- 检查数据格式是否正确
- 查看图表配置是否完整

## 开发建议

1. **代码规范**: 遵循Vue3 Composition API规范
2. **性能优化**: 使用虚拟滚动处理大数据量
3. **错误处理**: 添加完善的错误处理机制
4. **响应式设计**: 确保在不同屏幕尺寸下正常显示
5. **数据验证**: 对用户输入进行严格验证

## 部署建议

1. **前端部署**: 使用 `npm run build` 构建生产版本
2. **后端部署**: 使用PM2或Docker进行进程管理
3. **数据库优化**: 考虑使用MySQL或PostgreSQL替代SQLite
4. **CDN加速**: 将静态资源部署到CDN
5. **HTTPS配置**: 生产环境启用HTTPS

## 技术支持

如遇到问题，请检查:
1. 浏览器控制台错误信息
2. 网络请求状态
3. 后端服务器日志
4. 数据库连接状态

## 更新日志

### v1.0.0 (2026-03-02)
- 初始版本发布
- 实现核心功能模块
- 完成前后端基础架构
- 支持CSV数据上传
- 实现数字孪生3D场景
- 添加销量预测功能