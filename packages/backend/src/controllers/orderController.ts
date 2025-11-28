import { Request, Response } from 'express'
import { randomUUID } from 'crypto'
import {
  createOrder,
  findOrderById,
  findOrdersByConsumerId,
  findOrdersByMerchantId,
  updateOrder,
  findOrderByNumber
} from '../models/Order'
import { createLogistics, findLogisticsByOrderId } from '../models/Logistics'
import { findProductById, updateProductSales } from '../models/Product'
import { OrderStatus, LogisticsStatus } from '../generated/prisma/enums'
import {
  successResponse,
  errorResponse,
  badRequestResponse
} from '../utils/response'
import { AuthRequest } from '../middleware/authCheck'
import { orderCanDeliver } from '../utils/addressUtils'

// 生成随机订单号
const generateOrderNumber = (): string => {
  // 生成13位数字的订单号
  return Math.floor(Math.random() * 9000000000000 + 1000000000000).toString()
}

// 验证订单号是否唯一
const validateUniqueOrderNumber = async (number: string): Promise<boolean> => {
  const existingOrder = await findOrderByNumber(number)
  return !existingOrder
}

// 生成唯一订单号
const generateUniqueOrderNumber = async (): Promise<string> => {
  let number: string
  const isUnique = false

  // 最多尝试10次生成唯一订单号
  for (let i = 0; i < 10; i++) {
    number = generateOrderNumber()
    if (await validateUniqueOrderNumber(number)) {
      return number
    }
  }

  // 如果多次尝试失败，使用时间戳+随机数确保唯一性
  return Date.now().toString() + Math.floor(Math.random() * 1000)
}

// 获取地址的经纬度
const getGeocode = async (address: string): Promise<string> => {
  try {
    // 这里使用模拟数据，实际应该调用高德地图API
    // const response = await axios.get('https://restapi.amap.com/v3/geocode/geo', {
    //   params: {
    //     key: process.env.AMAP_KEY,
    //     address: address
    //   }
    // });
    // const location = response.data.geocodes[0]?.location || '115.801325,28.656317';
    // return location;

    // 返回模拟的经纬度
    return '115.801325,28.656317'
  } catch (error) {
    console.error('获取地址经纬度失败:', error)
    // 返回默认经纬度
    return '115.801325,28.656317'
  }
}

// 创建订单（供product服务调用）
export const createOrderHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, receiveAddressId } = req.body

    if (!productId || !receiveAddressId) {
      return badRequestResponse(res, '缺少必要参数')
    }

    // 获取当前用户ID
    const consumerId = req.user?.id
    if (!consumerId) {
      return errorResponse(res, '用户未登录')
    }

    // 获取商品信息
    const product = await findProductById(productId)
    if (!product) {
      return badRequestResponse(res, '商品不存在')
    }

    // 生成订单数据
    const orderId = randomUUID()
    const orderNumber = await generateUniqueOrderNumber()

    const orderData = {
      id: orderId,
      number: orderNumber,
      consumerId,
      merchantId: product.merchantId,
      productId,
      receiveAddressId
    }

    // 创建订单
    const newOrder = await createOrder(orderData)

    // 获取地址经纬度（这里可以从地址信息中获取具体地址，现在使用默认值）
    const location = '115.801325,28.656317'

    // 创建物流信息
    const logisticsData = {
      orderId: newOrder.id,
      status: LogisticsStatus.WAITDISPATCH,
      describe: '用户已下单，待商家发货',
      location
    }

    const newLogistics = await createLogistics(logisticsData)

    // 更新商品销量
    await updateProductSales(productId)

    return successResponse(
      res,
      { order: newOrder, logistics: newLogistics },
      '订单创建成功'
    )
  } catch (error) {
    console.error('创建订单失败:', error)
    return errorResponse(res, '创建订单失败')
  }
}

// 获取用户订单列表
export const getConsumerOrdersHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const consumerId = req.user?.id
    const { page = 1, limit = 10, orderNumber, status } = req.query

    // 调用带筛选功能的查询方法
    const { orders, total } = await findOrdersByConsumerId(
      consumerId,
      Number(page),
      Number(limit),
      orderNumber as string,
      status as OrderStatus
    )

    return successResponse(res, { orders, total }, '获取订单列表成功')
  } catch (error) {
    console.error('获取用户订单列表失败:', error)
    return errorResponse(res, '获取订单列表失败')
  }
}

