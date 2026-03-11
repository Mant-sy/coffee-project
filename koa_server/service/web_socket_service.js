const WebSocket = require('ws')
const { executeQuery } = require('../utils/db_utils')

let wss = null

const initWebSocket = (server) => {
  wss = new WebSocket.Server({ server })
  console.log('WebSocket 服务已启动')
}

let salesData = []
let trendData = { xData: [], series: [] }
let sellerData = { xData: [], series: [] }
let hotData = []
let mapData = []
let productRankData = []
let currentMapLevel = 0
let currentProvince = ''
let currentCity = ''

const getTrendData = async () => {
  const sales = await executeQuery(
    'SELECT DATE_FORMAT(sale_date, "%Y-%m-%d") as date, SUM(quantity) as total FROM sales GROUP BY date ORDER BY date DESC LIMIT 30'
  )
  trendData = {
    xData: sales.map(item => item.date).reverse(),
    series: sales.map(item => item.total).reverse()
  }
  return trendData
}

const getSellerData = async () => {
  const sales = await executeQuery(
    'SELECT store_name, SUM(price * quantity) as total FROM sales GROUP BY store_name ORDER BY total DESC'
  )
  sellerData = {
    xData: sales.map(item => item.store_name),
    series: sales.map(item => item.total)
  }
  return sellerData
}

const getRankData = async () => {
  const sales = await executeQuery(
    'SELECT region, SUM(quantity) as total FROM sales GROUP BY region ORDER BY total DESC LIMIT 10'
  )
  return {
    xData: sales.map(item => item.region),
    series: sales.map(item => item.total)
  }
}

const getHotData = async () => {
  const sales = await executeQuery(
    'SELECT product_name, SUM(quantity) as total FROM sales GROUP BY product_name ORDER BY total DESC LIMIT 10'
  )
  hotData = sales.map(item => ({
    name: item.product_name,
    value: item.total
  })).sort((a, b) => b.value - a.value)
  return hotData
}

const getProductRankData = async () => {
  const sales = await executeQuery(
    'SELECT product_name, SUM(quantity) as total FROM sales GROUP BY product_name ORDER BY total DESC LIMIT 15'
  )
  productRankData = sales.map(item => ({
    name: item.product_name,
    value: item.total
  })).sort((a, b) => b.value - a.value)
  return productRankData
}

const getStockData = async () => {
  const sales = await executeQuery(
    'SELECT product_name, SUM(quantity) as sales FROM sales GROUP BY product_name LIMIT 10'
  )
  const products = await executeQuery(
    'SELECT product_name, stock FROM products LIMIT 10'
  )
  
  const productMap = new Map()
  products.forEach(product => {
    productMap.set(product.product_name, product.stock)
  })
  
  const xData = []
  const stockData = []
  const salesData = []
  
  sales.forEach(item => {
    xData.push(item.product_name)
    stockData.push(productMap.get(item.product_name) || 0)
    salesData.push(item.sales)
  })
  
  return { xData, stockData, salesData }
}

const allProvinces = ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆', '台湾', '香港', '澳门']

