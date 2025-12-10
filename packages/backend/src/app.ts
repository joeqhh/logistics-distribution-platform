import express,{type Express} from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import multer from 'multer'
import authRoutes from './routes/auth'
import productRoutes from './routes/product'
import addressRoutes from './routes/address'
import merchantRoutes from './routes/merchant'
import consumerRoutes from "./routes/consumer"
import orderRoutes from './routes/order'
import { errorHandler } from './middleware/errorHandler'
import  morgan from 'morgan'

// 加载环境变量
dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 3001
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'], // consumer和merchant的前端地址
    methods: ['GET', 'POST']
  }
})

// 中间件
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'));

// 配置multer用于处理multipart/form-data
const storage = multer.memoryStorage()
const upload = multer({ storage })

// 应用multer中间件处理表单数据
app.use(upload.any())
 
// 路由
app.use('/api/auth', authRoutes)
app.use('/api', productRoutes)
app.use('/api', addressRoutes)
app.use('/api', merchantRoutes)
app.use('/api', consumerRoutes)
app.use('/api/order', orderRoutes)

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
    httpServer.listen({port: PORT,hostname: '0.0.0.0'}, () => {
      console.log(`服务器运行在端口 ${PORT}`)
      console.log(`健康检查: http://localhost:${PORT}/health`)
      console.log(`认证路由: http://localhost:${PORT}/api/auth`)
      console.log(`WebSocket服务已启动`)
    })

    // 启动物流坐标WebSocket推送服务
    const { startLogisticsWebSocketService } = await import('./websocket/logisticsSocket')
    startLogisticsWebSocketService()
  } catch (error) {
    console.error('服务器启动失败:', error)
    process.exit(1)
  }
}

startServer()

export default app
export { io }