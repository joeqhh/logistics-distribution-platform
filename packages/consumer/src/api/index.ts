// 导出axios实例，便于在需要时直接使用
import axiosInstance from './axiosInstance';

// 导出商品相关API
import productAPI, {
  type Product,
  type ProductListResponse,
  type ProductDetailResponse,
  getProducts,
  searchProducts,
  getProductDetail,
} from './productAPI';

// 导出地址相关API
import addressAPI, {
  type Address,
  type AddressListResponse,
  type AddressDetailResponse,
  type ApiResponse,
  type CreateAddressParams,
  type UpdateAddressParams,
  createAddress,
  getAddresses,
  getAddressDetail,
  updateAddress,
  deleteAddress,
} from './addressAPI';

// 导出所有API
export {
  // axios实例
  axiosInstance,
  
  // 商品API
  productAPI,
  
  // 商品类型定义
  type Product,
  type ProductListResponse,
  type ProductDetailResponse,
  
  // 商品API函数
  getProducts,
  searchProducts,
  getProductDetail,
  
  // 地址API
  addressAPI,
  
  // 地址类型定义
  type Address,
  type AddressListResponse,
  type AddressDetailResponse,
  type ApiResponse,
  type CreateAddressParams,
  type UpdateAddressParams,
  
  // 地址API函数
  createAddress,
  getAddresses,
  getAddressDetail,
  updateAddress,
  deleteAddress,
};

// 导出默认API对象
export default {
  product: productAPI,
  address: addressAPI,
};