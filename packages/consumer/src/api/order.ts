import axiosInstance from '@/utils/axiosInstance'
import type { Order, CreateOrderParams, UpdateOrderStatusParams, OrderQueryParams } from './types'

/**
 * 创建订单
 * @param params 创建订单参数
 * @returns API响应
 */
export const createOrder = async (params: CreateOrderParams) => {
  try {
    const response = await axiosInstance.post('/orders', params)
    return response
  } catch (error) {
    console.error('创建订单失败:', error)
    throw error
  }
}

/**
 * 获取消费者订单列表（分页）
 * @param params 查询参数
 * @returns 分页后的订单列表数据
 */
export const getOrders = async (page: number = 1, pageSize: number = 10, params?: OrderQueryParams) => {
  try {
    const response = await axiosInstance.get('/order/consumer', {
      params: {
        page,
        pageSize,
        ...params
      }
    })
    return response
  } catch (error) {
    console.error('获取订单列表失败:', error)
    throw error
  }
}

/**
 * 获取单个订单详情
 * @param orderId 订单ID
 * @returns 订单详情数据
 */
export const getOrderDetail = async (orderId: string) => {
  try {
    const response = await axiosInstance.get(`/order/consumer/${orderId}`)
    return response
  } catch (error) {
    console.error('获取订单详情失败:', error)
    throw error
  }
}


/**
 * 确认收货
 * @param orderId 订单ID
 * @returns API响应
 */
export const receiveOrder = async (
  orderId: number,
) => {
  try {
    const response = await axiosInstance.post(`/order/${orderId}/confirm`)
    return response
  } catch (error) {
    console.error('确认收货失败:', error)
    throw error
  }
}