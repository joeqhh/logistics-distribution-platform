import axiosInstance from '../utils/axiosInstance'
import type { Order,  OrderQueryParams, OrderListResponse, UpdateOrderStatusParams,ApiResponse } from './types'

// 订单相关API接口
/**
 * 获取商家订单列表
 * @param params 查询参数
 * @returns 订单列表和分页信息
 */
export const getMerchantOrders = async (params?: OrderQueryParams): Promise<ApiResponse<OrderListResponse>> => {
  return axiosInstance.get('/order/merchant', {
    params,
  })
}

/**
 * 获取订单详情
 * @param id 订单ID
 * @returns 订单详情信息
 */
export const getOrderDetail = async (id: string): Promise<Order> => {
  return axiosInstance.get(`/order/${id}`)
}

/**
 * 更新订单状态
 * @param id 订单ID
 * @param params 更新参数
 * @returns 更新结果
 */
export const updateOrderStatus = async (id: string, params: UpdateOrderStatusParams): Promise<Order> => {
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