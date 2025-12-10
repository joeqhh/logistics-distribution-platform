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
import {
  createLogistics,
  CreateLogisticsData,
  findLogisticsByOrderId,
  createLogisticsBatch,
  findExpectDeliveredTimeByOrderId
} from '../models/Logistics'
import { findProductById, updateProductSales } from '../models/Product'
import { OrderStatus, LogisticsStatus } from '../generated/prisma/enums'
import {
  successResponse,
  errorResponse,
  badRequestResponse
} from '../utils/response'
import { AuthRequest } from '../middleware/authCheck'
import { orderCanDeliver } from '../utils/addressUtils'
import { findAddressById, deleteOrder } from '../models'

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
      status: LogisticsStatus.WAITDELIVER,
      describe: '用户已下单，待商家发货',
      location,
      createTime: new Date()
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
    const {
      page = 1,
      limit = 10,
      searchKey,
      status,
      createTimeBegin,
      createTimeEnd
    } = req.query

    // 调用带筛选功能的查询方法
    const { orders, total } = await findOrdersByConsumerId(
      consumerId,
      Number(page),
      Number(limit),
      searchKey as string,
      status as OrderStatus,
      createTimeBegin as string,
      createTimeEnd as string
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
    const {
      page = 1,
      limit = 10,
      orderNumber,
      status,
      canDeliver,
      receiver,
      productName,
      phone,
      createTimeBegin,
      createTimeEnd,
      company
    } = req.query

    const statusArr = ((status as string)?.split(',') ||
      []) as LogisticsStatus[]

    // 调用带筛选功能的查询方法
    const { orders, total } = await findOrdersByMerchantId(
      merchantId,
      Number(page),
      Number(limit),
      orderNumber as string,
      statusArr,
      receiver as string,
      productName as string,
      phone as string,
      (createTimeBegin as string) || undefined,
      (createTimeEnd as string) || undefined,
      company as string
    )
    orders.forEach((order) => {
      order.canDeliver = orderCanDeliver(
        order.receiveAddress.location,
        order.merchant.deliveryArea
      )
      delete order.merchant
    })

    let resOrders = orders

    if (
      typeof canDeliver === 'string' &&
      ['true', 'false'].includes(canDeliver)
    ) {
      resOrders = orders.filter((order) => order.canDeliver + '' === canDeliver)
    }
    return successResponse(
      res,
      { orders: resOrders, total},
      '获取订单列表成功'
    )
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

    // 获取预计送达时间
    const expectDeliveredTime = await findExpectDeliveredTimeByOrderId(id)

    // 为订单添加expectDeliveredTime属性
    const orderWithExpectTime = {
      ...order,
      expectDeliveredTime
    }

    return successResponse(
      res,
      { order: orderWithExpectTime, logistics },
      '获取订单详情成功'
    )
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

    // 获取预计送达时间
    const expectDeliveredTime = await findExpectDeliveredTimeByOrderId(id)

    // 为订单添加expectDeliveredTime属性
    const orderWithExpectTime = {
      ...order,
      expectDeliveredTime
    }

    return successResponse(
      res,
      { order: orderWithExpectTime, logistics },
      '获取订单详情成功'
    )
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

    // 获取预计送达时间
    const expectDeliveredTime = await findExpectDeliveredTimeByOrderId(id)

    // 为订单添加expectDeliveredTime属性
    const orderWithExpectTime = {
      ...order,
      expectDeliveredTime
    }

    return successResponse(
      res,
      { order: orderWithExpectTime, logistics },
      '获取订单详情成功'
    )
  } catch (error) {
    console.error('获取订单详情失败:', error)
    return errorResponse(res, '获取订单详情失败')
  }
}

/**
 *
 * @param req 商家发货
 * @param res
 * @returns
 */
