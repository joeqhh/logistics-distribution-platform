
// 地址类型枚举
export enum AddressType {
  RECEIVER = 'RECEIVER',
  SENDER = 'SENDER'
}

// 地址数据类型定义
export interface Address {
  id: number;
  name: string;
  phone: string;
  area: string; // 格式: "省 市 区"
  detailedAddress: string | null;
  userId: number;
  isDeleted: boolean;
  createTime: string;
  updateTime: string;
  type: AddressType;
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


// 创建地址请求参数
export interface CreateAddressParams {
  name: string;
  phone: string;
  area: string;
  detailedAddress: string;
  type: AddressType;
}

// 更新地址请求参数
export interface UpdateAddressParams extends Partial<CreateAddressParams>{
  id: number
}