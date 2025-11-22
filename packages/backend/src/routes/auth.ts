import express, { Router } from 'express'
import {
  consumerLogin,
  merchantLogin,
  consumerRegister,
  merchantRegister,
  logout,
  getProfile
} from '../controllers/authController'
import { consumerProtect, merchantProtect } from '../middleware/authCheck'

const router: Router = express.Router()

// 消费者登录
router.post('/consumer/login', consumerLogin)

// 商家登录
router.post('/merchant/login', merchantLogin)

// 消费者注册
router.post('/consumer/register', consumerRegister)

// 商家注册
router.post('/merchant/register', merchantRegister)

// 登出
router.post('/logout', logout)

// 获取用户信息 (需要认证)
router.get('/consumer/profile', consumerProtect, getProfile)
router.get('/merchant/profile', merchantProtect, getProfile)

export default router
