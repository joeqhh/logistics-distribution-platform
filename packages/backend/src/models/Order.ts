import { prisma } from '../config/prisma'
import { OrderStatus } from '../generated/prisma/enums'
import { randomUUID } from 'crypto';


export interface Order {
  id: string
  number: string
  receiptTime?: Date | null
  status: OrderStatus
  company?: string | null
  isDeleted: boolean
  createTime: Date
  updateTime: Date
  consumerId: number
  merchantId: number
}

export interface CreateOrderData {
  id?: string
  number: string
  receiptTime?: Date
  status?: OrderStatus
  company?: string
  consumerId: number
  merchantId: number
}

export interface UpdateOrderData {
  receiptTime?: Date
  status?: OrderStatus
  company?: string
}

// 根据ID查找订单
export const findOrderById = async (id: string): Promise<Order | null> => {
  return await prisma.order.findUnique({
    where: { id, isDeleted: false },
    select: {
      id: true,
      number: true,
      receiptTime: true,
      status: true,
      company: true,
      isDeleted: true,
      createTime: true,
      updateTime: true,
      consumerId: true,
      merchantId: true
    }
  })
}

// 根据订单号查找订单
export const findOrderByNumber = async (number: string): Promise<Order | null> => {
  return await prisma.order.findFirst({
    where: { number, isDeleted: false },
    select: {
      id: true,
      number: true,
      receiptTime: true,
      status: true,
      company: true,
      isDeleted: true,
      createTime: true,
      updateTime: true,
      consumerId: true,
      merchantId: true
    }
  })
}

// 根据消费者ID查找订单列表
export const findOrdersByConsumerId = async (consumerId: number, page: number = 1, limit: number = 10): Promise<{ orders: Order[], total: number }> => {
  const skip = (page - 1) * limit
  
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { consumerId, isDeleted: false },
      select: {
        id: true,
        number: true,
        receiptTime: true,
        status: true,
        company: true,
        isDeleted: true,
        createTime: true,
        updateTime: true,
        consumerId: true,
        merchantId: true
      },
      skip,
      take: limit,
      orderBy: { createTime: 'desc' }
    }),
    prisma.order.count({ where: { consumerId, isDeleted: false } })
  ])
  
  return { orders, total }
}

// 根据商家ID查找订单列表
export const findOrdersByMerchantId = async (merchantId: number, page: number = 1, limit: number = 10): Promise<{ orders: Order[], total: number }> => {
  const skip = (page - 1) * limit
  
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { merchantId, isDeleted: false },
      select: {
        id: true,
        number: true,
        receiptTime: true,
        status: true,
        company: true,
        isDeleted: true,
        createTime: true,
        updateTime: true,
        consumerId: true,
        merchantId: true
      },
      skip,
      take: limit,
      orderBy: { createTime: 'desc' }
    }),
    prisma.order.count({ where: { merchantId, isDeleted: false } })
  ])
  
  return { orders, total }
}

// 创建新订单
export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
  return await prisma.order.create({
    data: {
      id: randomUUID(),
      number: orderData.number,
      receiptTime: orderData.receiptTime,
      status: orderData.status || OrderStatus.PENDING,
      company: orderData.company,
      consumerId: orderData.consumerId,
      merchantId: orderData.merchantId
    },
    select: {
      id: true,
      number: true,
      receiptTime: true,
      status: true,
      company: true,
      isDeleted: true,
      createTime: true,
      updateTime: true,
      consumerId: true,
      merchantId: true
    }
  })
}

// 更新订单信息
export const updateOrder = async (id: string, orderData: UpdateOrderData): Promise<Order | null> => {
  return await prisma.order.update({
    where: { id, isDeleted: false },
    data: orderData,
    select: {
      id: true,
      number: true,
      receiptTime: true,
      status: true,
      company: true,
      isDeleted: true,
      createTime: true,
      updateTime: true,
      consumerId: true,
      merchantId: true
    }
  })
}

// 更新订单状态
export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order | null> => {
  return await prisma.order.update({
    where: { id, isDeleted: false },
    data: { status },
    select: {
      id: true,
      number: true,
      receiptTime: true,
      status: true,
      company: true,
      isDeleted: true,
      createTime: true,
      updateTime: true,
      consumerId: true,
      merchantId: true
    }
  })
}

// 删除订单（软删除）
export const deleteOrder = async (id: string): Promise<boolean> => {
  try {
    await prisma.order.update({
      where: { id },
      data: { isDeleted: true }
    })
    return true
  } catch (error) {
    return false
  }
}

// 获取所有订单（分页）
export const getAllOrders = async (page: number = 1, limit: number = 10): Promise<{ orders: Order[], total: number }> => {
  const skip = (page - 1) * limit
  
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        number: true,
        receiptTime: true,
        status: true,
        company: true,
        isDeleted: true,
        createTime: true,
        updateTime: true,
        consumerId: true,
        merchantId: true
      },
      skip,
      take: limit,
      orderBy: { createTime: 'desc' }
    }),
    prisma.order.count({ where: { isDeleted: false } })
  ])
  
  return { orders, total }
}