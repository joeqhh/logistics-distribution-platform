import { Request, Response, NextFunction } from 'express'
import { errorResponse, badRequestResponse, notFoundResponse } from '../utils/response'

export interface CustomError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = { ...err }
  error.message = err.message

  // 记录错误
  console.error(err)

  // Mongoose 错误处理
  if (err.name === 'CastError') {
    const message = '资源未找到'
    return notFoundResponse(res, message)
  }

  // Mongoose 重复字段
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = '重复字段值'
    return badRequestResponse(res, message)
  }

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ')
    return badRequestResponse(res, message)
  }

  // 其他错误
  return errorResponse(res, error.message || '服务器内部错误', error.statusCode || 500)
}