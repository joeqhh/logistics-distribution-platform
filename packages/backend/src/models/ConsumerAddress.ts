import { prisma } from '../config/prisma'

export interface ConsumerAddress {
  id: number
  receiver: string
  phone?: string | null
  area?: string | null
  detailedAddress?: string | null
  location?: string | null
  consumerId: number
  isDeleted: boolean
  createTime: Date
  updateTime: Date
}

export interface CreateAddressData {
  receiver: string
  phone?: string
  area?: string
  detailedAddress?: string
  location?: string
  consumerId?: number
}

export interface UpdateAddressData {
  receiver?: string
  phone?: string
  area?: string
  detailedAddress?: string
  location?: string
}

// 根据ID查找地址
export const findAddressById = async (id: number): Promise<ConsumerAddress | null> => {
  return await prisma.consumerAddress.findUnique({
    where: { id, isDeleted: false },
    select: {
      id: true,
      receiver: true,
      phone: true,
      area: true,
      detailedAddress: true,
      location: true,
      isDeleted: true,
      createTime: true,
      updateTime: true,
      consumerId: true
    }
  })
}

// 根据消费者ID查找所有地址
export const findAddressesByConsumerId = async (consumerId: number): Promise<ConsumerAddress[]> => {
  return await prisma.consumerAddress.findMany({
    where: { consumerId, isDeleted: false },
    select: {
      id: true,
      receiver: true,
      phone: true,
      area: true,
      detailedAddress: true,
      location: true,
      isDeleted: true,
      createTime: true,
      updateTime: true,
      consumerId: true
    },
    orderBy: { id: 'desc' }
  })
}

// 创建新地址
export const createAddress = async (addressData: CreateAddressData): Promise<ConsumerAddress> => {
  return await prisma.consumerAddress.create({
    data: {
      receiver: addressData.receiver,
      phone: addressData.phone,
      area: addressData.area,
      detailedAddress: addressData.detailedAddress,
      location: addressData.location,
      consumerId: addressData.consumerId
    },
    select: {
      id: true,
      receiver: true,
      phone: true,
      area: true,
      detailedAddress: true,
      location: true,
      isDeleted: true,
      createTime: true,
      updateTime: true,
      consumerId: true
    }
  })
}

// 更新地址信息
export const updateAddress = async (id: number, addressData: UpdateAddressData): Promise<ConsumerAddress | null> => {
  return await prisma.consumerAddress.update({
    where: { id, isDeleted: false },
    data: addressData,
    select: {
      id: true,
      receiver: true,
      phone: true,
      area: true,
      detailedAddress: true,
      location: true,
      isDeleted: true,
      createTime: true,
      updateTime: true,
      consumerId: true
    }
  })
}

// 删除地址（软删除）
export const deleteAddress = async (id: number): Promise<boolean> => {
  try {
    await prisma.consumerAddress.update({
      where: { id },
      data: { isDeleted: true }
    })
    return true
  } catch (error) {
    return false
  }
}

// 获取所有地址（分页）
export const getAllAddresses = async (page: number = 1, limit: number = 10): Promise<{ addresses: ConsumerAddress[], total: number }> => {
  const skip = (page - 1) * limit
  
  const [addresses, total] = await Promise.all([
    prisma.consumerAddress.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        receiver: true,
        phone: true,
        area: true,
        detailedAddress: true,
        location: true,
        isDeleted: true,
        createTime: true,
        updateTime: true,
        consumerId: true
      },
      skip,
      take: limit,
      orderBy: { id: 'desc' }
    }),
    prisma.consumerAddress.count({ where: { isDeleted: false } })
  ])
  
  return { addresses, total }
}