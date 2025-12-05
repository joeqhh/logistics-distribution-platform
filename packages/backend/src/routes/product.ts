import express,{ Router } from 'express'
import multer from 'multer'
import {
  createProductHandler,
  getMerchantProducts,
  getProductDetail,
  updateProductHandler,
  deleteProductHandler,
  putProductOnSale,
  putProductOffSale,
  batchPutProductsOnSale,
  batchPutProductsOffSale,
  batchDeleteProductsHandler,
  getPublicProducts,
  publicSearchProducts,
  getPublicProductDetail,
  placeOrderHandler
} from '../controllers/productController'
import { merchantProtect, consumerProtect } from '../middleware/authCheck'

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
router.put('/products/:id', merchantProtect, updateProductHandler)

// 删除商品
router.delete('/products/single/:id', merchantProtect, deleteProductHandler)

// 商品上架
router.put('/products/single/:id/on-sale', merchantProtect, putProductOnSale)

// 商品下架
router.put('/products/single/:id/off-sale', merchantProtect, putProductOffSale)

// 批量上架商品
router.put('/products/batch/on-sale', merchantProtect, batchPutProductsOnSale)

// 批量下架商品
router.put('/products/batch/off-sale', merchantProtect, batchPutProductsOffSale)

// 批量删除商品
router.delete('/products/batch', merchantProtect, batchDeleteProductsHandler)

// 公开接口 - 不需要登录保护
// 获取商品列表（只返回is_deleted == 0和status == SALE的商品）
router.get('/public/products', getPublicProducts)

// 搜索商品（只返回is_deleted == 0和status == SALE的商品）
router.get('/public/products/search', publicSearchProducts)

// 获取商品详情（只返回is_deleted == 0和status == SALE的商品）
router.get('/public/products/:id', getPublicProductDetail)

// 下单
router.post('/product/order', consumerProtect, placeOrderHandler)

export default router