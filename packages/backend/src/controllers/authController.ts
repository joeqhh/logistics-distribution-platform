import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AuthRequest } from '../middleware/authCheck'
import {
  findConsumerByAccount,
  createConsumer,
  Consumer,
  CreateConsumerData,
  findConsumerById
} from '../models/Consumer'
import {
  findMerchantByName,
  findMerchantByAccount,
  createMerchant,
  Merchant,
  CreateMerchantData,
  findMerchantById
} from '../models/Merchant'
import {
  successResponse,
  errorResponse,
  badRequestResponse
} from '../utils/response'

// 生成 JWT Token
const generateToken = (id: number, type: 'consumer' | 'merchant'): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secret'
  const expiresIn = (process.env.JWT_EXPIRE ||
    '30d') as jwt.SignOptions['expiresIn']

  return jwt.sign({ id, type }, secret, { expiresIn })
}

// 消费者注册
export const consumerRegister = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {  name,account, password } = req.body

    // 检查参数
    if (!name || !account || !password) {
      return badRequestResponse(res, '缺少必要参数')
    }

    // 检查消费者是否已存在
    const existingConsumer = await findConsumerByAccount(account)
    if (existingConsumer) {
      return badRequestResponse(res, '账号已存在')
    }

    // 加密密码
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)

    // 创建新消费者
    const consumerData: CreateConsumerData = {
      name,
      account,
      password: hashedPassword,
      avatar:
        '/' +
        process.env.MINIO_AVATAR_BUCKET +
        '/' +
        'default-consumer-avatar.jpg'
    }

    const newConsumer = await createConsumer(consumerData)

    // 生成 token
    const token = generateToken(newConsumer.id!, 'consumer')

    return successResponse(
      res,
      {
        id: newConsumer.id,
        name: newConsumer.name,
        account: newConsumer.account,
        avatar: newConsumer.avatar,
        gender: newConsumer.gender,
        token
      },
      '注册成功'
    )
  } catch (error) {
    console.error('消费者注册错误:', error)
    return errorResponse(res)
  }
}

// 商家注册
export const merchantRegister = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { name,account, password } = req.body

    // 检查参数
    if (!account || !password) {
      return badRequestResponse(res, '缺少必要参数')
    }

    // 检查商家是否已存在
    const existingMerchant = await findMerchantByAccount(account)
    if (existingMerchant) {
      return badRequestResponse(res, '账号已存在')
    }


    // 检查商家是否已存在
    const existingMerchantName = await findMerchantByName(name)
    if (existingMerchantName) {
      return badRequestResponse(res, '商家名称已存在')
    }

    // 加密密码
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)

    // 创建新商家
    const merchantData: CreateMerchantData = {
      name,
      account,
      password: hashedPassword,
      avatar:
        '/' +
        process.env.MINIO_AVATAR_BUCKET +
        '/' +
        'default-merchant-avatar.jpg'
    }

    const newMerchant = await createMerchant(merchantData)

    // 生成 token
    const token = generateToken(newMerchant.id!, 'merchant')

    return successResponse(
      res,
      {
        id: newMerchant.id,
        name: newMerchant.name,
        account: newMerchant.account,
        avatar: newMerchant.avatar,
        token
      },
      '注册成功'
    )
  } catch (error) {
    console.error('商家注册错误:', error)
    return errorResponse(res)
  }
}

// 消费者登录
export const consumerLogin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { account, password } = req.body

    // 检查参数
    if (!account || !password) {
      return badRequestResponse(res, '缺少必要参数')
    }

    // 查找消费者
    const consumer = await findConsumerByAccount(account)
    if (!consumer) {
      return errorResponse(res, '账号或密码错误', 401)
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, consumer.password!)
    if (!isPasswordValid) {
      return errorResponse(res, '账号或密码错误', 401)
    }

    // 生成 token
    const token = generateToken(consumer.id!, 'consumer')

    return successResponse(
      res,
      {
        id: consumer.id,
        name: consumer.name,
        account: consumer.account,
        avatar: consumer.avatar,
        gender: consumer.gender,
        token
      },
      '登录成功'
    )
  } catch (error) {
    console.error('消费者登录错误:', error)
    return errorResponse(res)
  }
}

// 商家登录
export const merchantLogin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { account, password } = req.body

    // 检查参数
    if (!account || !password) {
      return badRequestResponse(res, '缺少必要参数')
    }

    // 查找商家
    const merchant = await findMerchantByAccount(account)
    if (!merchant) {
      return errorResponse(res, '账号或密码错误', 401)
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, merchant.password!)
    if (!isPasswordValid) {
      return errorResponse(res, '账号或密码错误', 401)
    }

    // 生成 token
    const token = generateToken(merchant.id!, 'merchant')

    return successResponse(
      res,
      {
        id: merchant.id,
        name: merchant.name,
        account: merchant.account,
        avatar: merchant.avatar,
        deliveryArea: merchant.deliveryArea,
        token
      },
      '登录成功'
    )
  } catch (error) {
    console.error('商家登录错误:', error)
    return errorResponse(res)
  }
}

// 用户登出
export const logout = async (
  req: Request,
  res: Response
): Promise<Response> => {
  return successResponse(res, null, '登出成功')
}

// 获取用户信息（根据token中的type获取对应的用户信息）
export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?.id
    const userType = req.user?.type as 'consumer' | 'merchant'

    if (!userId || !userType) {
      return errorResponse(res, '未授权访问', 401)
    }

    let userData: any

    if (userType === 'consumer') {
      const consumer = req.user
      if (!consumer) {
        return errorResponse(res, '消费者未找到', 404)
      }
      userData = {
        id: consumer.id,
        name: consumer.name,
        account: consumer.account,
        avatar: consumer.avatar,
        gender: consumer.gender,
        type: 'consumer'
      }
    } else if (userType === 'merchant') {
      const merchant = req.user
      if (!merchant) {
        return errorResponse(res, '商家未找到', 404)
      }
      userData = {
        id: merchant.id,
        name: merchant.name,
        account: merchant.account,
        address: merchant.address,
        avatar: merchant.avatar,
        deliveryArea: merchant.deliveryArea,
        type: 'merchant'
      }
    } else {
      return badRequestResponse(res, '无效的用户类型')
    }

    return successResponse(res, userData, '获取用户信息成功')
  } catch (error) {
    console.error('获取用户信息错误:', error)
    return errorResponse(res)
  }
}
