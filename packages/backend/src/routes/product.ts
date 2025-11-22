import express,{ Router } from 'express'
import multer from 'multer'
import {
  createProductHandler,
  getMerchantProducts,
  getProductDetail,
  updateProductHandler,
  deleteProductHandler
} from '../controllers/productController'
import { merchantProtect } from '../middleware/authCheck'

const router : Router = express.Router()

// 配置multer用于商品图片上传
const storage = multer.memoryStorage()
const upload = multer({ storage })

// 创建商品 - 支持单文件和多文件上传
router.post('/products', merchantProtect,  createProductHandler)

// 获取商家商品列表
router.get('/products', merchantProtect, getMerchantProducts)

// 获取商品详情
router.get('/products/:id', merchantProtect, getProductDetail)

// 更新商品 - 支持单文件和多文件上传
router.put('/products/:id', merchantProtect, upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'image', maxCount: 10 }
]), updateProductHandler)

// 删除商品
router.delete('/products/:id', merchantProtect, deleteProductHandler)

export default router