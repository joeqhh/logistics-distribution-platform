import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Typography, Button, Carousel, Tag, Space, Divider, Message, InputNumber, Modal } from '@arco-design/web-react'
import { IconHeart, IconArrowRight, IconStar, IconHeartFill } from '@arco-design/web-react/icon'
import { useParams, useHistory } from 'react-router-dom'
import { useAppStore } from '@/store'
import MainLayout from '@/layout'
import styles from './index.module.less'
import {getProductDetail,type Product} from '@/api'

const { Title, Paragraph, Text } = Typography


export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const history = useHistory()
  const { isLogin, user } = useAppStore()
  const [product, setProduct] = useState<Product>();
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('details') // details, specs, reviews
  const [isFavorite, setIsFavorite] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  

  // 获取商品数据
  useEffect(() => {
    if(id) getProductDetail(id).then(res => {
      setProduct(res.data)
    })
  }, [id])
  
  const handleQuantityChange = (value: number | null) => {
    if (value && value > 0) {
      setQuantity(value)
    }
  }
  
  // 检查登录状态并执行操作
  const checkLoginAndExecute = (action: () => void) => {
    if (!isLogin || !user) {
      Modal.confirm({
        title: '请先登录',
        content: '您需要先登录才能执行此操作',
        okText: '去登录',
        cancelText: '取消',
        onOk: () => {
          navigate('/login', { state: { from: window.location.pathname } });
        }
      });
      return;
    }
    action();
  };

  
  const handleBuyNow = () => {
    checkLoginAndExecute(() => {
      history.push('/cart');
    });
  };
  
  const handleAddToCart = async () => {
    checkLoginAndExecute(async () => {
      // 调用添加到购物车API
      try {
        await addToCart({ productId: id, quantity: quantity });
        Message.success('已添加到购物车');
        history.push('/cart');
      } catch (error) {
        Message.error('添加失败，请重试');
      }
    });
  };
  
  // 打开添加到购物车模态框
  const openAddToCartModal = () => {
    setIsModalVisible(true);
  };
  
  
  if (!product) {
    return (
      <MainLayout>
        <div className={styles.loadingContainer}>
          <Text>商品加载中...</Text>
        </div>
      </MainLayout>
    )
  }
  
  return (
    <MainLayout>
      <div className={styles.productDetailContainer}>
        {/* 商品基本信息 */}
        <Row gutter={[24, 0]} className={styles.productInfoSection}>
          {/* 商品图片 */}
          <Col xs={24} md={12}>
            <Carousel className={styles.productCarousel} >
              {/* 合并cover和images数组，确保cover在最前面 */}
              {[product.cover, ...(product.images || [])].map((image: string, index: number) => (
                <div key={index} className={styles.carouselItem}>
                  <img src={'/object' + image} alt={`${product.name} - ${index + 1}`} className={styles.productImage} />
                </div>
              ))}
            </Carousel>
          </Col>
          
          {/* 商品信息 - 参考天猫详情页样式 */}
          <Col xs={24} md={12} className={styles.productInfo}>
            <div className={styles.tmallStyleInfo}>
              <Title level={3} className={styles.productName}>{product.name}</Title>
              
              <div className={styles.priceRow}>
                <div className={styles.priceMain}>
                  <Text className={styles.pricePrefix}>¥</Text>
                  <Text className={styles.currentPrice}>{product.price}</Text>
                </div>
              </div>
              
              <div className={styles.salesInfo}>
                <Text className={styles.salesText}>销量 {product.sales}</Text>
              </div>
              <div className={styles.productRating}>
                <IconStar /> 4.9 (256条评价)
              </div>
              
              
              <div className={styles.quantityRow}>
                <div className={styles.quantityLabel}>数量</div>
                <div className={styles.quantityControl}>
                  <InputNumber 
                    min={1} 
                    max={99} 
                    value={quantity} 
                    onChange={handleQuantityChange}
                    className={styles.quantityInput}
                    size="large"
                  />
                </div>
              </div>
              
              <div className={styles.actionButtons}>
                <Button 
                  type="primary" 
                  danger 
                  onClick={handleBuyNow}
                  size="large"
                  className={styles.buyNowButton}
                >
                  立即购买
                </Button>
                <Button type="text" icon={<IconHeart />} onClick={() => setIsFavorite(!isFavorite)}>
                  {isFavorite ? '已收藏' : '收藏'}
                </Button>
              </div>
            </div>
          </Col>
        </Row>
        
        <Divider />
        
        {/* 添加到购物车模态框 */}
        <Modal
          title="添加到购物车"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          centered
        >
          <div className={styles.modalContent}>
            <Text>商品已成功添加到购物车！</Text>
            <Button type="primary" onClick={() => setIsModalVisible(false)}>确定</Button>
          </div>
        </Modal>
      </div>
    </MainLayout>
  )
}