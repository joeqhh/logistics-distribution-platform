import React, { useState } from 'react'
import { Form, Input, Button, Card, Checkbox, Message, Spin } from '@arco-design/web-react'
import { IconUser, IconLock } from '@arco-design/web-react/icon'
import { useHistory } from 'react-router-dom'
import { useAppStore } from '../../store'
import styles from './index.module.less'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [form] = Form.useForm()
  const history = useHistory()
  const { login } = useAppStore()

  const onFinish = async (values: { username: string; password: string; remember: boolean }) => {
    setLoading(true)
    try {
      setError('')
      // 使用全局状态管理中的登录方法
      await login(values.username, values.password)
      
      Message.success('登录成功！')
      // 登录成功后跳转到首页
      history.push('/')
    } catch (err: any) {
      const errorMessage = err.message || '登录失败，请检查用户名和密码'
      setError(errorMessage)
      Message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <Card>
          <div className={styles.header}>
            <h1 className={styles.title}>欢迎登录</h1>
            <p className={styles.subtitle}>物流配送平台</p>
          </div>
          
          {error && (
            <div className={styles.errorContainer}>
              <Alert 
                message="登录失败" 
                description={error} 
                type="error" 
                showIcon 
              />
            </div>
          )}
          
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
            initialValues={{ remember: true }}
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名！' },
                { min: 3, message: '用户名至少3个字符' }
              ]}
            >
              <Input
                prefix={<IconUser className={styles.inputPrefix} />}
                placeholder="用户名"
                className={styles.input}
                disabled={loading}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码！' },
                { min: 6, message: '密码至少6个字符' }
              ]}
            >
              <Input.Password
                prefix={<IconLock className={styles.inputPrefix} />}
                placeholder="密码"
                className={styles.input}
                disabled={loading}
              />
            </Form.Item>

            <Form.Item>
              <div className={styles.rememberSection}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox disabled={loading}>记住我</Checkbox>
                </Form.Item>
                <a href="#" className={styles.forgotLink}>
                  忘记密码？
                </a>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className={styles.loginButton}
              >
                {loading ? <Spin size="small" /> : '登录'}
              </Button>
            </Form.Item>

            <div className={styles.registerSection}>
              <p className={styles.registerText}>
                还没有账号？
                <a href="/register" className={styles.registerLink}>
                  立即注册
                </a>
              </p>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  )
}