import axiosInstance from '../utils/axiosInstance'
import type {
  Order,
  OrderQueryParams,
  OrderListResponse,
  UpdateOrderStatusParams,
  ApiResponse,
  Logistics
} from './types'

export const logisticsCompaniyLogos = {
  顺丰速运: '/object/platform-avatar/shunfeng.png',
  中通快递: '/object/platform-avatar/zhongtong.png',
  圆通速递: '/object/platform-avatar/yuantong.png',
  申通快递: '/object/platform-avatar/shentong.png',
  韵达快递: '/object/platform-avatar/yunda.jpg',
  京东快递: '/object/platform-avatar/jingdong.png',
  邮政EMS: '/object/platform-avatar/ems.png',
  中国邮政快递包裹: '/object/platform-avatar/youzheng.png',
  百世快递: '/object/platform-avatar/baishi.png',
  德邦快递: '/object/platform-avatar/debang.png',
  极兔速递: '/object/platform-avatar/jitu.jpg',
  天天快递: '/object/platform-avatar/tiantian.png',
  苏宁物流: '/object/platform-avatar/suning.jpg'
} as const

export const logisticsCompanies = Object.keys(logisticsCompaniyLogos)

export type logisticsCompany = (typeof logisticsCompanies)[number]

// 订单相关API接口
/**
 * 获取商家订单列表
 * @param params 查询参数
 * @returns 订单列表和分页信息
 */
export const getMerchantOrders = async (
  params?: OrderQueryParams
): Promise<ApiResponse<OrderListResponse>> => {
  return axiosInstance.get('/order/merchant', {
    params
  })
}

/**
 * 获取订单详情
 * @param id 订单ID
 * @returns 订单详情信息
 */
export const getOrderDetail = async (
  id: string
): Promise<ApiResponse<{ logistics: Logistics[]; order: Order }>> => {
  return axiosInstance.get(`/order/merchant/${id}`)
}

/**
 * 更新订单状态
 * @param id 订单ID
 * @param params 更新参数
 * @returns 更新结果
 */
export const updateOrderStatus = async (
  id: string,
  params: UpdateOrderStatusParams
): Promise<Order> => {
  return axiosInstance.put(`/order/${id}/status`, params)
}

/**
 * 创建订单
 * @param params 订单创建参数
 * @returns 创建的订单信息
 */
export const createOrder = async (params: any): Promise<Order> => {
  return axiosInstance.post('/order', params)
}

/**
 * 删除订单
 * @param 订单id 
 * @returns 
 */
export const deleteOrder = async (id: string) => {
  return axiosInstance.post(`/order/${id}/delete`)
}

/**
 * 订单发货
 * @param id
 * @param addressId
 * @returns
 */
export const merchantDeliverOrder = async (
  id: string,
  addressId: number,
  logisticsCompany: logisticsCompany
): Promise<any> => {
  return axiosInstance.post(`/order/${id}/deliver`, {
    addressId,
    logisticsCompany
  })
}
