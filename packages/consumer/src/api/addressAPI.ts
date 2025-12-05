import axiosInstance from './axiosInstance';


// 地址数据类型定义
export interface Address {
  id: number;
  name: string;
  phone: string | null;
  area: string | null; // 格式: "省 市 区"
  detailedAddress: string | null;
  userId: number;
  isDeleted: boolean;
  createTime: string;
  updateTime: string;
}

// 分页参数类型
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页结果类型
export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 地址列表响应类型
export interface AddressListResponse {
  code: number;
  message: string;
  data: PaginationResult<Address>;
}

// 地址详情响应类型
export interface AddressDetailResponse {
  code: number;
  message: string;
  data: Address;
}

// 通用响应类型
export interface ApiResponse {
  code: number;
  message: string;
  data?: any;
}

// 创建地址请求参数
export interface CreateAddressParams {
  name: string;
  phone: string;
  area: string;
  detailedAddress: string;
}

// 更新地址请求参数
export interface UpdateAddressParams {
  name?: string;
  phone?: string;
  area?: string;
  detailedAddress?: string;
}

/**
 * 创建消费者地址
 * @param params 创建地址参数
 * @returns API响应
 */
export const createAddress = async (params: CreateAddressParams) => {
  try {
    // 确保类型为RECEIVER
    const addressData = {
      ...params,
    };
    const response = await axiosInstance.post('/consumer/addresses', addressData);
    return response;
  } catch (error) {
    console.error('创建地址失败:', error);
    throw error;
  }
};

/**
 * 获取消费者所有地址（分页）
 * @param params 分页参数
 * @returns 分页后的地址列表数据
 */
export const getAddresses = async (params: PaginationParams = { page: 1, pageSize: 10 }) => {
  try {
    const response = await axiosInstance.get('/consumer/addresses', {
      params: {
        page: params.page,
        pageSize: params.pageSize
      }
    });
    return response;
  } catch (error) {
    console.error('获取地址列表失败:', error);
    throw error;
  }
};

/**
 * 获取单个地址详情
 * @param addressId 地址ID
 * @returns 地址详情数据
 */
export const getAddressDetail = async (addressId: number) => {
  try {
    const response = await axiosInstance.get(`/consumer/addresses/${addressId}`);
    return response;
  } catch (error) {
    console.error('获取地址详情失败:', error);
    throw error;
  }
};

/**
 * 更新地址
 * @param addressId 地址ID
 * @param params 更新地址参数
 * @returns API响应
 */
export const updateAddress = async (
  addressId: number,
  params: UpdateAddressParams
)=> {
  try {
    const response = await axiosInstance.put(`/consumer/addresses/${addressId}`, params);
    return response;
  } catch (error) {
    console.error('更新地址失败:', error);
    throw error;
  }
};

/**
 * 删除地址
 * @param addressId 地址ID
 * @returns API响应
 */
export const deleteAddress = async (addressId: number) => {
  try {
    const response = await axiosInstance.delete(`/consumer/addresses/${addressId}`);
    return response;
  } catch (error) {
    console.error('删除地址失败:', error);
    throw error;
  }
};

export default {
  createAddress,
  getAddresses,
  getAddressDetail,
  updateAddress,
  deleteAddress,
};