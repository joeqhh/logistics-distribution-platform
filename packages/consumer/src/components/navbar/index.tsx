import { Menu, Avatar, Dropdown, Button } from '@arco-design/web-react'
import { IconPoweroff } from '@arco-design/web-react/icon'
import { Link, useHistory } from 'react-router-dom'
import { useStore } from '@/store'
import styles from './index.module.less'

export default function Navbar() {
  const isLogin = useStore((state) => state.isLogin)
  const logout = useStore((state) => state.logout)
  const userInfo = useStore((state) => state.userInfo)

  const history = useHistory()

  function onMenuItemClick(key: string) {
    if (key === 'logout') {
      logout()
    }
  }

  return (
    <>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <Link to="/">
            <img src="/logo.png" alt="Logo" className={styles.logoText} />
          </Link>
        </div>
        <div className={styles.userContainer}>
          <Button type="text" onClick={() => history.push('/user')}>我的订单</Button>
          {isLogin ? (
            <Dropdown
              droplist={
                <Menu onClickMenuItem={onMenuItemClick}>
                  <Menu.Item key="logout">
                    <IconPoweroff className={styles['dropdown-icon']} />
                    退出登录
                  </Menu.Item>
                </Menu>
              }
              position="br"
            >
              <Avatar size={32} style={{ cursor: 'pointer' }}>
                <img
                  alt="avatar"
                  src={
                    userInfo?.avatar ? `/object/${userInfo?.avatar}` : undefined
                  }
                />
              </Avatar>
            </Dropdown>
          ) : (
            <Link to="/login" className={styles.loginButton}>
              <Button type="text">登录/注册</Button>
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
