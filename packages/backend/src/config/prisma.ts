import dotenv from 'dotenv'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

dotenv.config()

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306'),
  password: process.env.DB_PASSWORD,
})

// 创建并导出Prisma客户端实例
const prisma = new PrismaClient({
  adapter
})


// 导出 Prisma 客户端实例
export { prisma }
export default prisma
