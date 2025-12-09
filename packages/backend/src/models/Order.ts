import { Address ,Product} from '@/generated/prisma/client'
import { prisma } from '../config/prisma'
import { OrderStatus } from '../generated/prisma/enums'
import { LogisticsStatus } from '../generated/prisma/enums'
import { getOrderLatestLogisticsStatus } from './Logistics'
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
  receiveAddress: Address
  senderAddress?: Address
  product?: Product
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
  company?: string
  senderAddressId?: number
  // 注意：status字段已从数据库中移除，应使用updateOrderStatus函数更新订单状态
}
// 根据ID查找订单
export const findOrderById = async (id: string): Promise<any> => {
  const order = await prisma.order.findUnique({
    where: { id, isDeleted: false },
    select: {
      id: true,
      number: true,
      receiptTime: true,
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
          detailedAddress: true,
          location: true
        }
      },
      senderAddress: {
        select: {
          id: true,
          name: true,
          phone: true,
          area: true,
          detailedAddress: true,
          location: true
        }
      }
    }
  });
  
  if (!order) return null;
  
  // 获取最新物流状态并替换
  const latestStatus = await getOrderLatestLogisticsStatus(id);
  
  return {
    ...order,
    status: latestStatus // 只返回从物流记录获取的状态
  };
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
  searchKey?: string,
  status?: OrderStatus,
  createTimeBegin?: string,
  createTimeEnd?: string
): Promise<{ orders: any[]; total: number }> => {
  const skip = (page - 1) * limit
  console.log(createTimeBegin,createTimeEnd)
  // 构建查询条件
  const whereCondition = {
    consumerId,
    isDeleted: false,
    ...(searchKey ? {
      OR: [
        { number: { contains: searchKey } },
        { merchant: { name: { contains: searchKey } } },
        { product: { name: { contains: searchKey } } }
      ]
    } : {}),
    ...((createTimeBegin || createTimeEnd) ? {
      createTime: {
        ...(createTimeBegin ? { gte: new Date(createTimeBegin) } : {}),
        ...(createTimeEnd ? { lte: new Date(createTimeEnd + ' 23:59:59') } : {})
      }
    } : {})
    // 注意：status筛选现在在代码层面进行，不在数据库查询中
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: whereCondition,
      select: {
        id: true,
        number: true,
        receiptTime: true,
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
            cover: true,
            price: true
          }
        },
        merchant: {
          select: {
            name: true,
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

  // 并行获取每个订单的最新物流状态
  const ordersWithLatestStatus = await Promise.all(
    orders.map(async (order) => {
      const latestStatus = await getOrderLatestLogisticsStatus(order.id);
      return {
        ...order,
        status: latestStatus
      };
    })
  );

  // 在代码层面进行status筛选
  let filteredOrders = ordersWithLatestStatus;
  if (status) {
    // if(status === OrderStatus.WAITRECEIVE) {
    //   filteredOrders = ordersWithLatestStatus.filter(order => ([OrderStatus.WAITRECEIVE, OrderStatus.TRANSPORTING, OrderStatus.DELIVERING] as OrderStatus[]).includes(order.status!));
    // } else {
      filteredOrders = ordersWithLatestStatus.filter(order => order.status === status);
    // }
  }

  return { orders: filteredOrders, total }
}

// 根据商家ID查找订单列表（支持筛选）
export const findOrdersByMerchantId = async (
  merchantId: number,
  page: number = 1,
  limit: number = 10,
  orderNumber?: string,
  status?: LogisticsStatus[],
  receiver?: string,
  productName?: string,
  phone?: string,
createTimeBegin?: string,
createTimeEnd?: string,
  company?: string
): Promise<{ orders: any[]; total: number }> => {
  const skip = (page - 1) * limit

  // 构建查询条件
  const whereCondition = {
    merchantId,
    isDeleted: false,
    ...(orderNumber ? { number: { contains: orderNumber } } : {}),
    ...(receiver ? { receiveAddress: { name: { contains: receiver } } } : {}),
    ...(phone ? { receiveAddress: { phone: { contains: phone } } } : {}),
    ...(productName ? { product: { name: { contains: productName } } } : {}),
    ...(company ? {  company: { equals: company } } : {}),
    ...((createTimeBegin || createTimeEnd) ? {
      createTime: {
        ...(createTimeBegin ? { gte: new Date(createTimeBegin) } : {}),
        ...(createTimeEnd ? { lte: new Date(createTimeEnd + ' 23:59:59') } : {})
      }
    } : {})
    // 注意：status筛选现在在代码层面进行，不在数据库查询中
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: whereCondition,
      select: {
        id: true,
        number: true,
        receiptTime: true,
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

  // 并行获取每个订单的最新物流状态
  const ordersWithLatestStatus = await Promise.all(
    orders.map(async (order) => {
      const latestStatus = await getOrderLatestLogisticsStatus(order.id);
      return {
        ...order,
        status: latestStatus
      };
    })
  );
  
  // 在代码层面进行status筛选
  let filteredOrders = ordersWithLatestStatus;
  
  if (status && status.length > 0) {
    filteredOrders = ordersWithLatestStatus.filter(order => order.status && status.includes(order.status));
  }

  return { orders: filteredOrders, total }
}

// 创建新订单
export const createOrder = async (orderData: CreateOrderData): Promise<any> => {
  return await prisma.order.create({
    data: {
      id: orderData.id || randomUUID(),
      number: orderData.number,
      receiptTime: orderData.receiptTime,
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

// 更新订单状态（通过创建新的物流记录实现）
export const updateOrderStatus = async (
  id: string,
  status: LogisticsStatus,
  describe?: string,
  location?: string
): Promise<any | null> => {
  try {
    // 首先检查订单是否存在
    const orderExists = await prisma.order.findUnique({
      where: { id, isDeleted: false },
      select: { id: true }
    });
    
    if (!orderExists) {
      return null;
    }
    
    // 创建新的物流记录
    await prisma.logistics.create({
      data: {
        orderId: id,
        status,
        describe,
        location,
        createTime: new Date()
      }
    });
    
    // 返回更新后的订单信息（会包含最新的物流状态）
    return await findOrderById(id);
  } catch (error) {
    console.error('更新订单状态失败:', error);
    return null;
  }
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

  // 并行获取每个订单的最新物流状态
  const ordersWithLatestStatus = await Promise.all(
    orders.map(async (order) => {
      const latestStatus = await getOrderLatestLogisticsStatus(order.id);
      return {
        ...order,
        status: latestStatus
      };
    })
  );

  return { orders: ordersWithLatestStatus, total }
}
