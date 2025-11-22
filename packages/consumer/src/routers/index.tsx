import { createBrowserRouter, Navigate, useRoutes } from 'react-router'

const routes = [
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/login',
    lazy: () =>
      import('@/views/login').then((module) => {
        return { Component: module.default }
      }),
    loader: () => {
      // const isLogin = sessionStorage.getItem('token')
      // if (isLogin) return redirect('/')
    }
  },
]


const router = createBrowserRouter(routes)


export default router
