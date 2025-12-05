import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Avatar, Alert, Spin, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EditOutlined } from '@ant-design/icons';
import { useAppStore } from '../../store';
import styles from './index.module.less';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface UserInfo {
  username: string;
  email: string;
  phone: string;
  avatar?: string;
  nickname?: string;
  bio?: string;
}

const UserProfile: React.FC = () => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { user, updateUserInfo } = useAppStore();

  // 编辑时，将当前用户信息填充到表单
  React.useEffect(() => {
    if (user && isEditing) {
      form.setFieldsValue({
        username: user.username || '',
        nickname: user.nickname || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
    }
  }, [user, isEditing, form]);

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const onFinish = async (values: Partial<UserInfo>) => {
    try {
      setLoading(true);
      setError('');
      
      // 调用状态管理中的更新用户信息方法
      await updateUserInfo(values);
      
      message.success('个人信息更新成功');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || '更新失败，请稍后重试');
      message.error(err.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  // 如果用户未登录，显示提示信息
  if (!user) {
    return (
      <div className={styles.noLoginContainer}>
        <Alert message="请先登录" type="info" showIcon />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <Title level={4} className={styles.title}>个人信息</Title>
          {!isEditing && (
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={handleEdit}
              className={styles.editButton}
            >
              编辑
            </Button>
          )}
        </div>
        
        {error && <Alert message="更新失败" description={error} type="error" showIcon className={styles.error} />}
        
        <div className={styles.profileContent}>
          <div className={styles.avatarSection}>
            <Avatar 
              size={100} 
              src={user.avatar} 
              icon={<UserOutlined />} 
              className={styles.avatar}
            />
            <div className={styles.nameSection}>
              <Text strong className={styles.username}>{user.username}</Text>
              {user.nickname && <Text className={styles.nickname}>({user.nickname})</Text>}
            </div>
          </div>
          
          <Form
            form={form}
            name="user-profile"
            className={styles.form}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            layout="vertical"
            initialValues={{
              username: user.username || '',
              nickname: user.nickname || '',
              email: user.email || '',
              phone: user.phone || '',
              bio: user.bio || ''
            }}
          >
            <Form.Item
              label="用户名"
              name="username"
              rules={[{ required: true, message: '请输入用户名!' }]}
            >
              <Input 
                prefix={<UserOutlined className="site-form-item-icon" />}
                disabled={!isEditing}
              />
            </Form.Item>
            
            <Form.Item
              label="昵称"
              name="nickname"
            >
              <Input 
                disabled={!isEditing}
              />
            </Form.Item>
            
            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { required: true, message: '请输入邮箱!' },
                { type: 'email', message: '邮箱格式不正确!' }
              ]}
            >
              <Input 
                prefix={<MailOutlined className="site-form-item-icon" />}
                disabled={!isEditing}
              />
            </Form.Item>
            
            <Form.Item
              label="手机号"
              name="phone"
              rules={[
                { required: true, message: '请输入手机号!' },
                { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确!' }
              ]}
            >
              <Input 
                prefix={<PhoneOutlined className="site-form-item-icon" />}
                disabled={!isEditing}
              />
            </Form.Item>
            
            <Form.Item
              label="个人简介"
              name="bio"
            >
              <TextArea 
                rows={4} 
                disabled={!isEditing}
                placeholder="介绍一下自己吧"
              />
            </Form.Item>
            
            {isEditing && (
              <Form.Item className={styles.actions}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  className={styles.submitButton}
                >
                  {loading ? <Spin size="small" /> : '保存'}
                </Button>
                <Button 
                  onClick={handleCancel}
                  className={styles.cancelButton}
                  disabled={loading}
                >
                  取消
                </Button>
              </Form.Item>
            )}
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default UserProfile;