import express,{ Router }  from 'express';
import { consumerProtect, merchantProtect } from '../middleware/authCheck';
import {
  createOrderHandler,
  getConsumerOrdersHandler,
  getMerchantOrdersHandler,
  deliverOrderHandler,
  getConsumerOrderDetailHandler,
  getMerchantOrderDetailHandler,
  confirmReceiveHandler,
  merchantDeleteOrder
} from '../controllers/orderController';

const router: Router = express.Router();

// 订单相关路由

// 创建订单（用户端）
router.post('/create', consumerProtect, createOrderHandler);

// 获取用户订单列表（支持筛选）
router.get('/consumer', consumerProtect, getConsumerOrdersHandler);

// 用户确认收货
router.post('/:id/confirm', consumerProtect, confirmReceiveHandler);

// 获取商家订单列表（支持筛选）
router.get('/merchant', merchantProtect, getMerchantOrdersHandler);

// 获取消费者订单详情
router.get('/consumer/:id', consumerProtect, getConsumerOrderDetailHandler);

// 获取商家订单详情
router.get('/merchant/:id', merchantProtect, getMerchantOrderDetailHandler);

// 商家发货
router.post('/:id/deliver', merchantProtect, deliverOrderHandler);

// 商家删除订单
router.post('/:id/delete', merchantProtect, merchantDeleteOrder);

export default router;