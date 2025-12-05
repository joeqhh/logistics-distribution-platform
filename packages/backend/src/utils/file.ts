
import path from 'path'

/**
 * 生成随机文件名
 */
export const generateRandomFilename = (originalName: string): string => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 10)
  const ext = path.extname(originalName)
  return `${timestamp}_${randomString}${ext}`
}