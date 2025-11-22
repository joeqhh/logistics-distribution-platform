import { prisma } from '../config/prisma'
import { LogisticsStatus } from '../generated/prisma/enums'

export interface Logistics {
  id: number
  orderId: string
  status: LogisticsStatus
  describe?: string | null
  location?: string | null
  isDeleted: boolean
  createTime: Date
  updateTime: Date
}

export interface CreateLogisticsData {
  orderId: string
  status?: LogisticsStatus
  describe?: string
  location?: string
}

export interface UpdateLogisticsData {
  status?: LogisticsStatus
  describe?: string
  location?: string
}

// 根据ID查找物流信息
export const findLogisticsById = async (id: number): Promise<Logistics | null> => {
  return await prisma.logistics.findUnique({
    where: { id, isDeleted: false },
    select: {
      id: true,
      orderId: true,
      status: true,
      describe: true,
      location: true,
      isDeleted: true,
      createTime: true,
      updateTime: true
    }
  })
}

// 根据订单ID查找物流信息
export const findLogisticsByOrderId = async (orderId: string): Promise<Logistics | null> => {
  return await prisma.logistics.findFirst({
    where: { orderId, isDeleted: false },
    select: {
      id: true,
      orderId: true,
      status: true,
      describe: true,
      location: true,
      isDeleted: true,
      createTime: true,
      updateTime: true
    }
  })
}

// 创建新物流信息
export const createLogistics = async (logisticsData: CreateLogisticsData): Promise<Logistics> => {
  return await prisma.logistics.create({
    data: {
      orderId: logisticsData.orderId,
      status: logisticsData.status || LogisticsStatus.PENDING,
      describe: logisticsData.describe,
      location: logisticsData.location
    },
    select: {
      id: true,
      orderId: true,
      status: true,
      describe: true,
      location: true,
      isDeleted: true,
      createTime: true,
      updateTime: true
    }
  })
}

// 更新物流信息
export const updateLogistics = async (id: number, logisticsData: UpdateLogisticsData): Promise<Logistics | null> => {
  return await prisma.logistics.update({
    where: { id, isDeleted: false },
    data: logisticsData,
    select: {
      id: true,
      orderId: true,
      status: true,
      describe: true,
      location: true,
      isDeleted: true,
      createTime: true,
      updateTime: true
    }
  })
}

// 更新订单物流状态
export const updateLogisticsStatus = async (orderId: string, status: LogisticsStatus): Promise<Logistics | null> => {
  return await prisma.logistics.update({
    where: { orderId, isDeleted: false },
    data: { status },
    select: {
      id: true,
      orderId: true,
      status: true,
      describe: true,
      location: true,
      isDeleted: true,
      createTime: true,
      updateTime: true
    }
  })
}

// 删除物流信息（软删除）
export const deleteLogistics = async (id: number): Promise<boolean> => {
  try {
    await prisma.logistics.update({
      where: { id },
      data: { isDeleted: true }
    })
    return true
  } catch (error) {
    return false
  }
}

// 获取所有物流信息（分页）
export const getAllLogistics = async (page: number = 1, limit: number = 10): Promise<{ logistics: Logistics[], total: number }> => {
  const skip = (page - 1) * limit
  
  const [logistics, total] = await Promise.all([
    prisma.logistics.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        orderId: true,
        status: true,
        describe: true,
        location: true,
        isDeleted: true,
        createTime: true,
        updateTime: true
      },
      skip,
      take: limit,
      orderBy: { id: 'desc' }
    }),
    prisma.logistics.count({ where: { isDeleted: false } })
  ])
  
  return { logistics, total }
}