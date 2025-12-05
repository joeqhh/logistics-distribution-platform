import axiosInstance from '../utils/axiosInstance'
import type { Product } from './types'

// 商品相关API接口
/**
 * 创建商品
 * @param formData 包含商品信息和文件的FormData对象
 * @returns 创建的商品信息
 */
export const createProduct = async (formData: FormData): Promise<Product> => {
  return axiosInstance.post('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取商家商品列表
 * @param page 页码
 * @param limit 每页数量
 * @returns 商品列表和分页信息
 */
export const getMerchantProducts = async (params: {
  page?: number
  limit?: number
  status?: string
  name?: string
  id?: string
  priceBegin?: number
  priceEnd?: number
  salesBegin?: number
  salesEnd?: number
  createTimeBegin?: string
  createTimeEnd?: string
}) => {
  return axiosInstance.get('/products', {
    params
  })
}

/**
 * 获取商品详情
 * @param id 商品ID
 * @returns 商品详情信息
 */
export const getProductDetail = async (id: string): Promise<Product> => {
  return axiosInstance.get(`/products/${id}`)
}

/**
 * 更新商品
 * @param id 商品ID
 * @param formData 包含更新信息和文件的FormData对象
 * @returns 更新后的商品信息
 */
export const updateProduct = async (
  id: string,
  formData: FormData
): Promise<Product> => {
  return axiosInstance.put(`/products/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 删除商品
 * @param id 商品ID
 * @returns 删除结果
 */
export const deleteProduct = async (id: string) => {
  return axiosInstance.delete(`/products/single/${id}`)
}

/**
 * 商品上架
 * @param id 商品ID
 * @returns 上架结果
 */
export const putProductOnSale = async (id: string) => {
  return axiosInstance.put(`/products/single/${id}/on-sale`)
}

/**
 * 商品下架
 * @param id 商品ID
 * @returns 下架结果
 */
export const putProductOffSale = async (id: string) => {
  return axiosInstance.put(`/products/single/${id}/off-sale`)
}

/**
 * 批量上架商品
 * @param ids 商品ID数组
 * @returns 批量上架结果
 */
export const batchPutProductsOnSale = async (ids: string[]) => {
  return axiosInstance.put('/products/batch/on-sale', { ids })
}

/**
 * 批量下架商品
 * @param ids 商品ID数组
 * @returns 批量下架结果
 */
export const batchPutProductsOffSale = async (ids: string[]) => {
  return axiosInstance.put('/products/batch/off-sale', { ids })
}

/**
 * 批量删除商品
 * @param ids 商品ID数组
 * @returns 批量删除结果
 */
export const batchDeleteProducts = async (ids: string[]) => {
  return axiosInstance.delete('/products/batch', { data: { ids } })
}
