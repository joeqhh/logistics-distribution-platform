import axiosInstance from '@/utils/axiosInstance'
import type { Address, CreateAddressParams, UpdateAddressParams } from './types'

/**
 * 创建消费者地址
 * @param params 创建地址参数
 * @returns API响应
 */
export const createAddress = async (params: CreateAddressParams) => {
  try {
    // 确保类型为RECEIVER
    const addressData = {
      ...params
    }
    const response = await axiosInstance.post(
      '/consumer/addresses',
      addressData
    )
    return response
  } catch (error) {
    console.error('创建地址失败:', error)
    throw error
  }
}

/**
 * 获取消费者所有地址（分页）
 * @param params 分页参数
 * @returns 分页后的地址列表数据
 */
export const getAddresses = async (page: number = 1, pageSize: number = 10) => {
  try {
    const response = await axiosInstance.get('/consumer/addresses', {
      params: {
        page: page,
        pageSize: pageSize
      }
    })
    return response
  } catch (error) {
    console.error('获取地址列表失败:', error)
    throw error
  }
}

/**
 * 获取单个地址详情
 * @param addressId 地址ID
 * @returns 地址详情数据
 */
export const getAddressDetail = async (addressId: number) => {
  try {
    const response = await axiosInstance.get(`/consumer/addresses/${addressId}`)
    return response
  } catch (error) {
    console.error('获取地址详情失败:', error)
    throw error
  }
}

/**
 * 更新地址
 * @param addressId 地址ID
 * @param params 更新地址参数
 * @returns API响应
 */
export const updateAddress = async (
  addressId: number,
  params: UpdateAddressParams
) => {
  try {
    const response = await axiosInstance.put(
      `/consumer/addresses/${addressId}`,
      params
    )
    return response
  } catch (error) {
    console.error('更新地址失败:', error)
    throw error
  }
}

/**
 * 删除地址
 * @param addressId 地址ID
 * @returns API响应
 */
export const deleteAddress = async (addressId: number) => {
  try {
    const response = await axiosInstance.delete(
      `/consumer/addresses/${addressId}`
    )
    return response
  } catch (error) {
    console.error('删除地址失败:', error)
    throw error
  }
}

export default {
  createAddress,
  getAddresses,
  getAddressDetail,
  updateAddress,
  deleteAddress
}
