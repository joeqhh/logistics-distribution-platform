import { Request, Response } from 'express'
import { updateMerchant } from '../models/Merchant'
import { AuthRequest } from '../middleware/authCheck'
import { Consumer, updateConsumer } from '../models/Consumer'
import {
  successResponse,
  errorResponse,
} from '../utils/response'
import { generateRandomFilename } from '../utils/file'
import minioClient from '../utils/minioClient'


/**
 * 获取商家信息
 * @param req 请求对象，包含商家信息
 * @param res 响应对象
 */
export const getConsumerInfo = async (req: AuthRequest, res: Response) => {
  try {
    // user信息在merchantProtect中间件中已经设置到req.user
    const { id, name, avatar, account, createTime } =
      req.user as Consumer
    return successResponse(
      res,
      {
        id,
        name,
        avatar,
        account,
        createTime
      },
      '获取用户信息成功'
    )
  } catch (error) {
    console.error('获取用户信息错误:', error)
    return errorResponse(res, '获取用户信息失败')
  }
}

/**
 * 更新用户信息
 * @param req
 * @param res
 */
export const updateConsumerInfo = async (req: AuthRequest, res: Response) => {
  try {
    // user信息在merchantProtect中间件中已经设置到req.user
    const { id } = req.user as Consumer
    const { name } = req.body as Consumer


    const files = req.files as Express.Multer.File[]
    let avatar = undefined
    if (files.length > 0) {
      const avatarFile = files[0]

      avatar = generateRandomFilename(avatarFile.originalname)
      await minioClient.uploadFileBuffer(
        avatarFile.buffer,
        avatar,
        process.env.MINIO_AVATAR_BUCKET
      )
    }

    const updatedConsumer = await updateConsumer(id, {
      name: name || undefined,
      avatar: avatar && process.env.MINIO_AVATAR_BUCKET! + '/' + avatar
    })

    return successResponse(
      res,
      {
        id: updatedConsumer?.id,
        account: updatedConsumer?.account,
        name: updatedConsumer?.name,
        avatar: updatedConsumer?.avatar,
        createTime: updatedConsumer?.createTime
      },
      '更新用户信息成功'
    )
  } catch (error) {
    console.error('更新用户信息错误:', error)
    return errorResponse(res, '更新用户信息失败')
  }
}
