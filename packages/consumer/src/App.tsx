import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import './App.css'

// 懒加载路由组件
const Home = lazy(() => import('./views/home'))
const Login = lazy(() => import('./views/login'))
const Register = lazy(() => import('./views/register'))
const Products = lazy(() => import('./views/products'))
const ProductDetail = lazy(() => import('./views/product-detail'))
const UserProfile = lazy(() => import('./views/user-profile'))
const AddressManagement = lazy(() => import('./views/address-management'))
const ProtectedRoute = lazy(() => import('./components/auth').then(m => ({ default: m.ProtectedRoute })))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/category/:id" component={Products} />
          <Route path="/products" component={Products} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route path="/user-profile">
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          </Route>
          <Route path="/address-management">
            <ProtectedRoute>
              <AddressManagement />
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
