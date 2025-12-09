import axiosInstance from '@/utils/axiosInstance'

// // 商品数据类型定义
// export interface Product {
//   id: string;
//   name: string;
//   price: number; // 后端是Decimal类型，前端用number处理
//   merchantId: number;
//   sales: number;
//   images?: string[];
//   cover: string;
//   isDeleted: boolean;
//   status: string; // 'SALE' | 'OFF_SALE'
//   createTime: string;
//   updateTime: string;
// }

// // 商品列表响应类型
// export interface ProductListResponse {
//   code: number;
//   message: string;
//   data: any
// }

// // 商品详情响应类型
// export interface ProductDetailResponse {
//   code: number;
//   message: string;
//   data: any;
// }

/**
 * 获取商品列表
 * @param page 页码
 * @param limit 每页数量
 * @returns 商品列表数据
 */
export const getProducts = async (page: number = 1, limit: number = 100) => {
  try {
    // axiosInstance返回的已经是response.data
    const response = await axiosInstance.get('/public/products', {
      params: { page, limit }
    })
    return response
  } catch (error) {
    console.error('获取商品列表失败:', error)
    throw error
  }
}

/**
 * 搜索商品
 * @param keyword 搜索关键词
 * @param page 页码
 * @param limit 每页数量
 * @returns 搜索结果数据
 */
export const searchProducts = async (
  keyword: string,
  page: number = 1,
  limit: number = 10
) => {
  try {
    // axiosInstance返回的已经是response.data
    const response = await axiosInstance.get('/public/products/search', {
      params: { keyword, page, limit }
    })
    return response
  } catch (error) {
    console.error('搜索商品失败:', error)
    throw error
  }
}

/**
 * 获取商品详情
 * @param productId 商品ID
 * @returns 商品详情数据
 */
export const getProductDetail = async (productId: string) => {
  try {
    const response = await axiosInstance.get(`/public/products/${productId}`)
    return response
  } catch (error) {
    console.error('获取商品详情失败:', error)
    throw error
  }
}


/**
 * 用户购买商品
 * @param productId 
 * @param receiveAddressId 
 * @returns 
 */
export const buyProduct = async (productId: string,receiveAddressId: string,productNum: number) => {
  try {
    const response = await axiosInstance.post('/product/order',{ productId, receiveAddressId, productNum   })
    return response
  } catch (error) {
    console.error('用户购买商品失败:', error)
    throw error
  }
}