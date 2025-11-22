import express,{type Express} from 'express'
import dotenv from 'dotenv'
import multer from 'multer'
import authRoutes from './routes/auth'
import productRoutes from './routes/product'
import { errorHandler } from './middleware/errorHandler'

// 加载环境变量
dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 配置multer用于处理multipart/form-data
const storage = multer.memoryStorage()
const upload = multer({ storage })

// 应用multer中间件处理表单数据
app.use(upload.any())
 
// 路由
app.use('/api/auth', authRoutes)
app.use('/api', productRoutes)

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  })
})

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  })
})

// 错误处理中间件
app.use(errorHandler)

// 启动服务器
const startServer = async () => {
  try {

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`)
      console.log(`健康检查: http://localhost:${PORT}/health`)
      console.log(`认证路由: http://localhost:${PORT}/api/auth`)
    })
  } catch (error) {
    console.error('服务器启动失败:', error)
    process.exit(1)
  }
}

startServer()

export default app