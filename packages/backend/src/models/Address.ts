import { prisma } from '../config/prisma'
import { AddressType} from '../generated/prisma/enums'

export { AddressType }

export interface Address {
  id: number
  name: string
  phone: string | null
  area: string | null
  detailedAddress: string | null
  userId: number
  isDeleted: boolean
  createTime: Date
  updateTime: Date
  type: AddressType
}

export interface CreateAddressData {
  name: string
  phone: string
  area: string
  detailedAddress: string
  userId: number
  type: AddressType
}

export interface UpdateAddressData {
  name?: string
  phone?: string
  area?: string
  detailedAddress?: string
}

// 根据ID查找地址
export const findAddressById = async (id: number): Promise<Address | null> => {
  return await prisma.address.findUnique({
    where: { id, isDeleted: false },
    select: {
      id: true,
      name: true,
      phone: true,
      area: true,
      detailedAddress: true,
      isDeleted: true,
      createTime: true,
      updateTime: true,
      userId: true,
      type : true
    }
  })
}

// 根据消费者ID查找所有地址
export const findAddressesByConsumerId = async (consumerId: number): Promise<Address[]> => {
  return await prisma.address.findMany({
    where: { userId: consumerId, isDeleted: false,type: AddressType.RECEIVER },
    select: {
      id: true,
      name: true,
      phone: true,
      area: true,
      detailedAddress: true,
      isDeleted: true,
      createTime: true,
      updateTime: true,
      userId: true,
      type : true
    },
    orderBy: { createTime: 'desc' }
  })
}

// 根据商家ID查找所有地址
export const findAddressesByMerchantId = async (merchantId: number): Promise<Address[]> => {
  return await prisma.address.findMany({
    where: { userId: merchantId, isDeleted: false,type: AddressType.SENDER },
    select: {
      id: true,
      name: true,
      phone: true,
      area: true,
      detailedAddress: true,
      isDeleted: true,
      createTime: true,
      updateTime: true,
      userId: true,
      type : true
    },
    orderBy: { createTime: 'desc' }
  })
}

// 创建新地址
export const createAddress = async (addressData: CreateAddressData): Promise<Address> => {
  return await prisma.address.create({
    data: {
      name: addressData.name,
      phone: addressData.phone,
      area: addressData.area,
      detailedAddress: addressData.detailedAddress,
      userId: addressData.userId,
      type: addressData.type
    },
    select: {
      id: true,
      name: true,
      phone: true,
      area: true,
      detailedAddress: true,
      isDeleted: true,
      createTime: true,
      updateTime: true,
      userId: true,
      type: true
    }
  })
}

// 更新地址信息
export const updateAddress = async (id: number, addressData: UpdateAddressData): Promise<Address | null> => {
  return await prisma.address.update({
    where: { id, isDeleted: false },
    data: addressData,
    select: {
      id: true,
      name: true,
      phone: true,
      area: true,
      detailedAddress: true,
      isDeleted: true,
      createTime: true,
      updateTime: true,
      userId: true,
      type: true
    }
  })
}

// 删除地址（软删除）
export const deleteAddress = async (id: number): Promise<boolean> => {
  try {
    await prisma.address.update({
      where: { id },
      data: { isDeleted: true }
    })
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}