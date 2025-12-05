import { useState, useMemo, useRef, useEffect } from 'react'
import { Switch, Route, Redirect, useHistory } from 'react-router-dom'
import { Layout, Menu, Breadcrumb, Spin } from '@arco-design/web-react'
import {
  IconApps,
  IconOrderedList,
  IconMenuFold,
  IconMenuUnfold,
  IconLocation,
  IconUser
} from '@arco-design/web-react/icon'
import { useStore } from '@/store'
import qs from 'query-string'
import NProgress from 'nprogress'
import useRoute, { IRoute } from '@/routes'
import { isArray } from '@/utils/is'
import getUrlParams from '@/utils/getUrlParams'
import lazyload from '@/utils/lazyload' // 使用@路径别名导入，确保能正确解析.tsx文件
import 'nprogress/nprogress.css'
import Header from './header'

import styles from './index.module.less'

const MenuItem = Menu.Item
const SubMenu = Menu.SubMenu

const Sider = Layout.Sider
const Content = Layout.Content

function getIconFromKey(key: string) {
  switch (key) {
    case 'product':
      return <IconApps className={styles.icon} />
    case 'order':
      return <IconOrderedList className={styles.icon} />
    case 'address':
      return <IconLocation className={styles.icon} />
    case 'user':
      return <IconUser className={styles.icon} />
    default:
      return <div className={styles['icon-empty']} />
  }
}

function getFlattenRoutes(routes: IRoute[]) {
  const mod: any = import.meta.glob('../views/**/[a-z[]*.tsx')
  const res: IRoute[] = []
  function travel(_routes: IRoute[]) {
    _routes.forEach((route) => {
      if (route.key && !route.children) {
        // route.component = lazyload(React.lazy(mod[`/src/views/${route.key}/index.tsx`]));
        route.component = lazyload(mod[`../views/${route.key}/index.tsx`])
        res.push(route)
      } else if (
        route.children &&
        isArray(route.children) &&
        route.children.length
      ) {
        travel(route.children)
      }
    })
  }
  travel(routes)
  return res
}

