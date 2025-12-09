import { useState, useEffect } from 'react'
import {
  Grid,
  Typography,
  Button,
  Carousel,
  Message,
  InputNumber,
  Modal,
  Divider as ArcoDivider,
  Form,
  Select
} from '@arco-design/web-react'
import { useParams, useHistory } from 'react-router-dom'
import { useStore } from '@/store'
import MainLayout from '@/layout/product'
import styles from './index.module.less'
import {
  getProductDetail,
  type Product,
  type Address,
  getAddresses,
  buyProduct
} from '@/api'

const { Title, Text } = Typography

const { Col } = Grid

export default function ProductDetail() {
  const [form] = Form.useForm()

  const [adderssModelVisible, setAdderssModelVisible] = useState(false)
  const [adderssOptions, setAdderssOptions] = useState<Address[]>()
  const { id } = useParams<{ id: string }>()
  const history = useHistory()
  const { isLogin, userInfo } = useStore()
  const [product, setProduct] = useState<Product>()
  const [quantity, setQuantity] = useState(1)
  const [currentSlide, setCurrentSlide] = useState(0) // 当前选中的轮播图索引

  const [buyProductLoading, setBuyProductLoading] = useState(false)

  // 获取商品数据
  useEffect(() => {
    if (id)
      getProductDetail(id).then((res) => {
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
    if (!isLogin || !userInfo) {
      Modal.confirm({
        title: '请先登录',
        content: '您需要先登录才能执行此操作',
        okText: '去登录',
        cancelText: '取消',
        onOk: () => {
          history.push('/login', { from: window.location.pathname })
        }
      })
      return
    }
    action()
  }

  const handleBuyNow = () => {
    checkLoginAndExecute(() => {
      getAddresses().then((res) => {
        if(!res.data.items || res.data.items.length === 0) {
          Modal.confirm({
            title: '请添加收货地址',
            content: '您需要先添加收货地址才能执行此操作。',
            okText: '去添加',
            cancelText: '取消',
            onOk: () => {
              history.push('/user/address', { from: window.location.pathname })
            }
          })
        } else {
          setAdderssOptions(res.data.items)
          setAdderssModelVisible(true)
        }
      })
    })
  }

  if (!product) {
    return (
      <MainLayout>
        <div className={styles.loadingContainer}>
          <Text>商品加载中...</Text>
        </div>
      </MainLayout>
    )
  }

  const formatAddress = (address: Address | null | undefined) => {
    if (!address) return ''
    const { name, phone, area, detailedAddress } = address
    return (
      name +
      ',' +
      phone +
      ',' +
      area.replaceAll('/', '') +
      (detailedAddress || '')
    )
  }

  const handleOnSubmit = (values: any) => {
    setBuyProductLoading(true)
    buyProduct(product.id, values.addressId, quantity)
      .then((res) => {
        const { code, msg } = res as any

        if (code === 200) {
          setAdderssModelVisible(false)
          Message.success('购买商品成功')
        } else {
          Message.error(msg || '购买商品失败，请稍后重试')
        }
      })
      .catch(() => {
        Message.error('购买商品失败，请稍后重试')
      })
      .finally(() => {
        setBuyProductLoading(false)
      })
  }

  return (
    <MainLayout>
      {adderssModelVisible && (
        <Modal
          visible={adderssModelVisible}
          title="收货地址"
          onOk={() => form.submit()}
          confirmLoading={buyProductLoading}
          onCancel={() => setAdderssModelVisible(false)}
        >
          <Form form={form} onSubmit={handleOnSubmit}>
            <Form.Item field="addressId" required label="收货地址">
              <Select placeholder="请选择收货地址" defaultValue={0}>
                {adderssOptions?.map((option) => (
                  <Select.Option key={option.id} value={option.id}>
                    {formatAddress(option)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      )}
      <div className={styles.productDetailContainer}>
        {/* 商品基本信息 */}
        <div className={styles.tmallStyleContainer}>
          {/* 商品图片 */}
          <Col xs={24} md={12} className={styles.productImageSection}>
            <div className={styles.carouselContainer}>
              {/* 垂直小图预览 */}
              <div className={styles.thumbnailList}>
                {[product.cover, ...(product.images || [])].map(
                  (image: string, index: number) => (
                    <div
                      key={index}
                      className={`${styles.thumbnailItem} ${currentSlide === index ? styles.activeThumbnail : ''}`}
                      onMouseEnter={() => {
                        setCurrentSlide(index)
                      }}
                    >
                      <img
                        src={'/object' + image}
                        alt={`${product.name} - ${index + 1}`}
                        className={styles.thumbnailImage}
                      />
                    </div>
                  )
                )}
              </div>

              {/* 主轮播图 */}
              <Carousel
                className={styles.productCarousel}
                onChange={setCurrentSlide}
                currentIndex={currentSlide}
              >
                {/* 合并cover和images数组，确保cover在最前面 */}
                {[product.cover, ...(product.images || [])].map(
                  (image: string, index: number) => (
                    <div key={index} className={styles.carouselItem}>
                      <img
                        src={'/object' + image}
                        alt={`${product.name} - ${index + 1}`}
                        className={styles.productImage}
                      />
                    </div>
                  )
                )}
              </Carousel>
            </div>
          </Col>

          {/* 商品信息 - 参考天猫详情页样式 */}
          <Col xs={24} md={12} className={styles.productInfoSection}>
            <div className={styles.productInfoInner}>
              {/* 商品名称 */}
              <div className={styles.productNameContainer}>
                <Title heading={4} className={styles.productName}>
                  {product.name}
                </Title>
              </div>

              {/* 价格区域 */}
              <div className={styles.priceContainer}>
                <div className={styles.priceMain}>
                  <Text className={styles.pricePrefix}>¥</Text>
                  <Text className={styles.currentPrice}>
                    {Number(product.price)}
                  </Text>
                </div>
              </div>

              {/* 商品信息行 */}
              <div className={styles.infoRow}>
                <div className={styles.infoLabel}>销量</div>
                <div className={styles.infoValue}>{product.sales}</div>
              </div>

              <ArcoDivider style={{ margin: '16px 0' }} />

              {/* 数量选择 */}
              <div className={styles.quantityContainer}>
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

              <ArcoDivider style={{ margin: '16px 0' }} />

              {/* 操作按钮 */}
              <div className={styles.actionButtons}>
                <Button
                  type="primary"
                  onClick={handleBuyNow}
                  size="large"
                  className={styles.buyNowButton}
                >
                  立即购买
                </Button>
              </div>
            </div>
          </Col>
        </div>
      </div>
    </MainLayout>
  )
}
