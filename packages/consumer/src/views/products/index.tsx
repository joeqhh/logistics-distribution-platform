import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Input, Button, Select, Pagination, Tag, Checkbox, Space } from '@arco-design/web-react'
import { IconSearch, IconShoppingCart, IconHeart, IconFilter } from '@arco-design/web-react/icon'
import { Link, useSearchParams, useParams } from 'react-router'
import MainLayout from '@/layout'
import styles from './index.module.less'

const { Search } = Input
const { Option } = Select

// 模拟商品数据
const mockProducts = [
  {
    id: '1',
    name: '新鲜苹果 红富士 5斤装',
    price: 12.9,
    originalPrice: 19.9,
    discount: '6.5折',
    image: 'https://gw.alipayobjects.com/zos/rmsportal/XuVpGqBFxXplzvLjJBZB.svg',
    sales: 1234,
    category: '1',
    rating: 4.8
  },
  {
    id: '2',
    name: '进口牛排 西冷 200g/份',
    price: 88.0,
    originalPrice: 128.0,
    discount: '6.9折',
    image: 'https://gw.alipayobjects.com/zos/rmsportal/XuVpGqBFxXplzvLjJBZB.svg',
    sales: 567,
    category: '5',
    rating: 4.9
  },
  {
    id: '3',
    name: '精选大米 五常大米 5kg',
    price: 59.9,
    originalPrice: 79.9,
    discount: '7.5折',
    image: 'https://gw.alipayobjects.com/zos/rmsportal/XuVpGqBFxXplzvLjJBZB.svg',
    sales: 890,
    category: '4',
    rating: 4.7
  },
  {
    id: '4',
    name: '有机蔬菜套装 3斤装',
    price: 39.9,
    originalPrice: 49.9,
    discount: '8.0折',
    image: 'https://gw.alipayobjects.com/zos/rmsportal/XuVpGqBFxXplzvLjJBZB.svg',
    sales: 678,
    category: '6',
    rating: 4.6
  },
  {
    id: '5',
    name: '纯牛奶 250ml*24盒',
    price: 55.9,
    originalPrice: 69.9,
    discount: '8.0折',
    image: 'https://gw.alipayobjects.com/zos/rmsportal/XuVpGqBFxXplzvLjJBZB.svg',
    sales: 1567,
    category: '7',
    rating: 4.8
  },
  {
    id: '6',
    name: '坚果礼盒 混合装 1kg',
    price: 89.9,
    originalPrice: 119.9,
    discount: '7.5折',
    image: 'https://gw.alipayobjects.com/zos/rmsportal/XuVpGqBFxXplzvLjJBZB.svg',
    sales: 432,
    category: '2',
    rating: 4.7
  },
  {
    id: '7',
    name: '矿泉水 550ml*24瓶',
    price: 29.9,
    originalPrice: 39.9,
    discount: '7.5折',
    image: 'https://gw.alipayobjects.com/zos/rmsportal/XuVpGqBFxXplzvLjJBZB.svg',
    sales: 2345,
    category: '3',
    rating: 4.5
  },
  {
    id: '8',
    name: '橄榄油 500ml',
    price: 79.9,
    originalPrice: 109.9,
    discount: '7.3折',
    image: 'https://gw.alipayobjects.com/zos/rmsportal/XuVpGqBFxXplzvLjJBZB.svg',
    sales: 345,
    category: '4',
    rating: 4.8
  },
  {
    id: '9',
    name: '新鲜香蕉 10斤装',
    price: 25.9,
    originalPrice: 35.9,
    discount: '7.2折',
    image: 'https://gw.alipayobjects.com/zos/rmsportal/XuVpGqBFxXplzvLjJBZB.svg',
    sales: 987,
    category: '1',
    rating: 4.6
  },
  {
    id: '10',
    name: '巧克力礼盒 200g',
    price: 49.9,
    originalPrice: 69.9,
    discount: '7.1折',
    image: 'https://gw.alipayobjects.com/zos/rmsportal/XuVpGqBFxXplzvLjJBZB.svg',
    sales: 543,
    category: '2',
    rating: 4.9
  },
  {
    id: '11',
    name: '啤酒 500ml*12瓶',
    price: 69.9,
    originalPrice: 89.9,
    discount: '7.8折',
    image: 'https://gw.alipayobjects.com/zos/rmsportal/XuVpGqBFxXplzvLjJBZB.svg',
    sales: 678,
    category: '3',
    rating: 4.7
  },
  {
    id: '12',
    name: '鸡蛋 30枚装',
    price: 39.9,
    originalPrice: 49.9,
    discount: '8.0折',
    image: 'https://gw.alipayobjects.com/zos/rmsportal/XuVpGqBFxXplzvLjJBZB.svg',
    sales: 1234,
    category: '5',
    rating: 4.8
  }
]

// 价格区间选项
const priceRanges = [
  { label: '全部价格', value: 'all' },
  { label: '0-50元', value: '0-50' },
  { label: '50-100元', value: '50-100' },
  { label: '100-200元', value: '100-200' },
  { label: '200元以上', value: '200+' }
]

// 排序选项
const sortOptions = [
  { label: '综合排序', value: 'default' },
  { label: '销量从高到低', value: 'sales_desc' },
  { label: '价格从低到高', value: 'price_asc' },
  { label: '价格从高到低', value: 'price_desc' },
  { label: '评分从高到低', value: 'rating_desc' }
]

