import {
  Form,
  Input,
  Checkbox,
  Button,
  Space,
  Message
} from '@arco-design/web-react'
import { IconLock, IconUser } from '@arco-design/web-react/icon'
import { useEffect, useState } from 'react'
import useStorage from '@/utils/useStorage'
import styles from './index.module.less'
import { consumerLogin } from '@/api'
import { setToken } from '@/utils/authentication'
import { useStore } from '@/store'
import { useLocation } from "react-router-dom";

export default function LoginForm() {

  const location = useLocation();
  
  const appStoreLogin = useStore((state) => state.login)

  const [form] = Form.useForm()

  const [loading, setLoading] = useState(false)
  const [loginParams, setLoginParams, removeLoginParams] =
    useStorage('cloginParams')

  const [rememberPassword, setRememberPassword] = useState(!!loginParams)

  function afterLoginSuccess(params: any, data: any) {
    // 记住密码
    if (rememberPassword) {
      setLoginParams(JSON.stringify(params))
    } else {
      removeLoginParams()
    }
    // 记录登录状态
    appStoreLogin(data)
    localStorage.setItem('cStatus', 'login')
    setToken(data.token)

    const {from} = (location.state as any) || {}
    
    // 跳转首页
    window.location.href = from || '/'
  }

  function login(params: any) {
    setLoading(true)
    consumerLogin(params.userName, params.password)
      .then((res: any) => {
        const { code, data, msg } = res
        if (code === 200) {
          afterLoginSuccess(params, data)
        } else {
          Message.error(msg || '登录出错，请刷新重试')
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  function onSubmitClick() {
    form
      ?.validate()
      .then((values) => {
        login(values)
      })
      .catch((errors) => {
        console.log('验证失败', errors)
      })
  }

  // 读取 localStorage，设置初始值
  useEffect(() => {
    const rememberPassword = !!loginParams
    setRememberPassword(rememberPassword)
    if (form && rememberPassword) {
      const parseParams = JSON.parse(loginParams)
      form.setFieldsValue(parseParams)
    }
  }, [loginParams])

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles['content-inner']}>
          <div className={styles['login-form-wrapper']}>
            <div className={styles['login-form-title']}>欢迎登录</div>
            <div className={styles['login-form-sub-title']}>
              Byte Logistics 用户端
            </div>
            <Form
              onSubmit={onSubmitClick}
              form={form}
              className={styles['login-form']}
              layout="vertical"
            >
              <Form.Item
                field="userName"
                rules={[{ required: true, message: '账号不能为空' }]}
              >
                <Input
                  prefix={<IconUser />}
                  placeholder="账号"
                  onPressEnter={onSubmitClick}
                />
              </Form.Item>
              <Form.Item
                field="password"
                rules={[{ required: true, message: '密码不能为空' }]}
              >
                <Input.Password
                  prefix={<IconLock />}
                  placeholder="密码"
                  onPressEnter={onSubmitClick}
                />
              </Form.Item>
              <Space size={16} direction="vertical">
                <div className={styles['login-form-password-actions']}>
                  <Checkbox
                    checked={rememberPassword}
                    onChange={setRememberPassword}
                  >
                    记住密码
                  </Checkbox>
                  {/* <Link>忘记密码</Link> */}
                </div>
                <Button
                  type="primary"
                  long
                  onClick={() => form.submit()}
                  loading={loading}
                  className={styles['login-button']}
                >
                  登录
                </Button>
                <div className={styles.registerSection}>
                  <p className={styles.registerText}>
                    还没有账号？
                    <a href="/register" className={styles.registerLink}>
                      立即注册
                    </a>
                  </p>
                </div>
              </Space>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}
