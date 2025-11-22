import { findConsumerById } from '../models/Consumer'
import { findMerchantById } from '../models/Merchant'
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: any
}

export const consumerProtect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: '未授权访问，请先登录'
    })
    return
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    if (!decoded || decoded.type !== 'consumer') {
      res.status(200).json({
        code: 401,
        msg: '未授权访问，token 类型无效'
      })
      return
    }
    const user = await findConsumerById(decoded.id)
    if (!user) {
      res.status(200).json({
        code: 401,
        msg: '未授权访问，消费者不存在'
      })
      return
    }

    req.user = user
    next()
  } catch (error) {
    res.status(200).json({
      code: 401,
      msg: '未授权访问，token 无效'
    })
    return
  }
}

export const merchantProtect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token

  // 从请求头获取 token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: '未授权访问，请先登录'
    })
    return
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (!decoded || decoded.type !== 'merchant') {
      res.status(200).json({
        code: 401,
        msg: '未授权访问，token 类型无效'
      })
      return
    }
    const user = await findMerchantById(decoded.id)
    if (!user) {
      res.status(200).json({
        code: 401,
        msg: '未授权访问，商家不存在'
      })
      return
    }
    req.user = user
    next()
  } catch (error) {
    res.status(200).json({
      code: 401,
      msg: '未授权访问，token 无效'
    })
    return
  }
}
