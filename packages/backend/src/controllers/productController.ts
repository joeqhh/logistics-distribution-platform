import { Request, Response } from 'express'
import { AuthRequest } from '../middleware/authCheck'
import {
  findProductById,
  findProductsByMerchantId,
  createProduct,
  updateProduct,
  deleteProduct,
  CreateProductData,
  UpdateProductData
} from '../models/Product'
import {
  successResponse,
  errorResponse,
  badRequestResponse
} from '../utils/response'
import minioClient from '../utils/minioClient'
import path from 'path'
import dotenv from 'dotenv'

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
    const { name, price, introduction } = req.body
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
      introduction,
      merchantId: req.user!.id,
      images: JSON.stringify(uploadedImages),
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

    const { products, total } = await findProductsByMerchantId(
      req.user!.id,
      page,
      limit
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
//   try {
//     const { id } = req.params
//     const { name, price, introduction } = req.body
//     const coverFile = req.file || req.files?.cover
//     const imagesFiles = Array.isArray(req.files?.images)
//       ? req.files.images
//       : null

//     // 先检查商品是否存在且属于当前商家
//     const existingProduct = await findProductById(id)
//     if (!existingProduct) {
//       return badRequestResponse(res, '商品不存在')
//     }

//     if (existingProduct.merchantId !== req.user!.id) {
//       return badRequestResponse(res, '无权修改此商品')
//     }

//     const updateData: UpdateProductData = {
//       name,
//       price: price ? Number(price) : undefined,
//       introduction
//     }

//     // 如果有新的封面图，上传并更新
//     if (coverFile) {
//       const coverFilename = generateRandomFilename(
//         coverFile.name || coverFile.originalname
//       )
//       await minioClient.uploadFileBuffer(
//         coverFile.buffer,
//         coverFilename,
//         coverFile.mimetype || coverFile.type
//       )
//       updateData.cover = coverFilename
//     }

//     // 如果有新的图片数组，上传并更新
//     if (imagesFiles !== null) {
//       const uploadedImages: string[] = []
//       for (const imageFile of imagesFiles) {
//         const imageFilename = generateRandomFilename(
//           imageFile.name || imageFile.originalname
//         )
//         await minioClient.uploadFileBuffer(
//           imageFile.buffer,
//           imageFilename,
//           imageFile.mimetype || imageFile.type
//         )
//         uploadedImages.push(imageFilename)
//       }
//       updateData.images = JSON.stringify(uploadedImages)
//     }

//     const updatedProduct = await updateProduct(id, updateData)

//     if (!updatedProduct) {
//       return badRequestResponse(res, '更新商品失败')
//     }

//     return successResponse(res, updatedProduct, '更新商品成功')
//   } catch (error) {
//     console.error('更新商品失败:', error)
//     return errorResponse(res, '更新商品失败')
//   }
}

/**
 * 删除商品（软删除）
 */
export const deleteProductHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

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
