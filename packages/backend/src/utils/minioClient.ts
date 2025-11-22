import { Client } from 'minio'
import dotenv from 'dotenv'

dotenv.config()

interface MinioConfig {
  endPoint: string
  port: number
  useSSL: boolean
  accessKey: string
  secretKey: string
}

class MinioService {
  private client: Client
  private defaultBucket: string

  constructor() {
    console.log(process.env.MINIO_ENDPOINT)
    console.log(process.env.MINIO_PORT)
    console.log(process.env.MINIO_ACCESS_KEY)
    console.log(process.env.MINIO_SECRET_KEY)

    const config: MinioConfig = {
      endPoint: process.env.MINIO_ENDPOINT!,
      port: Number(process.env.MINIO_PORT),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
    }

    this.client = new Client(config)
    this.defaultBucket = process.env.MINIO_DEFAULT_BUCKET || 'uploads'
  }


  /**
   * 上传文件（从Buffer）
   */
  async uploadFileBuffer(
    buffer: Buffer,
    objectName: string,
    bucketName: string = this.defaultBucket,
    // contentType?: string,
    // metadata?: Record<string, string>
  ): Promise<any> {
    try {
      return await this.client.putObject(bucketName, objectName, buffer)
    } catch (error) {
      console.error('上传文件Buffer失败:', error)
      throw error
    }
  }

  /**
   * 下载文件到本地
   */
  async downloadFile(
    objectName: string,
    filePath: string,
    bucketName: string = this.defaultBucket
  ): Promise<void> {
    try {
      await this.client.fGetObject(bucketName, objectName, filePath)
    } catch (error) {
      console.error('下载文件失败:', error)
      throw error
    }
  }

  /**
   * 获取文件Buffer
   */
  // async getObjectBuffer(
  //   objectName: string,
  //   bucketName: string = this.defaultBucket
  // ): Promise<Buffer> {
  //   try {
  //     return await this.client.getObject(bucketName, objectName)
  //   } catch (error) {
  //     console.error('获取文件Buffer失败:', error)
  //     throw error
  //   }
  // }

  /**
   * 删除文件
   */
  async removeFile(
    objectName: string,
    bucketName: string = this.defaultBucket
  ): Promise<void> {
    try {
      await this.client.removeObject(bucketName, objectName)
    } catch (error) {
      console.error('删除文件失败:', error)
      throw error
    }
  }

  /**
   * 获取存储桶中的文件列表
   */
  async listFiles(
    bucketName: string = this.defaultBucket,
    prefix?: string,
    recursive: boolean = true
  ): Promise<Array<{ name: string; size: number; lastModified: Date }>> {
    try {
      const objects = await this.client.listObjectsV2(bucketName, prefix, recursive)
      const fileList: Array<{ name: string; size: number; lastModified: Date }> = []

      for await (const obj of objects) {
        if (obj.name) {
          fileList.push({
            name: obj.name,
            size: obj.size || 0,
            lastModified: obj.lastModified || new Date()
          })
        }
      }

      return fileList
    } catch (error) {
      console.error('获取文件列表失败:', error)
      throw error
    }
  }

  /**
   * 生成预签名URL
   */
  async presignedGetObject(
    objectName: string,
    expiry: number = 60 * 60, // 默认1小时
    bucketName: string = this.defaultBucket
  ): Promise<string> {
    try {
      return await this.client.presignedGetObject(bucketName, objectName, expiry)
    } catch (error) {
      console.error('生成预签名URL失败:', error)
      throw error
    }
  }

  /**
   * 生成预签名上传URL
   */
  async presignedPutObject(
    objectName: string,
    expiry: number = 60 * 60, // 默认1小时
    bucketName: string = this.defaultBucket
  ): Promise<string> {
    try {
      return await this.client.presignedPutObject(bucketName, objectName, expiry)
    } catch (error) {
      console.error('生成预签名上传URL失败:', error)
      throw error
    }
  }

  /**
   * 设置存储桶策略为公共读取
   */
  async setBucketPolicyPublicRead(bucketName: string = this.defaultBucket): Promise<void> {
    try {
      const policy = JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`]
          }
        ]
      })

      await this.client.setBucketPolicy(bucketName, policy)
    } catch (error) {
      console.error('设置存储桶策略失败:', error)
      throw error
    }
  }

  /**
   * 获取文件信息
   */
  async getObjectMetadata(
    objectName: string,
    bucketName: string = this.defaultBucket
  ): Promise<Record<string, any>> {
    try {
      const metadata = await this.client.statObject(bucketName, objectName)
      return metadata
    } catch (error) {
      console.error('获取文件信息失败:', error)
      throw error
    }
  }

  /**
   * 批量删除文件
   */
  async removeObjects(
    objectNames: string[],
    bucketName: string = this.defaultBucket
  ): Promise<void> {
    try {
      if (objectNames.length === 0) return
      
      const objects = objectNames.map(name => ({ name }))
      await this.client.removeObjects(bucketName, objects)
    } catch (error) {
      console.error('批量删除文件失败:', error)
      throw error
    }
  }
}

// 创建单例实例
const minioService = new MinioService()

// 导出单例实例和类本身（用于测试或特殊情况）
export { minioService as default, MinioService }