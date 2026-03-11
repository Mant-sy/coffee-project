class SocketService {
  constructor() {
    this.ws = null
    this.callbackMap = {}
    this.isConnected = false
    this.reconnectTimer = null
    this.pendingMessages = []
  }

  connect() {
    if (this.ws) {
      this.ws.close()
    }
    this.ws = new WebSocket('ws://localhost:9998')
    
    this.ws.onopen = () => {
      console.log('WebSocket连接成功')
      this.isConnected = true
      if (this.reconnectTimer) {
        clearInterval(this.reconnectTimer)
        this.reconnectTimer = null
      }
      this.sendPendingMessages()
    }
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        const socketType = data.socketType
        if (this.callbackMap[socketType]) {
          this.callbackMap[socketType](data)
        }
      } catch (error) {
        console.error('WebSocket消息解析失败:', error)
      }
    }
    
    this.ws.onclose = () => {
      console.log('WebSocket连接关闭')
      this.isConnected = false
      this.reconnect()
    }
    
    this.ws.onerror = (error) => {
      console.error('WebSocket错误:', error)
    }
  }

  reconnect() {
    if (!this.reconnectTimer) {
      this.reconnectTimer = setInterval(() => {
        console.log('尝试重新连接WebSocket...')
        this.connect()
      }, 5000)
    }
  }

  send(data) {
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.log('WebSocket未连接，消息加入队列等待发送')
      this.pendingMessages.push(data)
      if (!this.isConnected) {
        this.connect()
      }
    }
  }

  sendPendingMessages() {
    while (this.pendingMessages.length > 0 && this.isConnected) {
      const msg = this.pendingMessages.shift()
      this.ws.send(JSON.stringify(msg))
    }
  }

  registerCallBack(socketType, callback) {
    this.callbackMap[socketType] = callback
  }

  unRegisterCallBack(socketType) {
    delete this.callbackMap[socketType]
  }

  close() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    if (this.reconnectTimer) {
      clearInterval(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}

// 单例模式
const socketService = new SocketService()
export default socketService
