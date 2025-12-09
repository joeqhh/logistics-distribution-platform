import { Avatar, Dropdown, Menu, Message } from '@arco-design/web-react'
import { IconPoweroff } from '@arco-design/web-react/icon'
import { useStore } from '@/store'
import styles from './style/index.module.less'
import useStorage from '@/utils/useStorage'
import { removeToken } from '@/utils/authentication'
import Logo from '@/assets/logo.png'

function Navbar({ show }: { show: boolean }) {
  const { userInfo, updateUserInfo } = useStore()

  const [_, setUserStatus] = useStorage('mStatus')

  function logout() {
    setUserStatus('logout')
    removeToken()
    window.location.href = '/login'
  }

  function onMenuItemClick(key: string) {
    if (key === 'logout') {
      logout()
    } else {
      Message.info(`You clicked ${key}`)
    }
  }

  const droplist = (
    <Menu onClickMenuItem={onMenuItemClick}>
      <Menu.Item key="logout">
        <IconPoweroff className={styles['dropdown-icon']} />
        退出登录
      </Menu.Item>
    </Menu>
  )

  return (
    <div className={styles.navbar}>
      <div className={styles.left}>
        <div className={styles.logo}>
          {/* <Logo /> */}
          <div className={styles['logo-icon']}>
            <img src={Logo} alt="" />
          </div>
        </div>
      </div>
      <ul className={styles.right}>
        <li>
          <Dropdown droplist={droplist} position="br">
            <Avatar size={32} style={{ cursor: 'pointer' }}>
              <img
                alt="avatar"
                src={
                  userInfo?.avatar ? `/object/${userInfo?.avatar}` : undefined
                }
              />
            </Avatar>
          </Dropdown>
        </li>
      </ul>
    </div>
  )
}

export default Navbar
