import express, { Router } from 'express'
import {
  // 消费者地址操作
  consumerCreateAddress,
  consumerGetAddresses,
  consumerGetAddressById,
  consumerUpdateAddress,
  consumerDeleteAddress,
  consumerSetDefaultAddress,
  // 商家地址操作
  merchantCreateAddress,
  merchantGetAddresses,
  merchantGetAddressById,
  merchantUpdateAddress,
  merchantDeleteAddress,
  merchantSetDefaultAddress
} from '../controllers/addressController'
import { consumerProtect, merchantProtect } from '../middleware/authCheck'

const router: Router = express.Router()

// 消费者地址路由 - 需要消费者身份验证
router.post('/consumer/addresses', consumerProtect, consumerCreateAddress)
router.get('/consumer/addresses', consumerProtect, consumerGetAddresses)
router.get('/consumer/addresses/:id', consumerProtect, consumerGetAddressById)
router.put('/consumer/addresses/:id', consumerProtect, consumerUpdateAddress)
router.delete('/consumer/addresses/:id', consumerProtect, consumerDeleteAddress)
// router.put('/consumer/addresses/:id/default', consumerProtect, consumerSetDefaultAddress)

// 商家地址路由 - 需要商家身份验证
router.post('/merchant/addresses', merchantProtect, merchantCreateAddress)
router.get('/merchant/addresses', merchantProtect, merchantGetAddresses)
router.get('/merchant/addresses/:id', merchantProtect, merchantGetAddressById)
router.put('/merchant/addresses/:id', merchantProtect, merchantUpdateAddress)
router.delete('/merchant/addresses/:id', merchantProtect, merchantDeleteAddress)
// router.put('/merchant/addresses/:id/default', merchantProtect, merchantSetDefaultAddress)

export default router