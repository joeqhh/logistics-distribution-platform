import express,{ Router }  from 'express';
import { consumerProtect, merchantProtect } from '../middleware/authCheck';
import {
  createOrderHandler,
  getConsumerOrdersHandler,
  getMerchantOrdersHandler,
  getOrderDetailHandler,
  deliverOrderHandler,
  getConsumerOrderDetailHandler,
  getMerchantOrderDetailHandler,
  updateOrderStatusHandler
} from '../controllers/orderController';

const router: Router = express.Router();

// 订单相关路由

// 创建订单（用户端）
router.post('/create', consumerProtect, createOrderHandler);

// 获取用户订单列表（支持筛选）
router.get('/consumer', consumerProtect, getConsumerOrdersHandler);

// 获取商家订单列表（支持筛选）
router.get('/merchant', merchantProtect, getMerchantOrdersHandler);

// 获取消费者订单详情
router.get('/consumer/:id', consumerProtect, getConsumerOrderDetailHandler);

// 获取商家订单详情
router.get('/merchant/:id', merchantProtect, getMerchantOrderDetailHandler);

// 获取订单详情（用户和商家都可访问，但有权限验证）- 保留以兼容现有代码
// router.get('/:id', consumerProtect, getOrderDetailHandler);

// 商家端更新订单状态（发货等）
router.put('/:id/status', merchantProtect, updateOrderStatusHandler);

router.post('/:id/deliver', merchantProtect, deliverOrderHandler);

export default router;