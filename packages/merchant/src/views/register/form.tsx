import { Form, Input, Button, Link, Message } from '@arco-design/web-react'
import {
  IconUser,
  IconUser as IconName,
  IconLock
} from '@arco-design/web-react/icon'
import React, { useState } from 'react'
import styles from './style/index.module.less'
import { merchantRegister } from '@/api'

export default function RegisterForm() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  function register(params: any) {
    setLoading(true)
    merchantRegister(params.name, params.account, params.password)
      .then((res: any) => {
        const { code, msg } = res
        if (code === 200) {
          // 注册成功
          Message.success('注册成功，请登录')
          window.location.href = '/login'
        } else {
          Message.error(msg || '注册失败，请重试')
        }
      })
      .catch(() => {
        Message.error('注册失败，请重试')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  // 密码确认验证规则
  const validatePasswordConfirm = (value: string | undefined, cb: any) => {
    if (value !== form.getFieldValue('password')) {
      return cb('两次输入的密码不一致')
    }
    return cb()
  }

  function onSubmitClick() {
    form
      ?.validate()
      .then((values) => {
        register(values)
      })
      .catch((errors) => {
        console.log('验证失败', errors)
      })
  }

  return (
    <div className={styles['register-form-wrapper']}>
      <div className={styles['register-form-title']}>欢迎注册</div>
      <div className={styles['register-form-sub-title']}>
        Byte Logistics 商家端
      </div>
      <Form
        onSubmit={onSubmitClick}
        form={form}
        className={styles['register-form']}
        layout="vertical"
        initialValues={{
          account: '',
          name: '',
          password: '',
          confirmPassword: ''
        }}
      >
        <Form.Item
          field="account"
          rules={[{ required: true, message: '账号不能为空' }]}
        >
          <Input
            prefix={<IconUser />}
            placeholder="请输入账号"
            onPressEnter={onSubmitClick}
          />
        </Form.Item>
        <Form.Item
          field="name"
          rules={[{ required: true, message: '用户名不能为空' }]}
        >
          <Input
            prefix={<IconName />}
            placeholder="请输入商家"
            onPressEnter={onSubmitClick}
          />
        </Form.Item>
        <Form.Item
          field="password"
          rules={[
            { required: true, message: '密码不能为空' },
            { min: 6, message: '密码长度不能少于6位' }
          ]}
        >
          <Input
            prefix={<IconLock />}
            type="password"
            placeholder="请输入密码"
            onPressEnter={onSubmitClick}
          />
        </Form.Item>
        <Form.Item
          field="confirmPassword"
          rules={[
            { required: true, message: '确认密码不能为空' },
            {
              validator: validatePasswordConfirm,
              message: '两次输入的密码不一致'
            }
          ]}
        >
          <Input
            prefix={<IconLock />}
            type="password"
            placeholder="请确认密码"
            onPressEnter={onSubmitClick}
          />
        </Form.Item>
        <Button
          type="primary"
          long
          onClick={() => form.submit()}
          loading={loading}
          className={styles['register-button']}
        >
          注册
        </Button>
                  <div className={styles.loginSection}>
            <p className={styles.loginText}>
              已有账号？
              <a href="/login" className={styles.loginLink}>
                立即登录
              </a>
            </p>
          </div>
        {/* <div className={styles['register-form-actions']}>
          <Link href="/login">已有账号？立即登录</Link>
        </div> */}
      </Form>
    </div>
  )
}