function PageLayout() {
  const urlParams = getUrlParams()
  const history = useHistory()
  const pathname = history.location.pathname
  const currentComponent = qs.parseUrl(pathname).url.slice(1)
  const { settings, userLoading, initUserInfo } = useStore()

  const [routes, defaultRoute] = useRoute({})
  const defaultSelectedKeys = [currentComponent || defaultRoute]
  const paths = (currentComponent || defaultRoute).split('/')
  const defaultOpenKeys = paths.slice(0, paths.length - 1)

  const [breadcrumb, setBreadCrumb] = useState<(string | React.ReactNode)[]>([])
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [selectedKeys, setSelectedKeys] =
    useState<string[]>(defaultSelectedKeys)
  const [openKeys, setOpenKeys] = useState<string[]>(defaultOpenKeys)

  const routeMap = useRef<Map<string, React.ReactNode[]>>(new Map())
  const menuMap = useRef<
    Map<string, { menuItem?: boolean; subMenu?: boolean }>
  >(new Map())

  const navbarHeight = 60
  const menuWidth = collapsed ? 48 : settings?.menuWidth

  const showMenu = settings?.menu && urlParams.menu !== false

  const flattenRoutes = useMemo(() => getFlattenRoutes(routes) || [], [routes])

  function onClickMenuItem(key: string) {
    const currentRoute = flattenRoutes.find((r) => r.key === key)!
    const component = currentRoute.component
    const preload = component.preload()
    NProgress.start()

    preload.then(() => {
      history.push(currentRoute.path ? currentRoute.path : `/${key}`)
      NProgress.done()
    })
  }

  function toggleCollapse() {
    setCollapsed((collapsed) => !collapsed)
  }

  const paddingLeft = { paddingLeft: menuWidth }
  const paddingTop = { paddingTop: navbarHeight }
  const paddingStyle = { ...paddingLeft, ...paddingTop }

  function renderRoutes() {
    routeMap.current.clear()
    return function travel(
      _routes: IRoute[],
      level: number,
      parentNode: (string | React.ReactNode)[] = []
    ) {
      return _routes.map((route) => {
        const { breadcrumb = true, ignore } = route
        const iconDom = getIconFromKey(route.key)
        const titleDom = (
          <>
            {iconDom} {route.name}
          </>
        )

        routeMap.current.set(
          `/${route.key}`,
          breadcrumb ? [...parentNode, route.name] : []
        )

        const visibleChildren = (route.children || []).filter((child) => {
          const { ignore, breadcrumb = true } = child
          if (ignore || route.ignore) {
            routeMap.current.set(
              `/${child.key}`,
              breadcrumb ? [...parentNode, route.name, child.name] : []
            )
          }

          return !ignore
        })

        if (ignore) {
          return ''
        }
        if (visibleChildren.length) {
          menuMap.current.set(route.key, { subMenu: true })
          return (
            <SubMenu key={route.key} title={titleDom}>
              {travel(visibleChildren, level + 1, [...parentNode, route.name])}
            </SubMenu>
          )
        }
        menuMap.current.set(route.key, { menuItem: true })
        return <MenuItem key={route.key}>{titleDom}</MenuItem>
      })
    }
  }

  function updateMenuStatus() {
    const pathKeys = pathname.split('/')
    const newSelectedKeys: string[] = []
    const newOpenKeys: string[] = [...openKeys]
    while (pathKeys.length > 0) {
      const currentRouteKey = pathKeys.join('/')
      const menuKey = currentRouteKey.replace(/^\//, '')
      const menuType = menuMap.current.get(menuKey)
      if (menuType && menuType.menuItem) {
        newSelectedKeys.push(menuKey)
      }
      if (menuType && menuType.subMenu && !openKeys.includes(menuKey)) {
        newOpenKeys.push(menuKey)
      }
      pathKeys.pop()
    }
    setSelectedKeys(newSelectedKeys)
    setOpenKeys(newOpenKeys)
  }

  useEffect(() => {
    const routeConfig = routeMap.current.get(pathname)
    setBreadCrumb(routeConfig || [])
    updateMenuStatus()
  }, [pathname])

  useEffect(() => {
    initUserInfo()
  }, [])

  return (
    <Layout className={styles.layout}>
      <Header />
      {userLoading ? (
        <Spin className={styles['spin']} />
      ) : (
        <Layout>
          {showMenu && (
            <Sider
              className={styles['layout-sider']}
              width={menuWidth}
              collapsed={collapsed}
              onCollapse={setCollapsed}
              trigger={null}
              collapsible
              breakpoint="xl"
              style={paddingTop}
            >
              <div className={styles['menu-wrapper']}>
                <Menu
                  collapse={collapsed}
                  onClickMenuItem={onClickMenuItem}
                  selectedKeys={selectedKeys}
                  openKeys={openKeys}
                  onClickSubMenu={(_: any, openKeys: string[]) => {
                    setOpenKeys(openKeys)
                  }}
                >
                  {renderRoutes()(routes, 1)}
                </Menu>
              </div>
              <div className={styles['collapse-btn']} onClick={toggleCollapse}>
                {collapsed ? <IconMenuUnfold /> : <IconMenuFold />}
              </div>
            </Sider>
          )}
          <Layout className={styles['layout-content']} style={paddingStyle}>
            <div className={styles['layout-content-wrapper']}>
              {!!breadcrumb.length && (
                <div className={styles['layout-breadcrumb']}>
                  <Breadcrumb>
                  <Breadcrumb.Item key={-1}>
                    {getIconFromKey(pathname.split('/')[1])}
                  </Breadcrumb.Item>
                    {breadcrumb.map((node, index) => (
                      <Breadcrumb.Item key={index}>{node}</Breadcrumb.Item>
                    ))}
                  </Breadcrumb>
                </div>
              )}
              <Content
                style={{
                  backgroundColor: 'var(--color-bg-2)',
                  padding: '20px',
                  flex: 1
                }}
              >
                <Switch>
                  {flattenRoutes.map((route, index) => {
                    return (
                      <Route
                        key={index}
                        path={`/${route.key}`}
                        component={route.component}
                      />
                    )
                  })}
                  <Route exact path="/">
                    <Redirect to={`/${defaultRoute}`} />
                  </Route>
                  <Route
                    path="*"
                    component={lazyload(() => import('@/views/exception/403'))}
                  />
                </Switch>
              </Content>
            </div>
          </Layout>
        </Layout>
      )}
    </Layout>
  )
}

export default PageLayout
