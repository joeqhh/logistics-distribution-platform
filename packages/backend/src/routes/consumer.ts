import express, { Router } from 'express'
import { getConsumerInfo,updateConsumerInfo} from '../controllers/consumerController'
import { consumerProtect } from '../middleware/authCheck'


const router: Router = express.Router()


// 获取用户信息 - 需要用户身份验证
router.get('/consumer/info', consumerProtect, getConsumerInfo)

// 更新用户信息 - 需要用户身份验证
router.post('/consumer/info', consumerProtect, updateConsumerInfo)



export default router