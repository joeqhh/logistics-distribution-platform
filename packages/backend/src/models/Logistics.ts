import { prisma } from '../config/prisma'
import { LogisticsStatus } from '../generated/prisma/enums'

export interface Logistics {
  id: number
  orderId: string
  status: LogisticsStatus
  describe?: string | null
  location?: string | null
  isDeleted: boolean
  createTime: Date
}

export interface CreateLogisticsData {
  orderId: string
  describe?: string
  location?: string
  status: LogisticsStatus
  createTime: Date
}

export interface UpdateLogisticsData {
  status?: LogisticsStatus
  describe?: string
  location?: string
}

// 获取订单最新的物流状态（不超过当前时间的最新记录）
export const getOrderLatestLogisticsStatus = async (orderId: string): Promise<LogisticsStatus | null> => {
  try {
    const latestLogistics = await prisma.logistics.findFirst({
      where: {
        orderId,
        isDeleted: false,
        createTime: { lte: new Date() }
      },
      orderBy: { createTime: 'desc' },
      select: { status: true }
    });
    return latestLogistics?.status || null;
  } catch (error) {
    console.error('获取订单最新物流状态失败:', error);
    return null;
  }
};

// 根据ID查找物流信息
export const findLogisticsById = async (id: number): Promise<Logistics | null> => {
  return await prisma.logistics.findUnique({
    where: { id, isDeleted: false },
    select: {
      id: true,
      orderId: true,
      status: true,
      describe: true,
      location: true,
      isDeleted: true,
      createTime: true,
    }
  })
}

// 根据订单ID查找物流信息（返回所有符合条件的记录）
export const findLogisticsByOrderId = async (orderId: string): Promise<Logistics[]> => {
  return await prisma.logistics.findMany({
    where: { 
      orderId, 
      isDeleted: false,
      createTime: { lte: new Date() }
    },
    select: {
      id: true,
      orderId: true,
      status: true,
      describe: true,
      location: true,
      isDeleted: true,
      createTime: true,
    },
    orderBy: { createTime: 'asc' }
  })
}

// 创建新物流信息
export const createLogistics = async (logisticsData: CreateLogisticsData): Promise<Logistics> => {
  return await prisma.logistics.create({
    data: {
      orderId: logisticsData.orderId,
      status: logisticsData.status,
      describe: logisticsData.describe,
      location: logisticsData.location,
      createTime: logisticsData.createTime
    },
    select: {
      id: true,
      orderId: true,
      status: true,
      describe: true,
      location: true,
      isDeleted: true,
      createTime: true,
    }
  })
}

// 更新物流信息
export const updateLogistics = async (id: number, logisticsData: UpdateLogisticsData): Promise<Logistics | null> => {
  return await prisma.logistics.update({
    where: { id, isDeleted: false },
    data: logisticsData,
    select: {
      id: true,
      orderId: true,
      status: true,
      describe: true,
      location: true,
      isDeleted: true,
      createTime: true,
    }
  })
}

// 更新订单物流状态
export const updateLogisticsStatus = async (orderId: string, status: LogisticsStatus): Promise<Logistics | null> => {
  return await prisma.logistics.update({
    where: { orderId, isDeleted: false },
    data: { status },
    select: {
      id: true,
      orderId: true,
      status: true,
      describe: true,
      location: true,
      isDeleted: true,
      createTime: true,
    }
  })
}

// 删除物流信息（软删除）
export const deleteLogistics = async (id: number): Promise<boolean> => {
  try {
    await prisma.logistics.update({
      where: { id },
      data: { isDeleted: true }
    })
    return true
  } catch (error) {
    return false
  }
}

// 批量创建物流信息
export const createLogisticsBatch = async (logisticsDataArray: CreateLogisticsData[]): Promise<boolean> => {
  try {
    console.log('批量创建物流信息数据:', logisticsDataArray.length, '条');
    
    // 确保数组不为空
    if (!logisticsDataArray || logisticsDataArray.length === 0) {
      console.log('物流数据数组为空');
      return false;
    }
    
    // 为每个物流数据创建符合Prisma模型的对象
    const formattedData = logisticsDataArray.map(data => ({
      orderId: data.orderId,
      status: data.status,
      describe: data.describe,
      location: data.location,
      // Prisma会自动处理createTime，除非需要显式设置
      createTime: data.createTime
    }));
    
    const result = await prisma.logistics.createMany({
      data: formattedData,
      skipDuplicates: true
    });
    
    // console.log('批量创建成功，创建了', result.count, '条记录');
    return true;
  } catch (error) {
    console.error('批量创建物流信息失败:', error);
    return false;
  }
}

// 获取所有物流信息（分页）
export const getAllLogistics = async (page: number = 1, limit: number = 10): Promise<{ logistics: Logistics[], total: number }> => {
  const skip = (page - 1) * limit
  
  const [logistics, total] = await Promise.all([
    prisma.logistics.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        orderId: true,
        status: true,
        describe: true,
        location: true,
        isDeleted: true,
        createTime: true,
      },
      skip,
      take: limit,
      orderBy: { id: 'desc' }
    }),
    prisma.logistics.count({ where: { isDeleted: false } })
  ])
  
  return { logistics, total }
}