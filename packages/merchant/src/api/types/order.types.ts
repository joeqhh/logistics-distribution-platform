// 从backend包导入类型定义
import type { Order } from '@logistics-distribution-platform/backend/src/models/Order'
import type { OrderStatus } from '@logistics-distribution-platform/backend/src/models/order'
// export type { Logistics } from '@logistics-distribution-platform/backend/src/models/Logistics'
// export type { LogisticsStatus } from '@logistics-distribution-platform/backend/src/generated/prisma/enums'
export { Order }

/**
 * 创建订单的请求参数
 */
export interface CreateOrderParams {
  merchantId: number
  consumerId: number
  addressId: number
  productId: number
  quantity: number
  receiptTime?: Date
  company?: string
}

/**
 * 订单查询参数
 */
export interface OrderQueryParams {
  page?: number
  limit?: number
  orderNumber?: string
  status?: OrderStatus
}

/**
 * 更新订单状态的请求参数
 */
export interface UpdateOrderStatusParams {
  status: OrderStatus
}

/**
 * 订单列表响应
 */
export interface OrderListResponse {
  orders: Order[]
  total: number
}
