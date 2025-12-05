import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Menu, Dropdown, Badge, Button, Drawer } from '@arco-design/web-react';
import { IconShoppingCart, IconUser, IconMenu, IconClose, IconHome, IconTag, IconSearch } from '@arco-design/web-react/icon';
import { useAppStore } from '../../store';
import styles from './index.module.less';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, cartItems } = useAppStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const history = useHistory();

  // 计算购物车商品总数
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // 用户菜单选项
  const userMenuItems = [
    { key: '1', label: <Link to="/user-profile">个人中心</Link> },
    { key: '2', label: <Link to="/address-management">地址管理</Link> },
    { key: '3', label: <Link to="/user/orders">我的订单</Link> },
    { key: '4', label: '退出登录', danger: true, onClick: () => {
      logout();
      history.push('/');
    }},
  ];

  // 移动端菜单选项
  const mobileMenuItems = [
    { key: 'home', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
    { key: 'products', icon: <TagOutlined />, label: <Link to="/products">商品分类</Link> },
    { key: 'cart', icon: <ShoppingCartOutlined />, label: <Link to="/cart">购物车</Link> },
    ...(isAuthenticated ? userMenuItems : [
      { key: 'login', label: <Link to="/login">登录</Link> },
    { key: 'register', label: <Link to="/register">注册</Link> },
    ]),
  ];

  const userMenu = (
    <Menu items={userMenuItems} />
  );

  const handleSearchClick = () => {
    navigate('/products');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* 移动端菜单按钮 */}
        <Button 
          type="text" 
          className={styles.mobileMenuButton} 
          icon={<MenuOutlined />}
          onClick={() => setIsMobileMenuOpen(true)}
        />

        {/* Logo */}
        <Link to="/" className={styles.logo}>
          仿淘宝商城
        </Link>

        {/* 桌面端导航链接 */}
        <div className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>首页</Link>
          <Link to="/products" className={styles.navLink}>商品分类</Link>
        </div>

        {/* 搜索按钮 */}
        <div className={styles.searchButton} onClick={handleSearchClick}>
          <SearchOutlined />
          <span>搜索商品</span>
        </div>

        {/* 用户操作区 */}
        <div className={styles.userActions}>
          {/* 购物车 */}
          <Link to="/cart" className={styles.cartButton}>
            <Badge count={cartItemCount} showZero>
              <IconShoppingCart />
            </Badge>
            <span className={styles.actionText}>购物车</span>
          </Link>

          {/* 用户菜单 */}
          {isAuthenticated ? (
            <Dropdown overlay={userMenu} trigger={['click']}>
              <Button type="text" icon={<IconUser />}>
                {user?.username || '用户'}
              </Button>
            </Dropdown>
          ) : (
            <>
              <Link to="/login" className={styles.loginButton}>
                登录
              </Link>
              <Link to="/register" className={styles.registerButton}>
                注册
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 移动端侧边菜单 */}
      <Drawer
      title="菜单"
      placement="left"
      onCancel={() => setIsMobileMenuOpen(false)}
      open={isMobileMenuOpen}
      className={styles.mobileDrawer}
      drawerStyle={{ padding: 0, width: '80%', maxWidth: '300px' }}
    >
        <div className={styles.mobileDrawerContent}>
          <div className={styles.mobileDrawerHeader}>
            <span>仿淘宝商城</span>
            <Button 
              type="text" 
              icon={<CloseOutlined />}
              onClick={() => setIsMobileMenuOpen(false)}
              className={styles.closeButton}
            />
          </div>
          <Menu
            mode="vertical"
            items={mobileMenuItems}
            className={styles.mobileMenu}
          />
        </div>
      </Drawer>
    </nav>
  );
};

export default Navbar;