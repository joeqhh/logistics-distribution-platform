import axiosInstance from '@/utils/axiosInstance'

/**
 * 用户登录
 * @param account
 * @param password
 * @returns
 */
export const consumerLogin = async (account: string, password: string) => {
  return axiosInstance.post('/auth/consumer/login', { account, password })
}

/**
 * 用户注册
 * @param name
 * @param account
 * @param password
 * @returns
 */
export const consumerRegister = async (
  name: string,
  account: string,
  password: string
) => {
  return axiosInstance.post('/auth/consumer/register', {
    name,
    account,
    password
  })
}

/**
 * 获取用户信息
 * @returns
 */
export const consumerProfile = async () => {
  return axiosInstance.get('/consumer/info')
}

/**
 * 更新用户信息
 * @returns
 */
export const updateConsumerProfile = async (formData: FormData) => {
  return axiosInstance.post('/consumer/info', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
