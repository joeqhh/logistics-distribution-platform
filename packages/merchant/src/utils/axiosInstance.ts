import axios from 'axios'
import { Message } from '@arco-design/web-react'
import { getToken } from './authentication'

// 创建axios实例
const axiosInstance = axios.create({
  baseURL: '/api' // 基础URL
  // timeout: 10000, // 请求超时时间
  // headers: {
  //   'Content-Type': 'application/json',
  // },
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    // 直接返回响应数据
    return response.data
  },
  (error) => {
    // 错误处理
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 401:
          Message.error('登录已过期，请重新登录')
          // 这里可以添加跳转到登录页的逻辑
          window.location.href = '/login'
          break
        case 403:
          Message.error('没有权限访问该资源')
          break
        case 404:
          Message.error('请求的资源不存在')
          break
        case 500:
          Message.error('服务器内部错误')
          break
        default:
          Message.error(data?.Message || '请求失败')
      }
    } else if (error.request) {
      Message.error('网络连接失败，请检查网络设置')
    } else {
      Message.error('请求配置错误')
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