const provinceCities = {
  '北京': ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区', '门头沟区', '房山区', '通州区', '顺义区', '昌平区', '大兴区', '怀柔区', '平谷区', '密云区', '延庆区'],
  '天津': ['和平区', '河东区', '河西区', '南开区', '河北区', '红桥区', '东丽区', '西青区', '津南区', '北辰区', '武清区', '宝坻区', '滨海新区', '宁河区', '静海区', '蓟州区'],
  '河北': ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市', '衡水市'],
  '山西': ['太原市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市', '忻州市', '临汾市', '吕梁市'],
  '内蒙古': ['呼和浩特市', '包头市', '乌海市', '赤峰市', '通辽市', '鄂尔多斯市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市', '兴安盟', '锡林郭勒盟', '阿拉善盟'],
  '辽宁': ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市', '阜新市', '辽阳市', '盘锦市', '铁岭市', '朝阳市', '葫芦岛市'],
  '吉林': ['长春市', '吉林市', '四平市', '辽源市', '通化市', '白山市', '松原市', '白城市', '延边朝鲜族自治州'],
  '黑龙江': ['哈尔滨市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市', '大庆市', '伊春市', '佳木斯市', '七台河市', '牡丹江市', '黑河市', '绥化市', '大兴安岭地区'],
  '上海': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '闵行区', '宝山区', '嘉定区', '浦东新区', '金山区', '松江区', '青浦区', '奉贤区', '崇明区'],
  '江苏': ['南京市', '无锡市', '徐州市', '常州市', '苏州市', '南通市', '连云港市', '淮安市', '盐城市', '扬州市', '镇江市', '泰州市', '宿迁市'],
  '浙江': ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市', '丽水市'],
  '安徽': ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市', '黄山市', '滁州市', '阜阳市', '宿州市', '六安市', '亳州市', '池州市', '宣城市'],
  '福建': ['福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市', '宁德市'],
  '江西': ['南昌市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市', '赣州市', '吉安市', '宜春市', '抚州市', '上饶市'],
  '山东': ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市', '日照市', '临沂市', '德州市', '聊城市', '滨州市', '菏泽市'],
  '河南': ['郑州市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市', '濮阳市', '许昌市', '漯河市', '三门峡市', '南阳市', '商丘市', '信阳市', '周口市', '驻马店市', '济源市'],
  '湖北': ['武汉市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆门市', '孝感市', '荆州市', '黄冈市', '咸宁市', '随州市', '恩施土家族苗族自治州', '仙桃市', '潜江市', '天门市', '神农架林区'],
  '湖南': ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市', '益阳市', '郴州市', '永州市', '怀化市', '娄底市', '湘西土家族苗族自治州'],
  '广东': ['广州市', '韶关市', '深圳市', '珠海市', '汕头市', '佛山市', '江门市', '湛江市', '茂名市', '肇庆市', '惠州市', '梅州市', '汕尾市', '河源市', '阳江市', '清远市', '东莞市', '中山市', '潮州市', '揭阳市', '云浮市'],
  '广西': ['南宁市', '柳州市', '桂林市', '梧州市', '北海市', '防城港市', '钦州市', '贵港市', '玉林市', '百色市', '贺州市', '河池市', '来宾市', '崇左市'],
  '海南': ['海口市', '三亚市', '三沙市', '儋州市', '五指山市', '琼海市', '文昌市', '万宁市', '东方市'],
  '重庆': ['万州区', '涪陵区', '渝中区', '大渡口区', '江北区', '沙坪坝区', '九龙坡区', '南岸区', '北碚区', '綦江区', '大足区', '渝北区', '巴南区', '黔江区', '长寿区', '江津区', '合川区', '永川区', '南川区', '璧山区', '铜梁区', '潼南区', '荣昌区', '开州区', '梁平区', '武隆区'],
  '四川': ['成都市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市', '内江市', '乐山市', '南充市', '眉山市', '宜宾市', '广安市', '达州市', '雅安市', '巴中市', '资阳市'],
  '贵州': ['贵阳市', '六盘水市', '遵义市', '安顺市', '毕节市', '铜仁市', '黔西南布依族苗族自治州', '黔东南苗族侗族自治州', '黔南布依族苗族自治州'],
  '云南': ['昆明市', '曲靖市', '玉溪市', '保山市', '昭通市', '丽江市', '普洱市', '临沧市', '楚雄彝族自治州', '红河哈尼族彝族自治州', '文山壮族苗族自治州', '西双版纳傣族自治州', '大理白族自治州', '德宏傣族景颇族自治州', '怒江傈僳族自治州', '迪庆藏族自治州'],
  '西藏': ['拉萨市', '日喀则市', '昌都市', '林芝市', '山南市', '那曲市', '阿里地区'],
  '陕西': ['西安市', '铜川市', '宝鸡市', '咸阳市', '渭南市', '延安市', '汉中市', '榆林市', '安康市', '商洛市'],
  '甘肃': ['兰州市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市', '平凉市', '酒泉市', '庆阳市', '定西市', '陇南市', '临夏回族自治州', '甘南藏族自治州'],
  '青海': ['西宁市', '海东市', '海北藏族自治州', '黄南藏族自治州', '海南藏族自治州', '果洛藏族自治州', '玉树藏族自治州', '海西蒙古族藏族自治州'],
  '宁夏': ['银川市', '石嘴山市', '吴忠市', '固原市', '中卫市'],
  '新疆': ['乌鲁木齐市', '克拉玛依市', '吐鲁番市', '哈密市', '昌吉回族自治州', '博尔塔拉蒙古自治州', '巴音郭楞蒙古自治州', '阿克苏地区', '克孜勒苏柯尔克孜自治州', '喀什地区', '和田地区', '伊犁哈萨克自治州', '塔城地区', '阿勒泰地区'],
  '香港': ['中西区', '湾仔区', '东区', '南区', '油尖旺区', '深水埗区', '九龙城区', '黄大仙区', '观塘区', '荃湾区', '屯门区', '元朗区', '北区', '大埔区', '西贡区', '沙田区', '葵青区', '离岛区'],
  '澳门': ['花地玛堂区', '圣安多尼堂区', '望德堂区', '大堂区', '风顺堂区', '嘉模堂区', '圣方济各堂区'],
  '台湾': ['台北市', '新北市', '桃园市', '台中市', '台南市', '高雄市', '基隆市', '新竹市', '嘉义市', '新竹县', '苗栗县', '彰化县', '南投县', '云林县', '嘉义县', '屏东县', '宜兰县', '花莲县', '台东县', '澎湖县', '金门县', '连江县']
}

