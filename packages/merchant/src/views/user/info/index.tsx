import React, { useContext } from 'react'
import {
  Input,
  Select,
  Cascader,
  Button,
  Form,
  Space,
  Message,
  Skeleton
} from '@arco-design/web-react'
import { type MerchantInfo, updateMerchantInfo } from '@/api'

function InfoForm({
  loading,
  userInfo,
  onUpdate
}: {
  loading?: boolean
  userInfo: MerchantInfo
  onUpdate: (data: any) => any
}) {
  const [form] = Form.useForm()

  const handleSave = async () => {
    try {
      await form.validate()
      const { name } = form.getFieldsValue()

      const formData = new FormData()
      formData.append('name', name)
      const res = await updateMerchantInfo(formData)

      onUpdate(res.data)

      Message.success('保存成功')
    } catch (_) {
      Message.error('保存失败')
    }
  }

  const handleReset = () => {
    form.resetFields()
  }

  const loadingNode = (rows = 1) => {
    return (
      <Skeleton
        text={{
          rows,
          width: new Array(rows).fill('100%')
        }}
        animation
      />
    )
  }

  return (
    <Form
      style={{ width: '500px', marginTop: '6px' }}
      form={form}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
    >
      <Form.Item
        label="商家名"
        field="name"
        rules={[
          {
            required: true,
            message: '请输入商家名'
          }
        ]}
      >
        {loading ? (
          loadingNode()
        ) : (
          <Input
            defaultValue={userInfo.name || undefined}
            placeholder="请输入商家名"
          />
        )}
      </Form.Item>

      <Form.Item label=" ">
        <Space>
          <Button type="primary" onClick={handleSave}>
            保存
          </Button>
          <Button onClick={handleReset}>重置</Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default InfoForm
