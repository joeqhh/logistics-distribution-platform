import { prisma } from '../config/prisma'
import { OrderStatus } from '../generated/prisma/enums'
import { randomUUID } from 'crypto'

export { OrderStatus }

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
  productId: string
  receiveAddressId: number
  senderAddressId?: number
}

export interface CreateOrderData {
  id?: string
  number: string
  receiptTime?: Date
  company?: string
  consumerId: number
  merchantId: number
  productId: string
  receiveAddressId: number
  senderAddressId?: number
}

export interface UpdateOrderData {
  receiptTime?: Date
  status?: OrderStatus
  company?: string
}

// 根据ID查找订单
export const findOrderById = async (id: string): Promise<any | null> => {
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
      merchantId: true,
      productId: true,
      receiveAddressId: true,
      senderAddressId: true,
      product: {
        select: {
          id: true,
          name: true,
          cover: true
        }
      },
      receiveAddress: {
        select: {
          id: true,
          name: true,
          phone: true,
          area: true,
          detailedAddress: true
        }
      },
      senderAddress: {
        select: {
          id: true,
          name: true,
          phone: true,
          area: true,
          detailedAddress: true
        }
      }
    }
  })
}

// 根据订单号查找订单
export const findOrderByNumber = async (
  number: string
): Promise<any | null> => {
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
      merchantId: true,
      productId: true,
      product: {
        select: {
          id: true,
          name: true,
          cover: true
        }
      }
    }
  })
}

// 根据消费者ID查找订单列表（支持筛选）
export const findOrdersByConsumerId = async (
  consumerId: number,
  page: number = 1,
  limit: number = 10,
  orderNumber?: string,
  status?: OrderStatus
): Promise<{ orders: any[]; total: number }> => {
  const skip = (page - 1) * limit

  // 构建查询条件
  const whereCondition = {
    consumerId,
    isDeleted: false,
    ...(orderNumber ? { number: { contains: orderNumber } } : {}),
    ...(status ? { status } : {})
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: whereCondition,
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
        merchantId: true,
        productId: true,
        receiveAddressId: true,
        senderAddressId: true,
        product: {
          select: {
            id: true,
            name: true,
            cover: true
          }
        },
        receiveAddress: {
          select: {
            id: true,
            name: true,
            phone: true,
            area: true,
            detailedAddress: true
          }
        },
        senderAddress: {
          select: {
            id: true,
            name: true,
            phone: true,
            area: true,
            detailedAddress: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createTime: 'desc' }
    }),
    prisma.order.count({ where: whereCondition })
  ])

  return { orders, total }
}

// 根据商家ID查找订单列表（支持筛选）
export const findOrdersByMerchantId = async (
  merchantId: number,
  page: number = 1,
  limit: number = 10,
  orderNumber?: string,
  status?: OrderStatus,
  receiver?: string,
  productName?: string,
  phone?: string,
  createTimeRange?: string[]
): Promise<{ orders: any[]; total: number }> => {
  const skip = (page - 1) * limit

  // 构建查询条件
  const whereCondition = {
    merchantId,
    isDeleted: false,
    ...(orderNumber ? { number: { contains: orderNumber } } : {}),
    ...(status ? { status } : {}),
    ...(receiver ? { receiveAddress: { name: { contains: receiver } } } : {}),
    ...(phone ? { receiveAddress: { phone: { contains: phone } } } : {}),
    ...(productName ? { product: { name: { contains: productName } } } : {}),
    ...(createTimeRange
      ? {
          createTime: {
            gte: new Date(createTimeRange[0]),
            lte: new Date(createTimeRange[1])
          }
        }
      : {})
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: whereCondition,
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
        merchant: {
          select: {
            deliveryArea: true
          }
        },
        productId: true,
        receiveAddressId: true,
        senderAddressId: true,
        product: {
          select: {
            id: true,
            name: true,
            cover: true,
            price: true
          }
        },
        receiveAddress: {
          select: {
            id: true,
            name: true,
            phone: true,
            area: true,
            location: true,
            detailedAddress: true
          }
        }
        // senderAddress: {
        //   select: {
        //     id: true,
        //     name: true,
        //     phone: true,
        //     area: true,
        //     detailedAddress: true
        //   }
        // }
      },
      skip,
      take: limit,
      orderBy: { createTime: 'desc' }
    }),
    prisma.order.count({ where: whereCondition })
  ])

  return { orders, total }
}

// 创建新订单
export const createOrder = async (orderData: CreateOrderData): Promise<any> => {
  return await prisma.order.create({
    data: {
      id: orderData.id || randomUUID(),
      number: orderData.number,
      receiptTime: orderData.receiptTime,
      status: OrderStatus.WAITDISPATCH,
      receiveAddressId: orderData.receiveAddressId,
      ...(orderData.senderAddressId && {
        senderAddressId: orderData.senderAddressId
      }),
      company: orderData.company,
      consumerId: orderData.consumerId,
      merchantId: orderData.merchantId,
      productId: orderData.productId
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
      merchantId: true,
      productId: true,
      product: {
        select: {
          id: true,
          name: true,
          cover: true
        }
      }
    }
  })
}

// 更新订单信息
export const updateOrder = async (
  id: string,
  orderData: UpdateOrderData
): Promise<any | null> => {
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
      merchantId: true,
      productId: true,
      product: {
        select: {
          id: true,
          name: true,
          cover: true
        }
      }
    }
  })
}

// 更新订单状态
export const updateOrderStatus = async (
  id: string,
  status: OrderStatus
): Promise<any | null> => {
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
      merchantId: true,
      productId: true,
      product: {
        select: {
          id: true,
          name: true,
          cover: true
        }
      }
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
export const getAllOrders = async (
  page: number = 1,
  limit: number = 10
): Promise<{ orders: any[]; total: number }> => {
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
        merchantId: true,
        productId: true,
        product: {
          select: {
            id: true,
            name: true,
            cover: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createTime: 'desc' }
    }),
    prisma.order.count({ where: { isDeleted: false } })
  ])

  return { orders, total }
}