export const deliverOrderHandler = async (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const { addressId, logisticsCompany } = req.body

  // 获取订单信息
  const order = await findOrderById(id)
  if (!order) {
    return badRequestResponse(res, '订单不存在')
  }

  const senderAddress = await findAddressById(addressId)
  if (!senderAddress) {
    return badRequestResponse(res, '发件地址不存在')
  }

  const { location, area, detailedAddress } = order.receiveAddress
  const [city, ...other] = area.split('/')
  let receiveHubPoiId
  let receiveHubLocation
  try {
    const res = await fetch(
      `${process.env.MAP_BASE_URL}/place/text?key=${process.env.MAP_API_KEY}&city=${city}&keywords=${other.join('') + (detailedAddress || '') + '菜鸟驿站'}&type=生活服务|物流速递|物流速递&page=1&offset=1`
    )
    const data = (await res.json()) as Record<string, any>
    if (data.pois.length > 0) {
      receiveHubPoiId = data.pois[0].id
      receiveHubLocation = data.pois[0].location
    }
    // console.log(data)
  } catch (error) {
    console.log(error)
  }
  const result: any = {}
  const logistics: CreateLogisticsData[] = [
    {
      orderId: id,
      status: LogisticsStatus.TRANSPORTING,
      location: senderAddress.location!,
      describe: `商家已发货。`,
      createTime: new Date()
    }
  ]
  let currentTime = new Date()

  try {
    // console.log(hubToReceiveData);

    const originToHubRes = await fetch(
      `${process.env.MAP_BASE_URL}/direction/driving?key=${process.env.MAP_API_KEY}&origin=${senderAddress.location}&destination=${receiveHubLocation}&destination_id=${receiveHubPoiId}&strategy=0`
    )
    const originToHubData: any = await originToHubRes.json()

    logistics.push(
      ...originToHubData.route.paths[0].steps.map(
        (step: any): CreateLogisticsData => {
          currentTime = new Date(
            currentTime.getTime() + parseInt(step.duration) * 1000
          )
          return {
            orderId: id,
            status: LogisticsStatus.TRANSPORTING,
            location: step.polyline,
            describe:
              step.cities && step.cities.length > 0
                ? `快件到达${step.cities[0]?.name ?? ''}${step.cities[0]?.districts[0].name ?? ''},正${step.instruction}。`
                : `正${step.instruction}。`,
            createTime: currentTime
          }
        }
      )
    )
    const hubToReceiveRes = await fetch(
      `${process.env.MAP_BASE_URL}/direction/driving?key=${process.env.MAP_API_KEY}&origin=${receiveHubLocation}&destination=${location}&strategy=0`
    )
    const hubToReceiveData: any = await hubToReceiveRes.json()
    result.hubToReceiveData = hubToReceiveData
    logistics.push(
      ...hubToReceiveData.route.paths[0].steps.map(
        (step: any): CreateLogisticsData => {
          currentTime = new Date(
            currentTime.getTime() + parseInt(step.duration) * 1000
          )
          return {
            orderId: id,
            status: LogisticsStatus.DELIVERING,
            location: step.polyline,
            describe:
              step.cities && step.cities.length > 0
                ? `快件到达${step.cities[0]?.name ?? ''}${step.cities[0]?.districts[0].name ?? ''},正${step.instruction}。`
                : `正${step.instruction}。`,
            createTime: currentTime
          }
        }
      )
    )
    // console.log(originToHubData);
  } catch (error) {
    console.log(error)
  }

  logistics[logistics.length - 1].status = LogisticsStatus.WAITRECEIVE
  logistics[logistics.length - 1].describe = '快件待收货！'

  try {
    const isSuccess = await createLogisticsBatch(logistics)
    await updateOrder(id, {
      company: logisticsCompany,
      senderAddressId: addressId
    })
  } catch (error) {
    console.log(error)
  }

  return successResponse(res, result, '订单发货成功')
}

/**
 * 用户确认收货
 * @param req
 * @param res
 * @returns
 */
export const confirmReceiveHandler = async (
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

    // 验证权限：只有订单所属消费者才能确认收货
    const consumerId = req.user?.id
    if (order.consumerId !== consumerId) {
      return errorResponse(res, '无权操作此订单')
    }

    // 验证订单状态是否为待收货
    if (order.status !== LogisticsStatus.WAITRECEIVE) {
      return badRequestResponse(res, '订单当前状态不允许确认收货')
    }

    const now = new Date()

    // 更新订单的收货时间为当前时间
    const updatedOrder = await updateOrder(id, {
      receiptTime: now
    })

    // 在logistics表内添加一条记录
    await createLogistics({
      orderId: id,
      status: LogisticsStatus.RECEIVED,
      describe: '用户已确认收货！',
      location: order.receiveAddress.location,
      createTime: now
    })

    return successResponse(res, updatedOrder, '确认收货成功')
  } catch (error) {
    console.error('确认收货失败:', error)
    return errorResponse(res, '确认收货失败')
  }
}

/**
 * 商家删除订单
 * @param req
 * @param res
 */
export const merchantDeleteOrder = async (req: AuthRequest, res: Response) => {
  const { id } = req.params

  try {
    // 获取订单信息
    const order = await findOrderById(id)
    if (!order) {
      return badRequestResponse(res, '订单不存在')
    }

    // 验证权限：只有订单所属商家才能删除
    if (order.merchantId !== req.user?.id) {
      return errorResponse(res, '无权操作此订单')
    }

    const canDeliver = orderCanDeliver(
      order.receiveAddress.location,
      order.merchant.deliveryArea
    )
    // 只有不能配送且没发货的订单才能删除
    if (canDeliver || order.status !== OrderStatus.WAITDELIVER) {
      return errorResponse(res, '当前订单不能删除')
    }

    await deleteOrder(id)
    return successResponse(res, null, '删除订单成功')
  } catch (error) {
    console.error('删除订单失败:', error)
    return errorResponse(res, '删除订单失败')
  }
}
