import axiosInstance from '../utils/axiosInstance';
import  {AddressType} from './types/address.types'
import  type {CreateAddressParams,AddressListResponse,AddressDetailResponse,UpdateAddressParams,ApiResponse} from './types'

/**
 * 创建商家地址
 * @param params 创建地址参数
 * @returns API响应
 */
export const createAddress = async (params: CreateAddressParams): Promise<ApiResponse> => {
  // 确保类型为SENDER
  const addressData = {
    ...params,
    type: AddressType.SENDER
  };
  return axiosInstance.post('/merchant/addresses', addressData);
};

/**
 * 获取商家所有地址（分页）
 * @param page 页码
 * @param pageSize 每页大小
 * @returns 分页后的地址列表数据
 */
export const getMerchantAddresses = async (page:number = 1, pageSize:number = 10 ): Promise<AddressListResponse> => {
  return axiosInstance.get('/merchant/addresses', {
    params: {
      page,
      pageSize,
    }
  });
};

/**
 * 获取单个地址详情
 * @param addressId 地址ID
 * @returns 地址详情数据
 */
export const getAddressDetail = async (addressId: number): Promise<AddressDetailResponse> => {
  return axiosInstance.get(`/merchant/addresses/${addressId}`);
};

/**
 * 更新地址
 * @param addressId 地址ID
 * @param params 更新地址参数
 * @returns API响应
 */
export const updateAddress = async (
  params: UpdateAddressParams
): Promise<ApiResponse> => {
  return axiosInstance.put(`/merchant/addresses/${params.id}`, params);
};

/**
 * 删除地址
 * @param addressId 地址ID
 * @returns API响应
 */
export const deleteAddress = async (addressId: number): Promise<ApiResponse> => {
  return axiosInstance.delete(`/merchant/addresses/${addressId}`);
};

export default {
  createAddress,
  getMerchantAddresses,
  getAddressDetail,
  updateAddress,
  deleteAddress,
};