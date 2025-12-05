import React from 'react'
import { Layout, Menu, Input, Badge, Avatar, Dropdown, Button } from '@arco-design/web-react'
import { IconShoppingCart, IconSearch, IconUser } from '@arco-design/web-react/icon'
import { Link } from 'react-router';
import { useHistory } from 'react-router-dom'
import { useAppStore } from '@/store'
import styles from './index.module.less'

const { Header, Content, Footer } = Layout
const { Search } = Input

interface LayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: LayoutProps) {
  const { isLogin, user, logout } = useAppStore()
  const history = useHistory()
  
  // 计算购物车商品总数量

  const handleSearch = (value: string) => {
    console.log('搜索:', value)
    history.push(`/products?keyword=${value}`)
  }

  const menuItems = [
    {
      key: '1',
      label: <Link to="/user/profile">个人信息</Link>
    },
    {
      key: '2',
      label: <Link to="/user/address">收货地址</Link>
    },
    {
      key: '3',
      label: <Link to="/user/orders">我的订单</Link>
    },
    {
      key: '4',
      label: '退出登录',
      onClick: () => {
        history.push('/login')
        logout()
      }
    }
  ]

  const userMenu = (
    <Menu items={menuItems} />
  )

  return (
    <Layout className={styles.layout} style={{backgroundColor: '#fff'}}>
      <Header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <Link to="/">
              <span className={styles.logoText}>物流商城</span>
            </Link>
          </div>
          
          <div className={styles.searchContainer}>
            <Input.Search
              placeholder="搜索商品"
              allowClear
              style={{ width: 300 }}
              onSearch={handleSearch}
              prefix={<IconSearch />}
            />
          </div>
          
          <div className={styles.userContainer}>
            <Badge count={cartItemCount}>
              <Button type="text" icon={<IconShoppingCart />} />
            </Badge>
            {isLogin ? (
              <Dropdown overlay={userMenu} trigger={['click']}>
                <Button type="text" icon={<IconUser />}>
                  {user?.username || '用户'}
                </Button>
              </Dropdown>
            ) : (
              <Link to="/login" className={styles.loginButton}>
                <Button type="text">登录/注册</Button>
              </Link>
            )}
            
          </div>
        </div>
      </Header>
      
      <Content className={styles.content}>
        {children}
      </Content>
      
      <Footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerInfo}>
            <p>© 2024 物流配送平台 版权所有</p>
          </div>
          <div className={styles.footerLinks}>
            <a href="#">关于我们</a>
            <a href="#">联系我们</a>
            <a href="#">隐私政策</a>
          </div>
        </div>
      </Footer>
    </Layout>
  )
}