import { useEffect, useState } from 'react'
import { getMerchantOrders, logisticsCompanies } from '@/api'
import type { OrderQueryParams, Address, Order } from '@/api'
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
  Message,
  Modal,
  Tag
} from '@arco-design/web-react'
import { formatLocalDateTime } from '@/utils/formatDate'
import styles from './index.module.less'
import { IconRefresh, IconSearch } from '@arco-design/web-react/icon'

const logisticsStatus = {
  TRANSPORTING: '运输中',
  DELIVERING: '派送中',
  WAITRECEIVE: '待收货',
  RECEIVED: '已收货'
} as const

const logisticsStatusTagColor = {
  TRANSPORTING: 'arcoblue',
  DELIVERING: 'blue',
  WAITRECEIVE: 'cyan',
  RECEIVED: 'green'
}

export default function Delivered() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<Order[]>()
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
      title: '快递公司',
      dataIndex: 'company',
      render: (col: any, record: any) => record.company
    },
    {
      title: '下单时间',
      dataIndex: 'createTime',
      sorter: (a: any, b: any) =>
        new Date(a.createTime) > new Date(b.createTime) ? 1 : -1,
      render: (col: any, record: any) =>
        formatLocalDateTime(
          new Date(record.createTime).toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai'
          })
        )
    },
    {
      title: '物流状态',
      dataIndex: 'status',
      filterMultiple: false,
      render: (col: any, record: any) => (
        <Tag
          color={
            logisticsStatusTagColor[
              record.status as keyof typeof logisticsStatusTagColor
            ]
          }
        >
          {logisticsStatus[record.status as keyof typeof logisticsStatus]}
        </Tag>
      )
    },
    {
      title: '操作',
      dataIndex: 'operation',
      align: 'left' as const,
      render: (col: any, record: any) => {
        return (
          <>
            <Space>
              <Button
                type="text"
                size="small"
                style={{ padding: 0 }}
                onClick={() => window.open(`/logistics/${record.id}`, '_blank')}
                // onClick={() => handleShowDeliverModal(record)}
              >
                查看物流
              </Button>
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
        console.log(res)

        const { orders, total } = res.data!
        setOrders(orders)
        setPagination((pagination) => {
          return { ...pagination, current: 1, total }
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleOnSubmitForm = (values: any) => {
    console.log(values)

    const { pageSize } = pagination
    handleGetMerchantOrders({
      // page: current,
      limit: pageSize,
      ...values,
      status: values.status ?? Object.keys(logisticsStatus).join(',')
    })
  }

  const onChangeTable = (pagination: any, _: any, filters: any) => {
    const { current, pageSize } = pagination
    setPagination((val) => ({ ...val, current, pageSize }))
    setLoading(true)
    getMerchantOrders({
      status: Object.keys(logisticsStatus).join(','),
      page: current,
      limit: pageSize,
      canDeliver: filters.canDeliver?.[0]
    })
      .then((res) => {
        console.log(res)

        const { orders, total } = res.data!
        setOrders(orders)
        setPagination((pagination) => {
          const { current, pageSize } = pagination

          const cur = Math.min(Math.floor(total / pageSize) + 1, current)

          return { ...pagination, current: cur, pageSize, total }
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    handleGetMerchantOrders({ status: Object.keys(logisticsStatus).join(',') })
  }, [])

  return (
    <>
      <div className={styles['delivered-container']}>
        <Form
          form={form}
          layout="inline"
          className={styles.form}
          onSubmit={handleOnSubmitForm}
        >
          <Form.Item label="订单号" field="orderNumber">
            <Input placeholder="请输入订单号" />
          </Form.Item>
          <Form.Item label="快递公司" field="company">
            <Select
              placeholder="请选择快递公司"
              defaultValue=""
              options={[
                { label: '全部', value: '' },
                ...logisticsCompanies.map((company) => ({
                  label: company,
                  value: company
                }))
              ]}
            />
          </Form.Item>
          <Form.Item label="商品名" field="productName">
            <Input placeholder="请输入商品名称" />
          </Form.Item>

          <Form.Item label="手机号" field="phone">
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item label="物流状态" field="status">
            <Select
              placeholder="请选择物流状态"
              options={[
                {
                  label: '全部',
                  value: Object.keys(logisticsStatus).join(',')
                },
                ...Object.keys(logisticsStatus).map((key) => ({
                  label: logisticsStatus[key as keyof typeof logisticsStatus],
                  value: key
                }))
              ]}
            />
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
