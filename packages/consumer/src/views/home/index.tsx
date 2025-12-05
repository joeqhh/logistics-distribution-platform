import { useEffect ,useState} from 'react'
import { Carousel, Card, Row, Col, Typography, Tag, Button } from '@arco-design/web-react'
import MainLayout from '@/layout'
import styles from './index.module.less'
import { getProducts } from '@/api/productAPI'
import {type Product} from '@/api'
import { useHistory } from 'react-router-dom'

export default function Home() {
  const history = useHistory()
  
  const [products, setProducts] = useState<Product[]>([])
  
  useEffect(() => {
    getProducts().then(res => {
      console.log(res);
      setProducts(res.data.products)
    })
  },[])

  return (
    <MainLayout>
      <div className={styles.homeContainer}>

        {/* 热门商品 */}
        <div className={styles.productsContainer}>
          <Row gutter={[16, 16]}>
            {products.map(product => (
              <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                <Card
              hoverable
              onClick={() => history.push(`/product/${product.id}`)}
              className={styles.productCard}
              cover={<img alt={product.name} src={'/object' + product.cover} className={styles.productImage} />}
              bodyStyle={{ padding: '12px' }}
                >
                    <h3 className={styles.productName}>{product.name}</h3>
                    <div className={styles.productPrice}>¥{product.price}</div>
                    <div className={styles.productTags}>
                      <Tag color="primary">限时特惠</Tag>
                    </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

      </div>
    </MainLayout>
  )
}