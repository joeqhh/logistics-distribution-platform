import { io } from '../app'
import { findAllLogistics, type Logistics ,findFutureLogistics} from '../models/Logistics'
import type { Socket } from 'socket.io'

interface Coordinate {
  lat: number
  lng: number
}

interface CoordinateSchedule {
  time: number
  coordinate: [number,number][]
  logisticsId: number
  logisticsDescribe: string
  logisticsCreateTime: Date
  logisticsStatus: string
  orderId: string
}

// 全局定时器映射，key为orderId，value为定时器ID
const timers = new Map<string, NodeJS.Timeout>()
// 全局坐标计划映射，key为orderId，value为坐标计划数组
const coordinateSchedules = new Map<string, CoordinateSchedule[]>()
// 房间关闭定时器映射，key为roomName，value为定时器ID
const roomCloseTimers = new Map<string, NodeJS.Timeout>()
// 房间关闭状态映射，key为roomName，value为是否关闭
const roomClosed = new Map<string, boolean>()
// 记录每个socket加入的物流房间，key为socketId，value为房间名数组
const socketLogisticsRooms = new Map<string, string[]>()

// 解析单个物流记录的坐标
const parseLogisticsCoordinates = (logistics: Logistics): CoordinateSchedule[] => {
  // 不再对location进行拆分，直接使用整个location作为一个坐标点
  if (logistics.location) {
    const points = logistics.location.split(';').map(item => {
      const [lng,lat] = item.split(',').map(i => parseFloat(i))
      return [lng,lat]
    })
      // 直接使用logistics.createTime作为推送时间
      return [{
        time: logistics.createTime.getTime(),
        coordinate: points as [number,number][],
        logisticsId: logistics.id,
        logisticsDescribe: logistics.describe || '',
        logisticsCreateTime: logistics.createTime,
        logisticsStatus: logistics.status,
        orderId: logistics.orderId
      }]
  }
  return []
}


// 推送单个坐标
const pushCoordinate = (schedule: CoordinateSchedule): void => {
  try {
    // 检查房间是否已关闭
    const hasRoomName = `logistics:${schedule.orderId}`
    if (roomClosed.get(hasRoomName)) {
      console.log(`房间 ${hasRoomName} 已关闭，跳过坐标推送`)
      return
    }
    
    const currentTime = Date.now()
    console.log(`推送订单 ${schedule.orderId} 的坐标:`, schedule.coordinate)
    
    // 检查是否需要发送物流状态信息（仅当物流ID变化时发送）
    const orderSchedules = coordinateSchedules.get(schedule.orderId) || []
    const prevSchedule = orderSchedules.find(s => s.time < schedule.time) || null
    const needSendLogisticsInfo = !prevSchedule || prevSchedule.logisticsId !== schedule.logisticsId
    
    const logisticsObject = needSendLogisticsInfo ? {
      logisticsId: schedule.logisticsId,
      logisticsDescribe: schedule.logisticsDescribe,
      logisticsCreateTime: schedule.logisticsCreateTime,
      logisticsStatus: schedule.logisticsStatus
    } : {}

    // 向前端推送坐标（使用房间推送）
    const roomName = `logistics:${schedule.orderId}`
    io.to(roomName).emit('logisticsCoordinateUpdate', {
      points: schedule.coordinate,
      orderId: schedule.orderId,
      ...logisticsObject,
      timestamp: new Date(currentTime).toISOString()
    })
    
    // 记录推送日志
    const roomClients = io.sockets.adapter.rooms.get(roomName)
    console.log(`推送订单 ${schedule.orderId} 的坐标到房间 ${roomName} (连接数: ${roomClients?.size || 0}):`, schedule.coordinate)
    
    // 从计划中移除已推送的坐标
    const updatedSchedules = orderSchedules.filter(s => s.time !== schedule.time)
    coordinateSchedules.set(schedule.orderId, updatedSchedules)
    
    // 如果该订单还有更多坐标计划，设置下一个坐标的定时器
    if (updatedSchedules.length > 0) {
      // 按时间排序剩余的坐标计划
      const nextSchedule = updatedSchedules.sort((a, b) => a.time - b.time)[0]
      // 为下一个坐标设置定时器
      scheduleCoordinatePush(nextSchedule)
    } else {
      // 如果该订单没有更多坐标计划，清除定时器
      console.log('推送完毕')
      const timer = timers.get(schedule.orderId)
      if (timer) {
        clearTimeout(timer)
        timers.delete(schedule.orderId)
      }
    }
  } catch (error) {
    console.error(`推送坐标失败:`, error)
    // 可以添加重试逻辑
  }
}

