import { createBrowserRouter, Navigate } from 'react-router'
import { ProtectedRoute } from '../components/auth'

const routes = [
  {
    path: '/',
    lazy: () =>
      import('@/views/home').then((module) => {
        return { Component: module.default }
      })
  },
  {
    path: '/login',
    lazy: () =>
      import('@/views/login').then((module) => {
        return { Component: module.default }
      })
  },
  {
    path: '/register',
    lazy: () =>
      import('@/views/register').then((module) => {
        return { Component: module.default }
      })
  },

  {
    path: '/category/:id',
    lazy: () =>
      import('@/views/products').then((module) => {
        return { Component: module.default }
      })
  },
  {
    path: '/products',
    lazy: () =>
      import('@/views/products').then((module) => {
        return { Component: module.default }
      })
  },
  {
    path: '/product/:id',
    lazy: () =>
      import('@/views/productDetail').then((module) => {
        return { Component: module.default }
      })
  },
  {
    path: '/user/profile',
    lazy: () =>
      import('@/views/user/profile').then((module) => {
        return { Component: (props) => <ProtectedRoute><module.default {...props} /></ProtectedRoute> }
      })
  },
  {
    path: '/user/address',
    lazy: () =>
      import('@/views/user/address').then((module) => {
        return { Component: (props) => <ProtectedRoute><module.default {...props} /></ProtectedRoute> }
      })
  },
  {
    path: '/user-profile',
    lazy: () =>
      import('@/views/user-profile').then((module) => {
        return { Component: (props) => <ProtectedRoute><module.default {...props} /></ProtectedRoute> }
      })
  },
  // {
  //   path: '/address-management',
  //   lazy: () =>
  //     import('@/views/address-management').then((module) => {
  //       return { Component: (props) => <ProtectedRoute><module.default {...props} /></ProtectedRoute> }
  //     })
  // },
  {
    path: '/user/orders',
    lazy: () =>
      import('@/views/user/orders').then((module) => {
        return { Component: (props) => <ProtectedRoute><module.default {...props} /></ProtectedRoute> }
      })
  },
  // 404页面
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]

const router = createBrowserRouter(routes)

export default router
