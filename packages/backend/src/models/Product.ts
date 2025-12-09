import { prisma } from '../config/prisma'
import { randomUUID } from 'crypto'
import { Decimal } from '@prisma/client/runtime/client'
import { ProductStatus } from '../generated/prisma/enums'

export { ProductStatus }

export interface Product {
  id: string
  name: string
  price: Decimal
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
  merchantId: number
  images?: any
  cover: string
}

export interface UpdateProductData {
  name?: string
  price?: number
  images?: any
  cover?: string
  status?: ProductStatus
}

// 根据ID查找商品
export const findProductById = async (id: string): Promise<Product | null> => {
  return await prisma.product.findUnique({
    where: { id, isDeleted: false },
    select: {
      id: true,
      name: true,
      price: true,
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
  limit: number = 10,
  status?: ProductStatus,
  name?: string | undefined,
  id?: string,
  priceBegin?: number,
  priceEnd?: number,
  salesBegin?: number,
  salesEnd?: number,
  createTimeBegin?: string,
  createTimeEnd?: string
): Promise<{ products: Product[]; total: number }> => {
  const skip = (page - 1) * limit
  const whereCondition = {
    merchantId,
    isDeleted: false,
    ...(status ? { status } : {}),
    ...(name ? { name: { contains: name } } : {}),
    ...(id ? { id } : {}),
    ...(priceBegin ? { price: { gte: priceBegin } } : {}),
    ...(priceEnd ? { price: { lte: priceEnd } } : {}),
    ...(salesBegin ? { sales: { gte: Number(salesBegin) } } : {}),
    ...(salesEnd ? { sales: { lte: Number(salesEnd) } } : {}),
    ...((createTimeBegin || createTimeEnd) ? {
      createTime: {
        ...(createTimeBegin ? { gte: new Date(createTimeBegin) } : {}),
        ...(createTimeEnd ? { lte: new Date(createTimeEnd + ' 23:59:59') } : {})
      }
    } : {})
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        price: true,
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
    prisma.product.count({ where: whereCondition })
  ])
  return { products, total }
}

// 批量更新商品状态
export const batchUpdateProductStatus = async (
  ids: string[],
  merchantId: number,
  status: ProductStatus
): Promise<boolean> => {
  try {
    // 验证所有商品都属于该商家且未被删除
    const existingProducts = await prisma.product.findMany({
      where: {
        id: { in: ids },
        merchantId,
        isDeleted: false
      },
      select: { id: true }
    })

    if (existingProducts.length !== ids.length) {
      return false
    }

    // 批量更新状态
    await prisma.product.updateMany({
      where: {
        id: { in: ids },
        merchantId,
        isDeleted: false
      },
      data: { status }
    })

    return true
  } catch (error) {
    console.error('批量更新商品状态失败:', error)
    return false
  }
}

// 批量删除商品（软删除）
export const batchDeleteProducts = async (
  ids: string[],
  merchantId: number
): Promise<boolean> => {
  try {
    // 验证所有商品都属于该商家
    const existingProducts = await prisma.product.findMany({
      where: {
        id: { in: ids },
        merchantId,
        isDeleted: false
      },
      select: { id: true }
    })

    if (existingProducts.length !== ids.length) {
      return false
    }

    // 批量软删除
    await prisma.product.updateMany({
      where: {
        id: { in: ids },
        merchantId
      },
      data: { isDeleted: true }
    })

    return true
  } catch (error) {
    console.error('批量删除商品失败:', error)
    return false
  }
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
      merchantId: productData.merchantId,
      sales: 0,
      images: productData.images,
      cover: productData.cover
    },
    select: {
      id: true,
      name: true,
      price: true,
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
      where: {
        isDeleted: false,
        status: ProductStatus.SALE
      },
      select: {
        id: true,
        name: true,
        price: true,
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
    prisma.product.count({
      where: {
        isDeleted: false,
        status: ProductStatus.SALE
      }
    })
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
        status: ProductStatus.SALE,
        OR: [{ name: { contains: keyword } }]
      },
      select: {
        id: true,
        name: true,
        price: true,
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
        status: ProductStatus.SALE,
        OR: [{ name: { contains: keyword } }]
      }
    })
  ])

  return { products, total }
}