const getMapData = async (level = 0, province = '', city = '') => {
  if (level === 0) {
    const stores = await executeQuery("SELECT region, COUNT(*) as count FROM stores GROUP BY region")
    const dataMap = new Map(stores.map(s => [s.region, s.count]))
    mapData = allProvinces.map(name => ({
      name: name,
      value: dataMap.get(name) || 0
    }))
    return mapData
  } else if (level === 1) {
    const cities = provinceCities[province] || []
    const stores = await executeQuery("SELECT city, COUNT(*) as count FROM stores WHERE region = ? GROUP BY city", [province])
    const dataMap = new Map(stores.map(s => [s.city, s.count]))
    mapData = cities.map(name => ({
      name: name,
      value: dataMap.get(name) || 0
    }))
    return mapData
  } else if (level === 2) {
    const stores = await executeQuery("SELECT city, COUNT(*) as count FROM stores WHERE city = ? GROUP BY city", [city])
    if (stores.length > 0) {
      return [{ name: city, value: stores[0].count }]
    }
    return [{ name: city, value: 0 }]
  }
  return []
}

const generateRandomChange = (value, maxChange = 0.1) => {
  const change = (Math.random() - 0.5) * 2 * maxChange
  return Math.max(0, Math.round(value * (1 + change)))
}

const broadcastData = (socketType, chartName, data) => {
  const message = JSON.stringify({
    action: 'getData',
    socketType: socketType,
    chartName: chartName,
    data: data
  })
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}

const simulateDataUpdate = async () => {
  if (trendData.series.length > 0) {
    const newSeries = trendData.series.map(v => generateRandomChange(v, 0.05))
    trendData.series = newSeries
    broadcastData('trend', 'trend', trendData)
  }
  
  await getHotData()
  broadcastData('hot', 'hot', hotData)
  
  await getProductRankData()
  broadcastData('productRank', 'productRank', productRankData)
  
  if (mapData.length > 0) {
    const newMapData = mapData.map(item => ({
      name: item.name,
      value: item.value > 0 ? generateRandomChange(item.value, 0.1) : item.value
    }))
    mapData = newMapData
    broadcastData('map', 'map', mapData)
  }
}

const initializeData = async () => {
  await getTrendData()
  await getSellerData()
  await getHotData()
  await getProductRankData()
  await getMapData()
  console.log('初始数据加载完成')
}

module.exports.listen = (server) => {
  initWebSocket(server)
  initializeData()
  
  setInterval(simulateDataUpdate, 10000)
  
  wss.on('connection', client => {
    console.log('有客户端连接成功了...')
    client.on('message', async msg => {
      console.log('客户端发送数据给服务端了: ' + msg)
      let payload = JSON.parse(msg)
      const action = payload.action
      if (action === 'getData') {
        const chartName = payload.chartName
        let data = null
        
        switch (chartName) {
          case 'trend':
            data = await getTrendData()
            break
          case 'seller':
            data = await getSellerData()
            break
          case 'map':
            const mapLevel = payload.value?.level || 0
            const province = payload.value?.province || ''
            const city = payload.value?.city || ''
            currentMapLevel = mapLevel
            currentProvince = province
            currentCity = city
            data = await getMapData(mapLevel, province, city)
            break
          case 'rank':
            data = await getRankData()
            break
          case 'hot':
            data = hotData
            break
          case 'productRank':
            data = productRankData
            break
          case 'stock':
            data = await getStockData()
            break
          default:
            data = null
        }
        
        payload.data = data
        console.log('返回数据:', chartName, JSON.stringify(data).substring(0, 200))
        client.send(JSON.stringify(payload))
      } else {
        wss.clients.forEach(client => {
          client.send(msg)
        })
      }
    })
  })
}
