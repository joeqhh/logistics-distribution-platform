import axiosInstance from '../utils/axiosInstance'
import type {
  UpdateDeliveryAreaParams,
  MerchantInfo,
  DeliveryAreaResponse
} from './types'

/**
 * 更新商家配送区域
 * @param params 包含配送区域数据的参数对象
 * @returns 更新结果
 */
export const updateMerchantDeliveryArea = async (
  params: UpdateDeliveryAreaParams
) => {
  return axiosInstance.put('/merchant/delivery-area', params)
}

/**
 * 获取商家信息
 * @returns 商家详细信息
 */
export const getMerchantInfo = async (): Promise<{
  success: boolean
  data: MerchantInfo
}> => {
  return axiosInstance.get('/merchant/info')
}

/**
 * 获取商家配送区域
 * @returns 商家配送区域信息
 */
export const getMerchantDeliveryArea = async (): Promise<{
  success: boolean
  data: DeliveryAreaResponse
}> => {
  return axiosInstance.get('/merchant/delivery-area')
}