// 为坐标计划设置定时器
const scheduleCoordinatePush = (schedule: CoordinateSchedule): void => {
  const delay = schedule.time - Date.now()
  
  // 如果已经过了推送时间，立即推送
  if (delay <= 0) {
    pushCoordinate(schedule)
    return
  }
  
  // 获取该订单的现有定时器
  const existingTimer = timers.get(schedule.orderId)
  if (existingTimer) {
    clearTimeout(existingTimer)
  }
  
  // 设置新的定时器
  const timer = setTimeout(() => pushCoordinate(schedule), delay)
  timers.set(schedule.orderId, timer)
}

// 更新订单的坐标计划
const updateOrderSchedules = async (orderId: string): Promise<void> => {
  try {
    // 获取该订单的所有物流记录（包括历史）
    const allLogistics = await findAllLogistics()
    const orderLogistics = allLogistics.filter(l => l.orderId === orderId).sort((a, b) => a.createTime.getTime() - b.createTime.getTime())
    
    // 生成新的坐标计划
    const newSchedules: CoordinateSchedule[] = []
    for (const logistics of orderLogistics) {
      const logisticsSchedules = parseLogisticsCoordinates(logistics)
      newSchedules.push(...logisticsSchedules)
    }
    
    // 按时间排序
    newSchedules.sort((a, b) => a.time - b.time)
    
    // 存储新的坐标计划
    coordinateSchedules.set(orderId, newSchedules)
    
    // 向房间内的所有客户端推送最新坐标
    if (newSchedules.length > 0) {
      const currentTime = Date.now()
      const latestSchedule = newSchedules.filter(schedule => schedule.time <= currentTime).pop()
      
      if (latestSchedule) {
        console.log(`更新订单 ${orderId} 的坐标计划后，推送最新坐标:`, latestSchedule.coordinate)
        
        const logisticsObject = {
          logisticsId: latestSchedule.logisticsId,
          logisticsDescribe: latestSchedule.logisticsDescribe,
          logisticsCreateTime: latestSchedule.logisticsCreateTime,
          logisticsStatus: latestSchedule.logisticsStatus
        }
        
        const roomName = `logistics:${orderId}`
        io.to(roomName).emit('logisticsCoordinateUpdate', {
          points: latestSchedule.coordinate,
          orderId: latestSchedule.orderId,
          ...logisticsObject,
          timestamp: new Date(currentTime).toISOString()
        })
      }
    }
  } catch (error) {
    console.error(`更新订单 ${orderId} 的坐标计划失败:`, error)
  }
}


