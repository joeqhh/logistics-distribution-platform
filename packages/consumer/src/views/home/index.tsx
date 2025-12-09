import { useEffect ,useState} from 'react'
import { Carousel, Card, Typography, Tag, Button } from '@arco-design/web-react'
import MainLayout from '@/layout/product'
import styles from './index.module.less'
import { getProducts } from '@/api'
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
            <div className={styles.productGrid}>
              {products.map(product => (
                <div key={product.id} className={styles.productGridItem}>
                  <Card
                    hoverable
                    onClick={() => history.push(`/product/${product.id}`)}
                    className={styles.productCard}
                    cover={<img alt={product.name} src={'/object' + product.cover} className={styles.productImage} />}
                    bodyStyle={{ padding: '12px 0' }}
                  >
                    <div className={styles.productNameWrapper}>

                    <span className={styles.productName}>{product.name}</span>
                    </div>
                    <div className={styles.productPrice}>¥{Number(product.price)}</div>
                  </Card>
                </div>
              ))}
            </div>
          </div>

      </div>
    </MainLayout>
  )
}