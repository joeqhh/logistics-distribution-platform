import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Spin, Message } from '@arco-design/web-react';
import { IconUser, IconLock, IconMail, IconPhone } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import styles from './index.module.less';

const { Title } = Typography;
const { TextArea } = Input;

const Register: React.FC = () => {
  const history = useHistory();
  const [form] = Form.useForm();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      setError('');
      
      // 这里应该添加实际的注册逻辑
      console.log('Received values of form: ', values);
      
      // 模拟注册成功
      await new Promise(resolve => setTimeout(resolve, 1000));
      Message.success('注册成功，请登录');
      history.push('/login');
    } catch (err: any) {
      setError(err.message || '注册失败，请稍后重试');
      Message.error(err.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <Title level={3} className={styles.title}>用户注册</Title>
        </div>
        {error && <Alert message="注册失败" description={error} type="error" showIcon className={styles.error} />}
        <Form
          form={form}
          name="register"
          className={styles.form}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名!' },
              { min: 3, max: 20, message: '用户名长度需要在3-20个字符之间' }
            ]}
          >
            <Input
                  prefix={<IconUser />}
                  placeholder="用户名"
                  disabled={loading}
                />
          </Form.Item>
          
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '邮箱格式不正确!' }
            ]}
          >
            <Input
                  prefix={<IconMail />}
                  placeholder="邮箱"
                  disabled={loading}
                />
          </Form.Item>
          
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号!' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确!' }
            ]}
          >
            <Input
                  prefix={<IconPhone />}
                  placeholder="手机号"
                  disabled={loading}
                />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码!' },
              { min: 6, message: '密码长度至少6位' },
              { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, message: '密码必须包含字母和数字' }
            ]}
          >
            <Input
                  prefix={<IconLock />}
                  type="password"
                  placeholder="密码"
                  disabled={loading}
                />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致!'));
                },
              }),
            ]}
          >
            <Input
                  prefix={<IconLock />}
                  type="password"
                  placeholder="确认密码"
                  disabled={loading}
                />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className={styles.submit} 
              block
              loading={loading}
            >
              {loading ? <Spin size="small" /> : '注册'}
            </Button>
          </Form.Item>
          
          <div className={styles.login}>
            已有账号? <a href="/login">立即登录</a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;