export const getMapData = (region) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    
    const provinceList = ['anhui', 'aomen', 'beijing', 'chongqing', 'fujian', 'gansu', 
      'guangdong', 'guangxi', 'guizhou', 'hainan', 'hebei', 'heilongjiang', 'henan',
      'hubei', 'hunan', 'jiangsu', 'jiangxi', 'jilin', 'liaoning', 'neimenggu',
      'ningxia', 'qinghai', 'shandong', 'shanghai', 'shanxi', 'shanxi1', 'sichuan',
      'taiwan', 'tianjin', 'xianggang', 'xinjiang', 'xizang', 'yunnan', 'zhejiang']
    
    let url = `/static/map/${region}.json`
    if (provinceList.includes(region)) {
      url = `/static/map/province/${region}.json`
    }
    
    xhr.open('GET', url)
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          reject(new Error('获取地图数据失败: ' + url))
        }
      }
    }
    xhr.send()
  })
}
