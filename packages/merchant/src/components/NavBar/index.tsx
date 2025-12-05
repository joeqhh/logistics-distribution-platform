import React, { useContext, useEffect } from 'react';
import {
  Tooltip,
  Input,
  Avatar,
  Select,
  Dropdown,
  Menu,
  Divider,
  Message,
  Button,
} from '@arco-design/web-react';
import {
  IconLanguage,
  IconNotification,
  IconSunFill,
  IconMoonFill,
  IconUser,
  IconSettings,
  IconPoweroff,
  IconExperiment,
  IconDashboard,
  IconInteraction,
  IconTag,
} from '@arco-design/web-react/icon';
import { useStore } from '@/store';
// import { GlobalContext } from '@/context';
// import Logo from '@/assets/logo.svg';
// import MessageBox from '@/components/MessageBox';
import IconButton from './IconButton';
// import Settings from '../Settings';
import styles from './style/index.module.less';
import useStorage from '@/utils/useStorage';
import { generatePermission } from '@/routes';
import Logo from '@/assets/logo.png'


function Navbar({ show }: { show: boolean }) {
  const { userInfo, updateUserInfo } = useStore();

  const [_, setUserStatus] = useStorage('userStatus');
  const [role, setRole] = useStorage('userRole', 'admin');

  // const { setLang, lang, theme, setTheme } = useContext(GlobalContext);

  function logout() {
    setUserStatus('logout');
    window.location.href = '/login';
  }

  function onMenuItemClick(key: string) {
    if (key === 'logout') {
      logout();
    } else {
      Message.info(`You clicked ${key}`);
    }
  }

  // useEffect(() => {
  //   updateUserInfo({
  //     ...userInfo,
  //     permissions: generatePermission(role),
  //   });
  // }, [role]);

  // if (!show) {
  //   return (
  //     <div className={styles['fixed-settings']}>
  //       <Settings
  //         trigger={
  //           <Button icon={<IconSettings />} type="primary" size="large" />
  //         }
  //       />
  //     </div>
  //   );
  // }

  const handleChangeRole = () => {
    const newRole = role === 'admin' ? 'user' : 'admin';
    setRole(newRole);
  };

  const droplist = (
    <Menu onClickMenuItem={onMenuItemClick}>
      <Menu.Item key="logout">
        <IconPoweroff className={styles['dropdown-icon']} />
        退出登录
      </Menu.Item>
    </Menu>
  );

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
                <img alt="avatar" src={userInfo?.avatar ? `/object/${userInfo?.avatar}` : undefined} />
              </Avatar>
            </Dropdown>
          </li>
      </ul>
    </div>
  );
}

export default Navbar;
