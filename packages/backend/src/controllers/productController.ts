import { Request, Response } from 'express'
import { AuthRequest } from '../middleware/authCheck'
import {
  findProductById,
  findProductsByMerchantId,
  createProduct,
  updateProduct,
  deleteProduct,
  batchUpdateProductStatus,
  batchDeleteProducts,
  getAllProducts,
  searchProducts,
  CreateProductData,
  UpdateProductData,
  updateProductSales
} from '../models/Product'
import {
  successResponse,
  errorResponse,
  badRequestResponse
} from '../utils/response'
import minioClient from '../utils/minioClient'
import path from 'path'
import dotenv from 'dotenv'
import { ProductStatus, OrderStatus, LogisticsStatus } from '../generated/prisma/enums'
import { createOrder } from '../models/Order'
import {  findAddressById} from '../models/Address'
import { createLogistics } from '../models/Logistics'
import { randomUUID } from 'crypto'


dotenv.config()

/**
 * 生成随机文件名
 */
const generateRandomFilename = (originalName: string): string => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 10)
  const ext = path.extname(originalName)
  return `${timestamp}_${randomString}${ext}`
}

/**
 * 创建商品
 */
export const createProductHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { name, price } = req.body
    const files = req.files as Express.Multer.File[]
    const coverFile = files.find((file) => file.fieldname === 'cover')!
    const imagesFiles = files.filter((file) => file.fieldname === 'image')

    if (!name || !price || !coverFile) {
      return badRequestResponse(res, '商品名称、价格和封面图为必填项')
    }

    // 上传封面图
    const coverFilename = generateRandomFilename(
      coverFile.originalname
    )
    await minioClient.uploadFileBuffer(
      coverFile.buffer,
      coverFilename,
      process.env.MINIO_PRODUCT_BUCKET
    )

    // 上传图片数组
    const uploadedImages: string[] = []
    for (const imageFile of imagesFiles) {
      const imageFilename = generateRandomFilename(
       imageFile.originalname
      )
      await minioClient.uploadFileBuffer(
        imageFile.buffer,
        imageFilename,
        process.env.MINIO_PRODUCT_BUCKET
      )
      uploadedImages.push('/' + process.env.MINIO_PRODUCT_BUCKET + '/' + imageFilename)
    }

    const productData: CreateProductData = {
      name,
      price: Number(price),
      merchantId: req.user!.id,
      images: uploadedImages,
      cover: '/' + process.env.MINIO_PRODUCT_BUCKET + '/' + coverFilename
    }

    const product = await createProduct(productData)
    return successResponse(res, product, '商品创建成功')
  } catch (error) {
    console.error('创建商品失败:', error)
    return errorResponse(res, '创建商品失败')
  }
}

/**
 * 获取商家商品列表
 */
export const getMerchantProducts = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const status = req.query.status ? (req.query.status as ProductStatus) : undefined
    const { products, total } = await findProductsByMerchantId(
      req.user!.id,
      page,
      limit,
      status
    )
    return successResponse(
      res,
      {
        list: products,
        total,
        page,
        limit
      },
      '获取商品列表成功'
    )
  } catch (error) {
    console.error('获取商品列表失败:', error)
    return errorResponse(res, '获取商品列表失败')
  }
}

/**
 * 获取商品详情
 */
export const getProductDetail = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const product = await findProductById(id)

    if (!product) {
      return badRequestResponse(res, '商品不存在')
    }

    // 确保只有商品所属商家才能查看详情
    if (product.merchantId !== req.user!.id) {
      return badRequestResponse(res, '无权查看此商品')
    }

    return successResponse(res, product, '获取商品详情成功')
  } catch (error) {
    console.error('获取商品详情失败:', error)
    return errorResponse(res, '获取商品详情失败')
  }
}

/**
 * 更新商品信息
 */
