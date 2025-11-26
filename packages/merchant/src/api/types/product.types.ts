// 从backend包导入类型定义
export type { Product } from '@logistics-distribution-platform/backend/src/models/Product';


/**
 * 创建商品的请求参数
 */
export interface CreateProductParams {
  name: string;
  price: number;
  introduction?: string;
  cover: File;
  images?: File[];
}