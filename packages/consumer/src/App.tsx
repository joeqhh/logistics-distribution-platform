import {
  BrowserRouter,
  Switch,
  Route,
  useHistory,
  useLocation
} from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import './App.css'

// 懒加载路由组件
const Home = lazy(() => import('./views/home'))
const Login = lazy(() => import('./views/login'))
const Register = lazy(() => import('./views/register'))
const Logistics = lazy(() => import('./views/logistics'))
const ProductDetail = lazy(() => import('./views/productDetail'))
const UserLayout = lazy(() => import('@/layout/user'))
const ProtectedRoute = lazy(() =>
  import('./components/auth').then((m) => ({ default: m.ProtectedRoute }))
)

const setPageTitle = (pathname: string) => {
  let title = '电商物流配送平台'
  // 根据路由设置不同的title
  if (pathname === '/') {
    title = '首页 - 电商物流配送平台'
  } else if (pathname === '/login') {
    title = '登录 - 电商物流配送平台'
  } else if (pathname === '/register') {
    title = '注册 - 电商物流配送平台'
  } else if (pathname.startsWith('/product/')) {
    title = '商品详情 - 电商物流配送平台'
  } else if (pathname.startsWith('/logistics/')) {
    title = '物流详情 - 电商物流配送平台'
  }
  document.title = title
}

// 路由title更新组件
const TitleUpdater = () => {
  const { pathname } = useLocation()

  useEffect(() => {

    setPageTitle(pathname)
  }, [pathname])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <TitleUpdater />
      <Suspense fallback={<div>Loading...</div>}>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/logistics/:orderId" component={Logistics} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route path="/user">
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          </Route>
          {/* 默认重定向到首页 */}
          <Route path="*" render={() => <Home />} />
        </Switch>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
