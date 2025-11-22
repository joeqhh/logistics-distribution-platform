import { prisma } from '../config/prisma'
import { randomUUID } from 'crypto'
import { Decimal } from '@prisma/client/runtime/client'
import { ProductStatus } from '../generated/prisma/enums'

export interface Product {
  id: string
  name: string
  price: Decimal
  introduction?: string | null
  merchantId: number
  sales: number
  images?: any
  cover: string
  isDeleted: boolean
  createTime: Date
  updateTime: Date
  status: ProductStatus
}

export interface CreateProductData {
  id?: string
  name: string
  price: number
  introduction?: string
  merchantId: number
  images?: any
  cover: string
}

export interface UpdateProductData {
  name?: string
  price?: number
  introduction?: string
  images?: any
  cover?: string
}

// 根据ID查找商品
export const findProductById = async (id: string): Promise<Product | null> => {
  return await prisma.product.findUnique({
    where: { id, isDeleted: false },
    select: {
      id: true,
      name: true,
      price: true,
      introduction: true,
      merchantId: true,
      sales: true,
      images: true,
      cover: true,
      isDeleted: true,
      createTime: true,
      updateTime: true,
      status: true
    }
  })
}

// 根据商家ID查找商品列表
export const findProductsByMerchantId = async (
  merchantId: number,
  page: number = 1,
  limit: number = 10
): Promise<{ products: Product[]; total: number }> => {
  const skip = (page - 1) * limit

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { merchantId, isDeleted: false },
      select: {
        id: true,
        name: true,
        price: true,
        introduction: true,
        merchantId: true,
        sales: true,
        images: true,
        cover: true,
        isDeleted: true,
        createTime: true,
        status: true,
        updateTime: true
      },
      skip,
      take: limit,
      orderBy: { id: 'desc' }
    }),
    prisma.product.count({ where: { merchantId, isDeleted: false } })
  ])

  return { products, total }
}

// 创建新商品
export const createProduct = async (
  productData: CreateProductData
): Promise<Product> => {
  return await prisma.product.create({
    data: {
      id: randomUUID(),
      name: productData.name,
      price: productData.price,
      introduction: productData.introduction,
      merchantId: productData.merchantId,
      sales: 0,
      images: productData.images,
      cover: productData.cover
    },
    select: {
      id: true,
      name: true,
      price: true,
      introduction: true,
      merchantId: true,
      sales: true,
      images: true,
      cover: true,
      isDeleted: true,
      createTime: true,
      status: true,
      updateTime: true
    }
  })
}

// 更新商品信息
export const updateProduct = async (
  id: string,
  productData: UpdateProductData
): Promise<Product | null> => {
  return await prisma.product.update({
    where: { id, isDeleted: false },
    data: productData,
    select: {
      id: true,
      name: true,
      price: true,
      introduction: true,
      merchantId: true,
      sales: true,
      images: true,
      cover: true,
      isDeleted: true,
      status: true,
      createTime: true,
      updateTime: true
    }
  })
}

// 更新商品销量
export const updateProductSales = async (
  id: string,
  increment: number = 1
): Promise<Product | null> => {
  return await prisma.product.update({
    where: { id, isDeleted: false },
    data: {
      sales: {
        increment
      }
    },
    select: {
      id: true,
      name: true,
      price: true,
      status: true,
      introduction: true,
      merchantId: true,
      sales: true,
      images: true,
      cover: true,
      isDeleted: true,
      createTime: true,
      updateTime: true
    }
  })
}

// 删除商品（软删除）
export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    await prisma.product.update({
      where: { id },
      data: { isDeleted: true }
    })
    return true
  } catch (error) {
    return false
  }
}

// 获取所有商品（分页）
export const getAllProducts = async (
  page: number = 1,
  limit: number = 10
): Promise<{ products: Product[]; total: number }> => {
  const skip = (page - 1) * limit

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        price: true,
        introduction: true,
        merchantId: true,
        sales: true,
        images: true,
        cover: true,
        isDeleted: true,
        status: true,
        createTime: true,
        updateTime: true
      },
      skip,
      take: limit,
      orderBy: { createTime: 'desc' }
    }),
    prisma.product.count({ where: { isDeleted: false } })
  ])

  return { products, total }
}

// 搜索商品
export const searchProducts = async (
  keyword: string,
  page: number = 1,
  limit: number = 10
): Promise<{ products: Product[]; total: number }> => {
  const skip = (page - 1) * limit

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: {
        isDeleted: false,
        OR: [
          { name: { contains: keyword } },
          { introduction: { contains: keyword } }
        ]
      },
      select: {
        id: true,
        name: true,
        price: true,
        introduction: true,
        merchantId: true,
        sales: true,
        images: true,
        cover: true,
        status: true,
        isDeleted: true,
        createTime: true,
        updateTime: true
      },
      skip,
      take: limit,
      orderBy: { sales: 'desc' }
    }),
    prisma.product.count({
      where: {
        isDeleted: false,
        OR: [
          { name: { contains: keyword } },
          { introduction: { contains: keyword } }
        ]
      }
    })
  ])

  return { products, total }
}
