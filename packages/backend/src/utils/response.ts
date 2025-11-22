import { Response } from 'express'

/**
 * 统一响应格式接口
 */
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

/**
 * 成功响应
 * @param res Express响应对象
 * @param data 返回的数据
 * @param msg 响应消息
 * @param code 状态码
 * @returns Express响应
 */
export const successResponse = <T = any>(
  res: Response,
  data: T,
  msg: string = '操作成功',
  code: number = 200
): Response => {
  return res.status(200).json({
    code,
    msg,
    data
  })
}

/**
 * 错误响应
 * @param res Express响应对象
 * @param msg 错误消息
 * @param code 状态码
 * @param data 附加数据（可选）
 * @returns Express响应
 */
export const errorResponse = <T = any>(
  res: Response,
  msg: string = '服务器内部错误',
  code: number = 500,
  data?: T
): Response => {
  return res.status(200).json({
    code,
    msg,
    data: data === undefined ? null : data
  })
}

/**
 * 400错误响应
 * @param res Express响应对象
 * @param msg 错误消息
 * @param data 附加数据（可选）
 * @returns Express响应
 */
export const badRequestResponse = <T = any>(
  res: Response,
  msg: string = '请求参数错误',
  data?: T
): Response => {
  return errorResponse(res, msg, 400, data)
}

/**
 * 401错误响应
 * @param res Express响应对象
 * @param msg 错误消息
 * @param data 附加数据（可选）
 * @returns Express响应
 */
export const unauthorizedResponse = <T = any>(
  res: Response,
  msg: string = '未授权访问',
  data?: T
): Response => {
  return errorResponse(res, msg, 401, data)
}

/**
 * 403错误响应
 * @param res Express响应对象
 * @param msg 错误消息
 * @param data 附加数据（可选）
 * @returns Express响应
 */
export const forbiddenResponse = <T = any>(
  res: Response,
  msg: string = '禁止访问',
  data?: T
): Response => {
  return errorResponse(res, msg, 403, data)
}

/**
 * 404错误响应
 * @param res Express响应对象
 * @param msg 错误消息
 * @param data 附加数据（可选）
 * @returns Express响应
 */
export const notFoundResponse = <T = any>(
  res: Response,
  msg: string = '资源未找到',
  data?: T
): Response => {
  return errorResponse(res, msg, 404, data)
}

/**
 * 分页响应
 * @param res Express响应对象
 * @param items 数据列表
 * @param total 总数量
 * @param page 页码
 * @param pageSize 每页大小
 * @param msg 响应消息
 * @returns Express响应
 */
export const paginatedResponse = <T = any>(
  res: Response,
  items: T[],
  total: number,
  page: number,
  pageSize: number,
  msg: string = '获取列表成功'
): Response => {
  const totalPages = Math.ceil(total / pageSize)
  
  return successResponse(res, {
    items,
    total,
    page,
    pageSize,
    totalPages
  }, msg)
}