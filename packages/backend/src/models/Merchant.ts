import { prisma } from '../config/prisma'

export interface Merchant {
  id: number
  name: string | null
  address?: string | null
  avatar?: string | null
  deliveryArea?: any
  account: string
  password: string
  isDeleted: boolean
  createTime: Date
  updateTime: Date
}


export interface CreateMerchantData {
  id?: number
  name?: string
  address?: string
  avatar?: string
  deliveryArea?: any
  account: string
  password: string
}

export interface UpdateMerchantData {
  name?: string
  address?: string
  avatar?: string
  deliveryArea?: any
  password?: string
}

// 根据ID查找商家
export const findMerchantById = async (id: number): Promise<Merchant | null> => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: {
        id
      }
    });
    return merchant;
  } catch (error) {
    console.error('查找商家错误:', error);
    throw error;
  }
};

// 根据账号查找商家
export const findMerchantByAccount = async (account: string): Promise<Merchant | null> => {
  return await prisma.merchant.findFirst({
    where: { account, isDeleted: false },
    select: {
      id: true,
      name: true,
      address: true,
      avatar: true,
      deliveryArea: true,
      account: true,
      password: true,
      isDeleted: true,
      createTime: true,
      updateTime: true
    }
  })
}

// 创建新商家
export const createMerchant = async (merchantData: CreateMerchantData): Promise<Merchant> => {
  return await prisma.merchant.create({
    data: {
      id: merchantData.id,
      name: merchantData.name,
      address: merchantData.address,
      avatar: merchantData.avatar,
      deliveryArea: merchantData.deliveryArea,
      account: merchantData.account,
      password: merchantData.password
    },
    select: {
      id: true,
      name: true,
      address: true,
      avatar: true,
      deliveryArea: true,
      account: true,
      password: true,
      isDeleted: true,
      createTime: true,
      updateTime: true
    }
  })
}

// 更新商家信息
export const updateMerchant = async (id: number, merchantData: UpdateMerchantData): Promise<Merchant | null> => {
  return await prisma.merchant.update({
    where: { id, isDeleted: false },
    data: merchantData,
    select: {
      id: true,
      name: true,
      address: true,
      avatar: true,
      deliveryArea: true,
      account: true,
      password: true,
      isDeleted: true,
      createTime: true,
      updateTime: true
    }
  })
}

// 删除商家（软删除）
export const deleteMerchant = async (id: number): Promise<boolean> => {
  try {
    await prisma.merchant.update({
      where: { id },
      data: { isDeleted: true }
    })
    return true
  } catch (error) {
    return false
  }
}

// 获取所有商家（分页）
export const getAllMerchants = async (page: number = 1, limit: number = 10): Promise<{ merchants: Merchant[], total: number }> => {
  const skip = (page - 1) * limit
  
  const [merchants, total] = await Promise.all([
    prisma.merchant.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        address: true,
        avatar: true,
        deliveryArea: true,
        account: true,
        password: true,
        isDeleted: true,
        createTime: true,
        updateTime: true
      },
      skip,
      take: limit,
      orderBy: { id: 'desc' }
    }),
    prisma.merchant.count({ where: { isDeleted: false } })
  ])
  
  return { merchants, total }
}