export default function Products() {
  const [searchParams] = useSearchParams()
  const params = useParams<{ id: string }>()
  const categoryId = params.id
  const keyword = searchParams.get('keyword') || ''
  
  const [products, setProducts] = useState(mockProducts)
  const [filteredProducts, setFilteredProducts] = useState(mockProducts)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(8)
  const [sortBy, setSortBy] = useState('default')
  const [priceRange, setPriceRange] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [discountOnly, setDiscountOnly] = useState(false)
  
  // 筛选和排序商品
  useEffect(() => {
    let filtered = [...products]
    
    // 按分类筛选
    if (categoryId) {
      filtered = filtered.filter(p => p.category === categoryId)
    }
    
    // 按关键词搜索
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(lowerKeyword)
      )
    }
    
    // 按价格区间筛选
    if (priceRange !== 'all') {
      if (priceRange === '0-50') {
        filtered = filtered.filter(p => p.price >= 0 && p.price <= 50)
      } else if (priceRange === '50-100') {
        filtered = filtered.filter(p => p.price > 50 && p.price <= 100)
      } else if (priceRange === '100-200') {
        filtered = filtered.filter(p => p.price > 100 && p.price <= 200)
      } else if (priceRange === '200+') {
        filtered = filtered.filter(p => p.price > 200)
      }
    }
    
    // 只看有折扣的商品
    if (discountOnly) {
      filtered = filtered.filter(p => p.originalPrice > p.price)
    }
    
    // 排序
    switch (sortBy) {
      case 'sales_desc':
        filtered.sort((a, b) => b.sales - a.sales)
        break
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating_desc':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      default:
        // 综合排序（可以根据实际需求调整）
        filtered.sort((a, b) => b.sales - a.sales)
    }
    
    setFilteredProducts(filtered)
    setCurrentPage(1) // 重置到第一页
  }, [categoryId, keyword, sortBy, priceRange, discountOnly, products])
  
  // 分页处理
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentProducts = filteredProducts.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredProducts.length / pageSize)
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  
  const handleSortChange = (value: string) => {
    setSortBy(value)
  }
  
  const handlePriceRangeChange = (value: string) => {
    setPriceRange(value)
  }
  
  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }
  
  return (
    <MainLayout>
      <div className={styles.productsContainer}>
        {/* 搜索和筛选栏 */}
        <div className={styles.searchFilterBar}>
          <div className={styles.searchContainer}>
            <Search
              placeholder="搜索商品"
              allowClear
              value={keyword}
              onSearch={(value) => {
                // 可以在这里处理搜索逻辑
                console.log('搜索:', value)
              }}
              className={styles.search}
              prefix={<IconSearch />}
            />
          </div>
          
          <div className={styles.filterContainer}>
            <Button 
              icon={<IconFilter />} 
              onClick={toggleFilters}
              className={styles.filterButton}
            >
              筛选
            </Button>
            
            <Select 
              defaultValue="default" 
              style={{ width: 150 }} 
              onChange={handleSortChange}
              className={styles.sortSelect}
            >
              {sortOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        </div>
        
        {/* 高级筛选面板 */}
        {showFilters && (
          <div className={styles.filterPanel}>
            <div className={styles.filterSection}>
              <h3 className={styles.filterTitle}>价格区间</h3>
              <Select 
                defaultValue="all" 
                style={{ width: 150 }} 
                onChange={handlePriceRangeChange}
              >
                {priceRanges.map(range => (
                  <Option key={range.value} value={range.value}>
                    {range.label}
                  </Option>
                ))}
              </Select>
            </div>
            
            <div className={styles.filterSection}>
              <Checkbox 
                checked={discountOnly} 
                onChange={(e) => setDiscountOnly(e.target.checked)}
              >
                只看有折扣
              </Checkbox>
            </div>
          </div>
        )}
        
        {/* 商品列表 */}
        <div className={styles.productListContainer}>
          {filteredProducts.length > 0 ? (
            <>
              <div className={styles.resultInfo}>
                <span>找到 {filteredProducts.length} 个商品</span>
              </div>
              
              <Row gutter={[16, 16]}>
                {currentProducts.map(product => (
                  <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                    <Card
                      hoverable
                      className={styles.productCard}
                      cover={
                        <Link to={`/product/${product.id}`}>
                          <img alt={product.name} src={product.image} className={styles.productImage} />
                        </Link>
                      }
                    >
                      {product.originalPrice > product.price && (
                        <div className={styles.productDiscount}>
                          <Tag color="red">{product.discount}</Tag>
                        </div>
                      )}
                      
                      <Link to={`/product/${product.id}`} className={styles.productNameLink}>
                        <h3 className={styles.productName}>{product.name}</h3>
                      </Link>
                      
                      <div className={styles.productRating}>
                        <Tag color="orange">{product.rating}</Tag>
                      </div>
                      
                      <div className={styles.productPrice}>
                        <span className={styles.currentPrice}>¥{product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className={styles.originalPrice}>¥{product.originalPrice}</span>
                        )}
                      </div>
                      
                      <div className={styles.productFooter}>
                        <span className={styles.productSales}>已售{product.sales}</span>
                        <div className={styles.productActions}>
                          <Button type="text" icon={<IconHeart />} size="small" className={styles.actionButton} />
                        <Button type="primary" icon={<IconShoppingCart />} size="small" className={styles.addToCartButton}>
                            加入购物车
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
              
              {/* 分页 */}
              {totalPages > 1 && (
                <div className={styles.paginationContainer}>
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredProducts.length}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showTotal={(total) => `共 ${total} 条`}
                  />
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyResult}>
              <p>暂无符合条件的商品</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}