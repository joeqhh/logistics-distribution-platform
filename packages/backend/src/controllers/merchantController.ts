import { Request, Response } from 'express'
import { updateMerchant } from '../models/Merchant'
import { AuthRequest } from '../middleware/authCheck'
import { Merchant } from '../models/Merchant'
import { successResponse, errorResponse, badRequestResponse, notFoundResponse } from "../utils/response";

/**
 * 更新商家配送区域
 * @param req 请求对象，包含商家信息和新的配送区域数据
 * @param res 响应对象
 */
export const updateMerchantDeliveryArea = async (req: AuthRequest, res: Response) => {
  try {
    // 从请求体中获取配送区域数据
    const { deliveryArea } = req.body

    // 验证配送区域数据是否存在
    if (!deliveryArea) {
      return badRequestResponse(res, '配送区域数据不能为空')
    }

    // 验证配送区域数据格式（这里可以根据具体需求进行更详细的验证）
    if (!Array.isArray(deliveryArea) && typeof deliveryArea !== 'object') {
      return badRequestResponse(res, '配送区域数据格式不正确')
    }

    // 从请求对象中获取商家ID（merchantProtect中间件已验证并设置）
    const merchantId = req.user.id

    // 更新商家配送区域
    const updatedMerchant = await updateMerchant(merchantId, { deliveryArea })

    // 检查更新是否成功
    if (!updatedMerchant) {
      return notFoundResponse(res, '商家不存在或已被删除')
    }

    // 返回成功响应
    return successResponse(res, {
      id: updatedMerchant.id,
      deliveryArea: updatedMerchant.deliveryArea
    }, '配送区域更新成功')
  } catch (error) {
    console.error('更新配送区域错误:', error)
    return errorResponse(res, '服务器错误，更新配送区域失败')
  }
}

/**
 * 获取商家信息
 * @param req 请求对象，包含商家信息
 * @param res 响应对象
 */
export const getMerchantInfo = async (req: AuthRequest, res: Response) => {
  try {
    // user信息在merchantProtect中间件中已经设置到req.user
    const { id, name, address, avatar, deliveryArea, account } = req.user as Merchant
    return successResponse(res, {
      id,
      name,
      address,
      avatar,
      deliveryArea,
      account
    }, '获取商家信息成功')
  } catch (error) {
    console.error('获取商家信息错误:', error)
    return errorResponse(res, '获取商家信息失败')
  }
}

/**
 * 获取商家配送区域
 * @param req 请求对象，包含商家信息
 * @param res 响应对象
 */
export const getMerchantDeliveryArea = async (req: AuthRequest, res: Response) => {
  try {
    // user信息在merchantProtect中间件中已经设置到req.user
    const { deliveryArea } = req.user as Merchant
    return successResponse(res, {
      deliveryArea
    }, '获取商家配送区域成功')
  } catch (error) {
    console.error('获取商家配送区域错误:', error)
    return errorResponse(res, '获取商家配送区域失败')
  }
}

