import React, { useEffect, useState } from 'react'

import { getMerchantOrders, type OrderQueryParams } from '@/api'
import {
  Image,
  Badge,
  Table,
  Space,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Message
} from '@arco-design/web-react'
import { formatLocalDateTime } from '@/utils/formatDate'
import styles from './index.module.less'
import { IconRefresh, IconSearch } from '@arco-design/web-react/icon'

export default function WaitDelivery() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<any[]>()

  const [pagination, setPagination] = useState({
    sizeCanChange: true,
    showTotal: true,
    total: 0,
    pageSize: 10,
    current: 1,
    pageSizeChangeResetCurrent: true
  })

  const columns = [
    {
      title: '订单号',
      dataIndex: 'number'
    },
    {
      title: '商品信息',
      dataIndex: 'product',
      render: (col: any, record: any) => {
        return (
          <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Image
                src={'/object' + record.product.cover}
                width={50}
                height={50}
              />
              <span style={{ marginLeft: 10 }}>{record.product.name}</span>
            </div>
          </>
        )
      }
    },
    {
      title: '金额',
      dataIndex: 'price',
      sorter: (a: any, b: any) => a.product.price - b.product.price,
      render: (col: any, record: any) => record.product.price
    },
    {
      title: '收货人',
      dataIndex: 'receiver',
      render: (col: any, record: any) => record.receiveAddress.name
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      render: (col: any, record: any) => record.receiveAddress.phone
    },
    {
      title: '收货地址',
      dataIndex: 'address',
      render: (col: any, record: any) =>
        record.receiveAddress.area.replaceAll('/', '') +
        (record.receiveAddress.detailedAddress || '')
    },
    {
      title: '下单时间',
      dataIndex: 'createTime',
      sorter: (a: any, b: any) =>
        new Date(a.createTime) > new Date(b.createTime) ? 1 : -1,
      render: (col: any, record: any) => formatLocalDateTime(record.createTime)
    },
    {
      title: '配送状态',
      dataIndex: 'canDeliver',
      filterMultiple: false,
      filters: [
        {
          text: '可配送',
          value: true
        },
        {
          text: '不可配送',
          value: false
        }
      ],
      render: (col: any, record: any) => {
        return (
          <>
            {record.canDeliver ? (
              <Badge status="success" text="可配送" />
            ) : (
              <Badge status="error" text="不可配送" />
            )}
          </>
        )
      }
    },
    {
      title: '操作',
      dataIndex: 'operation',
      align: 'left' as const,
      render: (col: any, record: any) => {
        //   const handleUpdateAddress = async () => {
        //     setAddressModalOperateType('UPDATE')
        //     setUpdatedAddress(record)
        //     setAddressModalVisible(true)
        //   }

        //   const handleDeleteAddress = async () => {
        //     try {
        //       setLoading(true)
        //       await deleteAddress(record.id)
        //       Message.success('删除成功')
        //       initMerchantAddresses()
        //     } catch (error) {
        //       Message.error('删除失败，请重试')
        //     } finally {
        //       setLoading(false)
        //     }
        //   }

        return (
          <>
            <Space>
              <Button
                type="text"
                size="small"
                style={{ padding: 0 }}
                // onClick={handleUpdateAddress}
              >
                发货
              </Button>
              {/* <Button
                type="text"
                status="danger"
                size="small"
                style={{ padding: 0, marginLeft: 10 }}
                // onClick={handleDeleteAddress}
              >
                删除
              </Button> */}
            </Space>
          </>
        )
        // }
      }
    }
  ]

  const handleGetMerchantOrders = (query: OrderQueryParams) => {
    setLoading(true)
    getMerchantOrders(query)
      .then((res) => {
        const { orders, total } = res.data!
        setOrders(orders)
        setPagination((pagination) => ({ ...pagination, total }))
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const onChangeTable = (pagination: any, _: any, filters: any) => {

    const { current, pageSize } = pagination
    handleGetMerchantOrders({
      status: 'WAITDISPATCH',
      page: current,
      limit: pageSize,
      canDeliver: filters.canDeliver?.[0]
    })
  }

  const handleOnSubmitForm = (values: any) => {
    const { current, pageSize } = pagination
    handleGetMerchantOrders({
      status: 'WAITDISPATCH',
      page: current,
      limit: pageSize,
      ...values
    })
  }

  useEffect(() => {
    handleGetMerchantOrders({ status: 'WAITDISPATCH' })
  }, [])

  return (
    <>
      <div className={styles['wait-delivery-container']}>
        <Form
          form={form}
          layout="inline"
          className={styles.form}
          onSubmit={handleOnSubmitForm}
        >
          <Form.Item label="订单号" field="orderNumber">
            <Input placeholder="请输入订单号" />
          </Form.Item>
          <Form.Item label="配送状态" field="canDeliver">
            <Select
              placeholder="全部"
              defaultValue=""
              options={[
                { label: '全部', value: '' },
                { label: '可配送', value: 'true' },
                { label: '不可配送', value: 'false' }
              ]}
            />
          </Form.Item>
          <Form.Item label="商品名" field="productName">
            <Input placeholder="请输入商品名称" />
          </Form.Item>

          <Form.Item label="手机号" field="phone">
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item label="下单时间" field="createTimeRange">
            <DatePicker.RangePicker />
          </Form.Item>

          <Form.Item label="收货人" field="receiver">
            <Input placeholder="请输入收货人" />
          </Form.Item>
        </Form>
        <div className={styles['form-buttons']}>
          <Button
            type="primary"
            icon={<IconSearch />}
            onClick={() => form.submit()}
          >
            查询
          </Button>
          <Button icon={<IconRefresh />} onClick={() => form.resetFields()}>
            重置
          </Button>
        </div>
      </div>
      <Table
        loading={loading}
        columns={columns}
        data={orders}
        pagination={pagination}
        onChange={onChangeTable}
        rowKey="id"
        renderPagination={(paginationNode) => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 10
            }}
          >
            {paginationNode}
          </div>
        )}
      />
    </>
  )
}
