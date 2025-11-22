import { prisma } from '../config/prisma'

export interface Consumer {
  id: number
  name: string
  avatar?: string | null
  gender: boolean
  account: string
  password: string
  isDeleted: boolean
  createTime: Date
  updateTime: Date
}

export interface CreateConsumerData {
  name: string
  avatar?: string
  gender?: boolean
  account: string
  password: string
}

export interface UpdateConsumerData {
  name?: string
  avatar?: string
  gender?: boolean
  account?: string
  password?: string
}

// 根据ID查找消费者
export const findConsumerById = async (id: number): Promise<Consumer | null> => {
  try {
    const consumer = await prisma.consumer.findUnique({
      where: {
        id
      }
    });
    return consumer;
  } catch (error) {
    console.error('查找消费者错误:', error);
    throw error;
  }
};

// 根据账号查找消费者
export const findConsumerByAccount = async (account: string): Promise<Consumer | null> => {
  return await prisma.consumer.findFirst({
    where: { account, isDeleted: false },
    select: {
      id: true,
      name: true,
      avatar: true,
      gender: true,
      account: true,
      password: true,
      isDeleted: true,
      createTime: true,
      updateTime: true
    }
  })
}

// 创建新消费者
export const createConsumer = async (consumerData: CreateConsumerData): Promise<Consumer> => {
  return await prisma.consumer.create({
    data: {
      name: consumerData.name,
      avatar: consumerData.avatar,
      gender: consumerData.gender || false,
      account: consumerData.account,
      password: consumerData.password,
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      gender: true,
      account: true,
      password: true,
      isDeleted: true,
      createTime: true,
      updateTime: true,
    }
  })
}

// 更新消费者信息
export const updateConsumer = async (id: number, consumerData: UpdateConsumerData): Promise<Consumer | null> => {
  return await prisma.consumer.update({
    where: { id, isDeleted: false },
    data: consumerData,
    select: {
      id: true,
      name: true,
      avatar: true,
      gender: true,
      account: true,
      password: true,
      isDeleted: true,
      createTime: true,
      updateTime: true
    }
  })
}

// 删除消费者（软删除）
export const deleteConsumer = async (id: number): Promise<boolean> => {
  try {
    await prisma.consumer.update({
      where: { id },
      data: { isDeleted: true }
    })
    return true
  } catch (error) {
    return false
  }
}

// 获取所有消费者（分页）
export const getAllConsumers = async (page: number = 1, limit: number = 10): Promise<{ consumers: Consumer[], total: number }> => {
  const skip = (page - 1) * limit
  
  const [consumers, total] = await Promise.all([
    prisma.consumer.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        avatar: true,
        gender: true,
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
    prisma.consumer.count({ where: { isDeleted: false } })
  ])
  
  return { consumers, total }
}