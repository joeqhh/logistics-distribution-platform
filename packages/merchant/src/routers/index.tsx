import { createBrowserRouter, Navigate } from 'react-router-dom'
import {type CustomRouteObject} from './types'
import Login from '@/views/login'

const routes = [
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/login',
    element: <Login />
  },
]


const router = createBrowserRouter(routes)

export default router ;
