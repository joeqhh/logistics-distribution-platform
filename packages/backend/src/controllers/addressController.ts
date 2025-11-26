import { Request, Response } from 'express'
import { AuthRequest } from '../middleware/authCheck'
import { Address, CreateAddressData, UpdateAddressData, AddressType, findAddressById, findAddressesByConsumerId, findAddressesByMerchantId, createAddress, updateAddress, deleteAddress } from '../models/Address'

// 消费者地址操作控制器

/**
 * 创建消费者地址
 */
export const consumerCreateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, area, detailedAddress } = req.body
    const consumerId = req.user?.id

    if (!consumerId) {
      res.status(400).json({
        code: 400,
        message: '消费者ID不存在'
      })
      return
    }

    // 创建地址数据
    const addressData: CreateAddressData = {
      name,
      phone,
      area,
      detailedAddress,
      userId: consumerId,
      type: AddressType.RECEIVER
    }
    
    // 调用地址模型的创建方法
    const newAddress = await createAddress(addressData)

    // 地址模型中没有isDefault字段，通过type字段区分是收件人还是发件人地址

    res.status(201).json({
      code: 200,
      message: '地址创建成功',
      data: newAddress
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '创建地址失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
}

/**
 * 获取消费者地址列表（分页）
 */
export const consumerGetAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const consumerId = req.user?.id
    // 获取分页参数，默认为第1页，每页10条
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 10

    if (!consumerId) {
      res.status(400).json({
        code: 400,
        message: '消费者ID不存在'
      })
      return
    }

    // 调用地址模型的查询方法
    const allAddresses = await findAddressesByConsumerId(consumerId)
    
    // 计算分页数据
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedAddresses = allAddresses.slice(start, end)
    const total = allAddresses.length
    const totalPages = Math.ceil(total / pageSize)

    res.status(200).json({
      code: 200,
      message: '获取地址列表成功',
      data: {
        items: paginatedAddresses,
        total,
        page,
        pageSize,
        totalPages
      }
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取地址列表失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
}

/**
 * 根据ID获取消费者地址
 */
export const consumerGetAddressById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const consumerId = req.user?.id

    if (!consumerId) {
      res.status(400).json({
        code: 400,
        message: '消费者ID不存在'
      })
      return
    }

    // 调用地址模型的查询方法
    const address = await findAddressById(parseInt(id))
    
    if (!address || address.userId !== consumerId || address.type !== AddressType.RECEIVER) {
      res.status(404).json({
        code: 404,
        message: '地址不存在或无权访问'
      })
      return
    }

    res.status(200).json({
      code: 200,
      message: '获取地址成功',
      data: address
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取地址失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
}

/**
 * 更新消费者地址
 */
export const consumerUpdateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, phone, area, detailedAddress } = req.body
    const consumerId = req.user?.id

    if (!consumerId) {
      res.status(400).json({
        code: 400,
        message: '消费者ID不存在'
      })
      return
    }
    
    // 检查地址是否存在且属于当前用户
    const existingAddress = await findAddressById(parseInt(id))
    if (!existingAddress || existingAddress.userId !== consumerId || existingAddress.type !== AddressType.RECEIVER) {
      res.status(404).json({
        code: 404,
        message: '地址不存在或无权访问'
      })
      return
    }

    // 准备更新数据
    const updateData: UpdateAddressData = {
      name,
      phone,
      area,
      detailedAddress
    }
    
    // 调用地址模型的更新方法
    const updatedAddress = await updateAddress(parseInt(id), updateData)

    // 地址模型中没有isDefault字段，通过type字段区分是收件人还是发件人地址

    res.status(200).json({
      code: 200,
      message: '地址更新成功',
      data: updatedAddress
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '更新地址失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
}

/**
 * 删除消费者地址
 */
export const consumerDeleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const consumerId = req.user?.id

    if (!consumerId) {
      res.status(400).json({
        code: 400,
        message: '消费者ID不存在'
      })
      return
    }

    // 检查地址是否存在且属于当前用户
    const existingAddress = await findAddressById(parseInt(id))
    if (!existingAddress || existingAddress.userId !== consumerId || existingAddress.type !== AddressType.RECEIVER) {
      res.status(404).json({
        code: 404,
        message: '地址不存在或无权访问'
      })
      return
    }
    
    // 调用地址模型的删除方法
    const deleted = await deleteAddress(parseInt(id))
    
    if (!deleted) {
      res.status(400).json({
        code: 400,
        message: '删除地址失败'
      })
      return
    }

    res.status(200).json({
      code: 200,
      message: '地址删除成功'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '删除地址失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
}

/**
 * 设置消费者默认地址
 */
export const consumerSetDefaultAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const consumerId = req.user?.id

    if (!consumerId) {
      res.status(400).json({
        code: 400,
        message: '消费者ID不存在'
      })
      return
    }

    // 地址模型中没有isDefault字段，通过type字段区分是收件人还是发件人地址
    res.status(400).json({
      code: 400,
      message: '当前地址模型不支持设置默认地址功能'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '设置默认地址失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
}

// 商家地址操作控制器

/**
 * 创建商家地址
 */
export const merchantCreateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, area, detailedAddress } = req.body
    const merchantId = req.user?.id

    if (!merchantId) {
      res.status(400).json({
        code: 400,
        message: '商家ID不存在'
      })
      return
    }

    // 创建地址数据
    const addressData: CreateAddressData = {
      name,
      phone,
      area,
      detailedAddress,
      userId: merchantId,
      type: AddressType.SENDER
    }
    
    // 调用地址模型的创建方法
    const newAddress = await createAddress(addressData)

    res.status(201).json({
      code: 200,
      message: '地址创建成功',
      data: newAddress
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '创建地址失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
}

/**
 * 获取商家地址列表（分页）
 */
export const merchantGetAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const merchantId = req.user?.id
    // 获取分页参数，默认为第1页，每页10条
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 10

    if (!merchantId) {
      res.status(400).json({
        code: 400,
        message: '商家ID不存在'
      })
      return
    }

    // 调用地址模型的查询方法
    const allAddresses = await findAddressesByMerchantId(merchantId)
    
    // 计算分页数据
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedAddresses = allAddresses.slice(start, end)
    const total = allAddresses.length
    const totalPages = Math.ceil(total / pageSize)

    res.status(200).json({
      code: 200,
      message: '获取地址列表成功',
      data: {
        items: paginatedAddresses,
        total,
        page,
        pageSize,
        totalPages
      }
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取地址列表失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
}

/**
 * 根据ID获取商家地址
 */
export const merchantGetAddressById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const merchantId = req.user?.id

    if (!merchantId) {
      res.status(400).json({
        code: 400,
        message: '商家ID不存在'
      })
      return
    }

    // 调用地址模型的查询方法
    const address = await findAddressById(parseInt(id))
    
    if (!address || address.userId !== merchantId || address.type !== AddressType.SENDER) {
      res.status(404).json({
        code: 404,
        message: '地址不存在或无权访问'
      })
      return
    }

    res.status(200).json({
      code: 200,
      message: '获取地址成功',
      data: address
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取地址失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
}

/**
 * 更新商家地址
 */
export const merchantUpdateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, phone, area, detailedAddress } = req.body
    const merchantId = req.user?.id

    if (!merchantId) {
      res.status(400).json({
        code: 400,
        message: '商家ID不存在'
      })
      return
    }
    
    // 检查地址是否存在且属于当前用户
    const existingAddress = await findAddressById(parseInt(id))
    if (!existingAddress || existingAddress.userId !== merchantId || existingAddress.type !== AddressType.SENDER) {
      res.status(404).json({
        code: 404,
        message: '地址不存在或无权访问'
      })
      return
    }

    // 准备更新数据
    const updateData: UpdateAddressData = {
      name,
      phone,
      area,
      detailedAddress
    }
    
    // 调用地址模型的更新方法
    const updatedAddress = await updateAddress(parseInt(id), updateData)

    res.status(200).json({
      code: 200,
      message: '地址更新成功',
      data: updatedAddress
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '更新地址失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
}

/**
 * 删除商家地址
 */
export const merchantDeleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const merchantId = req.user?.id

    if (!merchantId) {
      res.status(400).json({
        code: 400,
        message: '商家ID不存在'
      })
      return
    }

    // 检查地址是否存在且属于当前用户
    const existingAddress = await findAddressById(parseInt(id))
    if (!existingAddress || existingAddress.userId !== merchantId || existingAddress.type !== AddressType.SENDER) {
      res.status(404).json({
        code: 404,
        message: '地址不存在或无权访问'
      })
      return
    }
    
    // 调用地址模型的删除方法
    const deleted = await deleteAddress(parseInt(id))
    
    if (!deleted) {
      res.status(400).json({
        code: 400,
        message: '删除地址失败'
      })
      return
    }

    res.status(200).json({
      code: 200,
      message: '地址删除成功'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '删除地址失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
}

/**
 * 设置商家默认地址
 */
export const merchantSetDefaultAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const merchantId = req.user?.id

    if (!merchantId) {
      res.status(400).json({
        code: 400,
        message: '商家ID不存在'
      })
      return
    }

    // 地址模型中没有isDefault字段，通过type字段区分是收件人还是发件人地址
    res.status(400).json({
      code: 400,
      message: '当前地址模型不支持设置默认地址功能'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '设置默认地址失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
}