export const updateProductHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const merchantId = req.user?.id

    const product = await findProductById(id)
    if (!product) {
      return badRequestResponse(res, '商品不存在')
    }

    if (product.merchantId !== merchantId) {
      return errorResponse(res, '无权修改此商品')
    }

    const { name, price, images, cover, status } = req.body
    const updateData: any = {}
    if (name) updateData.name = name
    if (price) updateData.price = price
    if (images) updateData.images = images
    if (cover) updateData.cover = cover
    if (status) updateData.status = status

    const updatedProduct = await updateProduct(id, updateData)
    return successResponse(res, updatedProduct, '商品更新成功')
  } catch (error) {
    console.error('更新商品失败:', error)
    return errorResponse(res, '更新商品失败')
  }
}

// 生成随机订单号
const generateOrderNumber = (): string => {
  // 生成13位数字的订单号
  return Math.floor(Math.random() * 9000000000000 + 1000000000000).toString();
};

// 获取地址的经纬度
const getGeocode = async (address: string): Promise<string> => {
  try {
    // 这里使用模拟数据，实际应该调用高德地图API
    // const response = await axios.get('https://restapi.amap.com/v3/geocode/geo', {
    //   params: {
    //     key: process.env.AMAP_KEY,
    //     address: address
    //   }
    // });
    // const location = response.data.geocodes[0]?.location || '115.801325,28.656317';
    // return location;
    
    // 返回模拟的经纬度
    return '115.801325,28.656317';
  } catch (error) {
    console.error('获取地址经纬度失败:', error);
    // 返回默认经纬度
    return '115.801325,28.656317';
  }
};

// 下单方法
export const placeOrderHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, receiveAddressId } = req.body;
    
    if (!productId || !receiveAddressId ) {
      return badRequestResponse(res, '缺少必要参数');
    }
    
    // 获取当前用户ID
    const consumerId = req.user?.id;
    if (!consumerId) {
      return errorResponse(res, '用户未登录');
    }
    
    // 获取商品信息
    const product = await findProductById(productId);
    if (!product) {
      return badRequestResponse(res, '商品不存在');
    }
    
    if (product.status !== ProductStatus.SALE) {
      return badRequestResponse(res, '商品已下架，无法购买');
    }
    
    // 生成订单数据
    const orderId = randomUUID();
    const orderNumber = generateOrderNumber(); // 简化处理，实际应该确保唯一性
    
    const orderData = {
      id: orderId,
      number: orderNumber,
      consumerId,
      merchantId: product.merchantId,
      productId,
      receiveAddressId,
    };
    
    // 创建订单
    const newOrder = await createOrder(orderData);
    
    const address = await findAddressById(receiveAddressId)

    // // 获取地址经纬度（这里可以从地址信息中获取具体地址，现在使用默认值）
    
    // 创建物流信息
    const logisticsData = {
      orderId: newOrder.id,
      status: LogisticsStatus.WAITDELIVER,
      describe: '用户已下单，待商家发货',
      location: address?.location || undefined,
      createTime: new Date()
    };
    
    const newLogistics = await createLogistics(logisticsData);
    
    // 更新商品销量
    await updateProductSales(productId);
    
    return successResponse(res,null, '下单成功');
  } catch (error) {
    console.error('下单失败:', error);
    return errorResponse(res, '下单失败');
  }
}

/**
 * 删除商品（软删除）
 */
export const deleteProductHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    console.log('id',id)
    // 先检查商品是否存在且属于当前商家
    const existingProduct = await findProductById(id)
    if (!existingProduct) {
      return badRequestResponse(res, '商品不存在')
    }

    if (existingProduct.merchantId !== req.user!.id) {
      return badRequestResponse(res, '无权删除此商品')
    }

    const success = await deleteProduct(id)

    if (!success) {
      return badRequestResponse(res, '删除商品失败')
    }

    return successResponse(res, '删除商品成功')
  } catch (error) {
    console.error('删除商品失败:', error)
    return errorResponse(res, '删除商品失败')
  }
}

/**
 * 商品上架
 */
export const putProductOnSale = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    
    // 验证商品是否存在且属于当前商家
    const product = await findProductById(id)
    if (!product) {
      return badRequestResponse(res, '商品不存在')
    }
    
    if (product.merchantId !== req.user!.id) {
      return badRequestResponse(res, '无权操作此商品')
    }
    
    // 更新商品状态为上架
    const updatedProduct = await updateProduct(id, { status: ProductStatus.SALE })
    
    return successResponse(res, updatedProduct, '商品上架成功')
  } catch (error) {
    console.error('商品上架失败:', error)
    return errorResponse(res, '商品上架失败')
  }
}

