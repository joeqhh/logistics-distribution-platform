import {  useState } from 'react'
import {AddressSelector} from '@logistics-distribution-platform/shared-ui'
import {
  Modal,
  Form,
  Input,
  Message
} from '@arco-design/web-react'
import {
  createAddress,
  updateAddress,
  type CreateAddressParams,
  type UpdateAddressParams
} from '@/api'

interface AddressModalProps {
  visible?: boolean
  onChange?: (visible: boolean) => any
  address?: UpdateAddressParams
  type: 'CREATE' | 'UPDATE'
  onSuccess?: (...args: any) => any
}

export default function AddressModal({
  visible = false,
  onChange,
  address,
  type,
  onSuccess
}: AddressModalProps) {
  const [form] = Form.useForm()
  const [submitLoading, setSubmitLoading] = useState(false)
  const handleCreateAddress = async (values: CreateAddressParams) => {
    setSubmitLoading(true)
    try {
      if (type === 'CREATE') {
        await createAddress(values)
        Message.success('创建地址成功!')
      } else {
        await updateAddress({ ...values, id: address!.id })
        Message.success('更新地址成功!')
      }
      onChange?.(false)
      onSuccess?.()
    } catch (error) {
      Message.error(error as string)
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <>
      {
        <Modal
        afterClose={() => form.clearFields()}
          unmountOnExit={true}
          maskClosable={false}
          title={type === 'CREATE' ? "创建地址" : "修改地址"}
          visible={visible}
          onOk={form.submit}
          onCancel={() => {onChange?.(false)}}
          focusLock={false}
          okButtonProps={{
            loading: submitLoading
          }}
        >
          <Form
            form={form}
            onSubmit={handleCreateAddress}
            initialValues={type === 'UPDATE' ? address : undefined}
          >
            <Form.Item
              label="寄件地址"
              field="area"
              rules={[{ required: true, message: '请选择寄件地址' }]}
            >
              <AddressSelector />
            </Form.Item>
            <Form.Item
              label="详细地址"
              field="detailedAddress"
              rules={[{ required: true, message: '请输入详细地址' }]}
            >
              <Input placeholder="请输入详细地址" />
            </Form.Item>
            <Form.Item
              label="姓名"
              field="name"
              rules={[{ required: true, message: '请输入寄件人姓名' }]}
            >
              <Input placeholder="请输入寄件人姓名" />
            </Form.Item>
            <Form.Item
              label="手机号"
              field="phone"
              rules={[
                { required: true, message: '请输入手机号' },
                { match: /^1[3456789]\d{9}$/, message: '请输入正确的手机号' }
              ]}
            >
              <Input placeholder="请输入手机号" />
            </Form.Item>
          </Form>
        </Modal>
      }
    </>
  )
}
