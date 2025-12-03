export * from './product.types'
export * from './address.types'
export * from './merchant.types'
export * from './order.types'
export * from './logistics.types'

export interface ApiResponse<T> {
  code: number
  message: string
  data?: T
}