/**
 * 商品下架
 */
export const putProductOffSale = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    
    // 验证商品是否存在且属于当前商家
    const product = await findProductById(id)
    if (!product) {
      return badRequestResponse(res, '商品不存在')
    }
    
    if (product.merchantId !== req.user!.id) {
      return badRequestResponse(res, '无权操作此商品')
    }
    
    // 更新商品状态为下架
    const updatedProduct = await updateProduct(id, { status: ProductStatus.UNDERCARRIAGE })
    
    return successResponse(res, updatedProduct, '商品下架成功')
  } catch (error) {
      console.error('商品下架失败:', error)
      return errorResponse(res, '商品下架失败')
    }
  }

/**
 * 批量上架商品
 */
export const batchPutProductsOnSale = async (req: AuthRequest, res: Response) => {
  try {
    const merchantId = req.user!.id
    const { ids } = req.body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return badRequestResponse(res, '请选择要上架的商品')
    }

    const success = await batchUpdateProductStatus(
      ids,
      merchantId,
      ProductStatus.SALE
    )

    if (!success) {
      return badRequestResponse(res, '部分商品不存在或无权限操作')
    }

    return successResponse(res, '批量上架成功')
  } catch (error) {
    return errorResponse(res, '批量上架失败，请重试')
  }
}

/**
 * 批量下架商品
 */
export const batchPutProductsOffSale = async (req: AuthRequest, res: Response) => {
  try {
    const merchantId = req.user!.id
    const { ids } = req.body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return badRequestResponse(res, '请选择要下架的商品')
    }

    const success = await batchUpdateProductStatus(
      ids,
      merchantId,
      ProductStatus.UNDERCARRIAGE
    )

    if (!success) {
      return badRequestResponse(res, '部分商品不存在或无权限操作')
    }

    return successResponse(res, '批量下架成功')
  } catch (error) {
    return errorResponse(res, '批量下架失败，请重试')
  }
}

/**
 * 批量删除商品
 */
export const batchDeleteProductsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const merchantId = req.user!.id
    const { ids } = req.body
    console.log('haha',ids)
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return badRequestResponse(res, '请选择要删除的商品')
    }

    const success = await batchDeleteProducts(ids, merchantId)

    if (!success) {
      return badRequestResponse(res, '部分商品不存在或无权限操作')
    }

    return successResponse(res, '批量删除成功')
  } catch (error) {
    return errorResponse(res, '批量删除失败，请重试')
  }
}

/**
 * 公开获取商品列表（不需要登录）
 * 只返回is_deleted == 0和status == SALE的商品
 */
export const getPublicProducts = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    
    const { products, total } = await getAllProducts(page, limit)
    return successResponse(res, { products, total }, '获取商品列表成功')
  } catch (error) {
    console.error('获取商品列表失败:', error)
    return errorResponse(res, '获取商品列表失败')
  }
}

/**
 * 公开搜索商品（不需要登录）
 * 只返回is_deleted == 0和status == SALE的商品
 */
export const publicSearchProducts = async (req: Request, res: Response) => {
  try {
    const keyword = req.query.keyword as string || ''
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    
    if (!keyword.trim()) {
      return badRequestResponse(res, '搜索关键词不能为空')
    }
    
    const { products, total } = await searchProducts(keyword, page, limit)
    return successResponse(res, { products, total }, '搜索商品成功')
  } catch (error) {
    console.error('搜索商品失败:', error)
    return errorResponse(res, '搜索商品失败')
  }
}

/**
 * 公开获取商品详情（不需要登录）
 * 只返回is_deleted == 0和status == SALE的商品
 */
export const getPublicProductDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const product = await findProductById(id)
    
    if (!product || product.status !== 'SALE') {
      return badRequestResponse(res, '商品不存在或已下架')
    }
    
    return successResponse(res, product, '获取商品详情成功')
  } catch (error) {
    console.error('获取商品详情失败:', error)
    return errorResponse(res, '获取商品详情失败')
  }
}
