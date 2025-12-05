import express, { Router } from 'express'
import { updateMerchantDeliveryArea, getMerchantInfo, getMerchantDeliveryArea ,updateMerchantInfo} from '../controllers/merchantController'
import { merchantProtect } from '../middleware/authCheck'


const router: Router = express.Router()

// 更新商家配送区域 - 需要商家身份验证
router.put('/merchant/delivery-area', merchantProtect, updateMerchantDeliveryArea)

// 获取商家配送区域 - 需要商家身份验证
router.get('/merchant/delivery-area', merchantProtect, getMerchantDeliveryArea)

// 获取商家信息 - 需要商家身份验证
router.get('/merchant/info', merchantProtect, getMerchantInfo)

router.post('/merchant/info', merchantProtect, updateMerchantInfo)



export default router