// 获取商家订单列表
export const getMerchantOrdersHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const merchantId = req.user?.id
    const { page = 1, limit = 10, orderNumber, status, canDeliver,receiver,productName,phone,createTimeRange } = req.query

    // 调用带筛选功能的查询方法
    const { orders, total } = await findOrdersByMerchantId(
      merchantId,
      Number(page),
      Number(limit),
      orderNumber as string,
      status as OrderStatus,
      receiver as string,
      productName as string,
      phone as string,
      createTimeRange as string[]
    )
    orders.forEach((order) => {
      order.canDeliver = orderCanDeliver(
        order.receiveAddress.location,
        order.merchant.deliveryArea
      )
      delete order.merchant
    })
    
    let resOrders = orders

    if (typeof canDeliver === 'string' && ['true','false'].includes(canDeliver)) {
      resOrders = orders.filter((order) => (order.canDeliver + '' === canDeliver))
    }
    return successResponse(res, { orders:resOrders, total }, '获取订单列表成功')
  } catch (error) {
    console.error('获取商家订单列表失败:', error)
    return errorResponse(res, '获取订单列表失败')
  }
}

// 获取消费者订单详情
export const getConsumerOrderDetailHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params

    // 获取订单信息
    const order = await findOrderById(id)
    if (!order) {
      return badRequestResponse(res, '订单不存在')
    }

    // 验证权限：只有订单所属消费者才能查看
    const consumerId = req.user?.id
    if (order.consumerId !== consumerId) {
      return errorResponse(res, '无权查看此订单')
    }

    // 获取物流信息
    const logistics = await findLogisticsByOrderId(id)

    return successResponse(res, { order, logistics }, '获取订单详情成功')
  } catch (error) {
    console.error('获取消费者订单详情失败:', error)
    return errorResponse(res, '获取订单详情失败')
  }
}

// 获取商家订单详情
export const getMerchantOrderDetailHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params

    // 获取订单信息
    const order = await findOrderById(id)
    if (!order) {
      return badRequestResponse(res, '订单不存在')
    }

    // 验证权限：只有订单所属商家才能查看
    const merchantId = req.user?.id
    if (order.merchantId !== merchantId) {
      return errorResponse(res, '无权查看此订单')
    }

    // 获取物流信息
    const logistics = await findLogisticsByOrderId(id)

    return successResponse(res, { order, logistics }, '获取订单详情成功')
  } catch (error) {
    console.error('获取商家订单详情失败:', error)
    return errorResponse(res, '获取订单详情失败')
  }
}

// 获取订单详情（保留作为兼容，但建议使用单独的消费者和商家接口）
export const getOrderDetailHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params

    // 获取订单信息
    const order = await findOrderById(id)
    if (!order) {
      return badRequestResponse(res, '订单不存在')
    }

    // 验证权限：只有订单所属用户或商家才能查看
    const userId = req.user?.id
    const userType = req.user?.type || 'consumer'

    if (userType === 'consumer' && order.consumerId !== userId) {
      return errorResponse(res, '无权查看此订单')
    }
    if (userType === 'merchant' && order.merchantId !== userId) {
      return errorResponse(res, '无权查看此订单')
    }

    // 获取物流信息
    const logistics = await findLogisticsByOrderId(id)

    return successResponse(res, { order, logistics }, '获取订单详情成功')
  } catch (error) {
    console.error('获取订单详情失败:', error)
    return errorResponse(res, '获取订单详情失败')
  }
}

// 更新订单状态（发货等操作）
export const updateOrderStatusHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return badRequestResponse(res, '缺少状态参数')
    }

    // 获取订单信息
    const order = await findOrderById(id)
    if (!order) {
      return badRequestResponse(res, '订单不存在')
    }

    // 验证权限：只有订单所属商家才能更新状态
    const merchantId = req.user?.id
    if (order.merchantId !== merchantId) {
      return errorResponse(res, '无权操作此订单')
    }

    // 更新订单状态
    const updatedOrder = await updateOrder(id, {
      status: status as OrderStatus
    })

    // 同时更新物流状态
    const logistics = await findLogisticsByOrderId(id)
    if (logistics) {
      // 这里应该调用物流更新方法，但由于模型文件中logistics.ts没有完整显示更新物流状态的方法，暂时注释
      // await updateLogisticsStatus(id, status as LogisticsStatus);
    }

    return successResponse(res, updatedOrder, '订单状态更新成功')
  } catch (error) {
    console.error('更新订单状态失败:', error)
    return errorResponse(res, '更新订单状态失败')
  }
}