// WebSocket物流坐标推送服务
const startLogisticsWebSocketService = async () => {
  // 初始化坐标推送计划
  // await initializeSchedules()
  
  // 监听WebSocket连接事件
  io.on('connection', (socket: Socket) => {
    console.log(`新的WebSocket连接: ${socket.id}`)
    
    // 初始化该socket的物流房间记录
    // socketLogisticsRooms.set(socket.id, [])
    
    // 监听客户端加入特定订单物流room的请求
    socket.on('joinLogisticsRoom', async (orderId: string) => {
      if (orderId) {
        const roomName = `logistics:${orderId}`
        socket.join(roomName)
        console.log(`客户端 ${socket.id} 加入房间: ${roomName}`)
        
        // 获取当前房间的连接数
        const roomClients = io.sockets.adapter.rooms.get(roomName)
        console.log(`房间 ${roomName} 当前连接数: ${roomClients?.size || 0}`)
        
        // 记录该socket加入的物流房间
        const currentRooms = socketLogisticsRooms.get(socket.id) || []
        if (!currentRooms.includes(roomName)) {
          currentRooms.push(roomName)
          socketLogisticsRooms.set(socket.id, currentRooms)
        }
        
        // // 取消房间关闭状态
        roomClosed.delete(roomName)
        
        // 如果房间正在等待关闭（有关闭定时器），则取消关闭定时器
        const closeTimer = roomCloseTimers.get(roomName)
        if (closeTimer) {
          clearTimeout(closeTimer)
          roomCloseTimers.delete(roomName)
          console.log(`已取消房间 ${roomName} 的关闭定时器`)
        }
        
        if(!coordinateSchedules.has(orderId)) {
          // 从数据库获取最新的物流数据
          const futureLogistics = await findFutureLogistics(orderId)
          console.log('初始化了物流数据');
          
          const currentTime = Date.now()
          
          if (futureLogistics.length > 0) {
            // 生成当前订单的所有未来坐标计划
            const futureSchedules: CoordinateSchedule[] = []
            for (const logistics of futureLogistics) {
              const schedules = parseLogisticsCoordinates(logistics)
              futureSchedules.push(...schedules)
            }
            
            // 按时间排序
            futureSchedules.sort((a, b) => a.time - b.time)
            
            // 筛选未来的坐标计划（time > 当前时间）
            const filteredSchedules = futureSchedules.filter(schedule => schedule.time > currentTime)
            
            if (filteredSchedules.length > 0) {
              // 存储坐标计划
              coordinateSchedules.set(orderId, filteredSchedules)
              
              // 为第一个未来坐标设置定时器
              scheduleCoordinatePush(filteredSchedules[0])
            }
          }

        } else {
          console.log('已经有了物流数据');
        }
      }
    })
    
    // 监听客户端离开特定订单物流room的请求
    socket.on('leaveLogisticsRoom', (orderId: string) => {
      if (orderId) {
        const roomName = `logistics:${orderId}`
        socket.leave(roomName)
        console.log(`客户端 ${socket.id} 离开房间: ${roomName}`)
        
        // 更新该socket的物流房间记录
        const currentRooms = socketLogisticsRooms.get(socket.id) || []
        const updatedRooms = currentRooms.filter(r => r !== roomName)
        socketLogisticsRooms.set(socket.id, updatedRooms)
        
        // 检查房间是否为空
        checkAndCleanupRoom(roomName)
      }
    })
    
    // 监听连接断开事件
    socket.on('disconnect', () => {
      console.log(`WebSocket连接断开: ${socket.id}`)
      
      // 获取该socket加入的所有物流房间
      const logisticsRooms = socketLogisticsRooms.get(socket.id) || []
      
      // 检查每个物流房间是否为空
      logisticsRooms.forEach(roomName => {
        console.log(`检查断开连接的socket所在物流房间: ${roomName}`)
        // 延迟检查，给Socket.IO足够的时间来更新房间信息
        setTimeout(() => {
          checkAndCleanupRoom(roomName)
        }, 100)
      })
      
      // 移除该socket的房间记录
      socketLogisticsRooms.delete(socket.id)
    })
  })
  
  
  console.log('物流坐标WebSocket推送服务已启动')
  
  // 监听系统关闭事件，清理资源
  process.on('SIGINT', () => {
    console.log('正在关闭物流坐标推送服务...')
    timers.forEach(timer => clearTimeout(timer))
    timers.clear()
    coordinateSchedules.clear()
    // 清理房间关闭定时器
    roomCloseTimers.forEach(timer => clearTimeout(timer))
    roomCloseTimers.clear()
    process.exit(0)
  })
}

// 检查房间是否为空，如果为空则设置关闭定时器
const checkAndCleanupRoom = (roomName: string) => {
  const roomClients = io.sockets.adapter.rooms.get(roomName)
  if (!roomClients || roomClients.size === 0) {
    // 检查是否已经有关闭定时器
    if (roomCloseTimers.has(roomName)) {
      return // 已经有定时器，不需要重复设置
    }
    
    console.log(`房间 ${roomName} 已为空，将在1分钟后标记为关闭...`)
    
    // 设置1分钟的关闭定时器
    const timer = setTimeout(() => {
      console.log(`房间 ${roomName} 关闭定时器触发，标记房间为关闭状态...`)
      
      // 标记房间为关闭状态
      roomClosed.set(roomName, true)
      
      // 提取orderId
      const orderId = roomName.replace('logistics:', '')
      
      // 清除定时器和坐标计划
      const coordinateTimer = timers.get(orderId)
      if (coordinateTimer) {
        clearTimeout(coordinateTimer)
        timers.delete(orderId)
      }
      
      coordinateSchedules.delete(orderId)
      
      // 移除关闭定时器记录
      roomCloseTimers.delete(roomName)
      
      console.log(`已关闭房间 ${roomName} 并清理相关资源`)
    }, 60000) // 1分钟后执行
    
    // 存储关闭定时器
    roomCloseTimers.set(roomName, timer)
  }
}

// 导出更新订单坐标计划的函数，方便外部调用
export const updateOrderLogisticsSchedules = async (orderId: string): Promise<void> => {
  await updateOrderSchedules(orderId)
}

export { startLogisticsWebSocketService }