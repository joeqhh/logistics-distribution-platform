import React, { useState } from 'react'
import { Form, Input, Button, Card, Checkbox, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import styles from './index.module.less'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      // 这里可以添加实际的登录逻辑
      console.log('登录信息:', values)
      message.success('登录成功！')
      // 模拟登录延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      message.error('登录失败，请检查用户名和密码')
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
          
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名！' },
                { min: 3, message: '用户名至少3个字符' }
              ]}
            >
              <Input
                prefix={<UserOutlined className={styles.inputPrefix} />}
                placeholder="用户名"
                className={styles.input}
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
                prefix={<LockOutlined className={styles.inputPrefix} />}
                placeholder="密码"
                className={styles.input}
              />
            </Form.Item>

            <Form.Item>
              <div className={styles.rememberSection}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>记住我</Checkbox>
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
                登录
              </Button>
            </Form.Item>

            <div className={styles.registerSection}>
              <p className={styles.registerText}>
                还没有账号？
                <a href="#" className={styles.registerLink}>
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