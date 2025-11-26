export interface MerchantInfo {
  id: number;
  name: string | null;
  address?: string | null;
  avatar?: string | null;
  deliveryArea?: any;
  account: string;
}

/**
 * 配送区域响应数据接口
 */
export interface DeliveryAreaResponse {
  deliveryArea: any;
}

/**
 * 更新配送区域的请求参数
 */
export interface UpdateDeliveryAreaParams {
  deliveryArea: any; // 配送区域数据，可以是数组或对象
}