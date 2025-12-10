import React, { useEffect, useState } from 'react'
import {
  Table,
  Message,
  Button,
  Space,
  Form,
  Input,
  Menu,
  DatePicker,
  Tag
} from '@arco-design/web-react'
import { IconSearch, IconRefresh } from '@arco-design/web-react/icon'
import {
  getOrders,
  receiveOrder,
  type OrderQueryParams,
  type Order
} from '@/api'
import styles from './index.module.less'
import { formatLocalDateTime } from '@/utils/formatDate'
import { useHistory } from 'react-router-dom'

const logisticsStatus = {
  WAITDELIVER: '待发货',
  TRANSPORTING: '运输中',
  DELIVERING: '派送中',
  WAITRECEIVE: '待收货',
  RECEIVED: '已收货'
} as const

const logisticsStatusTagColor = {
  WAITDELIVER: 'gray',
  TRANSPORTING: 'arcoblue',
  DELIVERING: 'blue',
  WAITRECEIVE: 'cyan',
  RECEIVED: 'green'
} as const

enum OrderMenuKey {
  ALL = 'ALL',
  WAITDELIVER = 'WAITDELIVER',
  TRANSPORTING = 'TRANSPORTING',
  DELIVERING = 'DELIVERING',
  WAITRECEIVE = 'WAITRECEIVE',
  RECEIVED = 'RECEIVED'
}

export default function Orders() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [orderStatus, setOrderStatus] = useState<OrderMenuKey>(OrderMenuKey.ALL)
  const [pagination, setPagination] = useState({
    sizeCanChange: true,
    showTotal: true,
    total: 0,
    pageSize: 10,
    current: 1,
    pageSizeChangeResetCurrent: true
  })

  const history = useHistory()

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
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={'/object' + record.product.cover}
              width={50}
              height={50}
              style={{ marginRight: 10, borderRadius: 4 }}
              alt={record.product.name}
            />
            <span>{record.product.name}</span>
          </div>
        )
      }
    },
    {
      title: '商家名',
      dataIndex: 'merchant',
      render: (col: any, record: any) => `${record.merchant.name}`
    },
    {
      title: '商品金额',
      dataIndex: 'price',
      sorter: (a: any, b: any) => a.product.price - b.product.price,
      render: (col: any, record: any) => `¥${record.product.price}`
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
      title: '订单状态',
      dataIndex: 'status',
      render: (col: any, record: any) => {
        return (
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
      }
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
                type="primary"
                onClick={() => history.push(`/product/${record.product.id}`)}
                // onClick={() => handleShowDeliverModal(record)}
              >
                再买一单
              </Button>
              <Button
                type="text"
                size="small"
                style={{ padding: 0, marginLeft: 10 }}
                onClick={() => window.open(`/logistics/${record.id}`, '_blank')}
                // onClick={() => handleShowDeliverModal(record)}
              >
                查看物流
              </Button>
              {record.status === 'WAITRECEIVE' && (
                <Button
                  type="text"
                  size="small"
                  style={{ padding: 0, marginLeft: 10 }}
                  onClick={() => handleReceiveOrder(record.id)}
                  // onClick={() => handleShowDeliverModal(record)}
                >
                  确认收货
                </Button>
              )}
            </Space>
          </>
        )
        // }
      }
    }
  ]

  const handleGetOrders = (query?: OrderQueryParams) => {
    setLoading(true)
    const { pageSize } = pagination
    const { searchKey, createTimeRange } = form.getFieldsValue()
    getOrders(1, pageSize, {
      searchKey,
      createTimeBegin: createTimeRange?.[0],
      createTimeEnd: createTimeRange?.[1],
      ...query,
      status: orderStatus === OrderMenuKey.ALL ? undefined : orderStatus
    })
      .then((res) => {
        const { data } = res
        setOrders(data.orders)
        setPagination((pagination) => ({
          ...pagination,
          current: 1,
          total: data.total
        }))
      })
      .catch((error) => {
        console.error('获取订单列表失败:', error)
        Message.error('获取订单列表失败')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const onChangeTable = (pagination: any, _: any, filters: any) => {
    const { current, pageSize } = pagination
    setPagination((val) => ({ ...val, current, pageSize }))

    setLoading(true)
    console.log(current, pageSize)
    const { searchKey, createTimeRange } = form.getFieldsValue()
    getOrders(current, pageSize, {
      searchKey,
      createTimeBegin: createTimeRange?.[0],
      createTimeEnd: createTimeRange?.[1],
      page: current,
      limit: pageSize,
      ...filters,
      status: orderStatus === OrderMenuKey.ALL ? undefined : orderStatus
    })
      .then((res) => {
        const { data } = res
        setOrders(data.orders)
        setPagination((pagination) => ({ ...pagination, total: data.total }))
      })
      .catch((error) => {
        console.error('获取订单列表失败:', error)
        Message.error('获取订单列表失败')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleReceiveOrder = (orderId: number) => {
    receiveOrder(orderId)
      .then(() => {
        Message.success('确认收货成功')
        handleGetOrders()
      })
      .catch((error) => {
        console.error('确认收货失败:', error)
        Message.error('确认收货失败')
      })
  }

  useEffect(() => {
    handleGetOrders()
  }, [orderStatus])

  return (
    <>
      <div className={styles['orders-menu']}>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={[OrderMenuKey.ALL]}
          style={{ padding: 0 }}
          onClickMenuItem={(e) => {
            setOrderStatus(e as OrderMenuKey)
          }}
        >
          <Menu.Item style={{ marginLeft: 0 }} key={OrderMenuKey.ALL}>
            所有订单
          </Menu.Item>
          <Menu.Item key={OrderMenuKey.WAITDELIVER}>待发货</Menu.Item>
          <Menu.Item key={OrderMenuKey.TRANSPORTING}>运输中</Menu.Item>
          <Menu.Item key={OrderMenuKey.DELIVERING}>派送中</Menu.Item>
          <Menu.Item key={OrderMenuKey.WAITRECEIVE}>待收货</Menu.Item>
          <Menu.Item key={OrderMenuKey.RECEIVED}>已收货</Menu.Item>
        </Menu>
      </div>

      <div className={styles['orders-filter-container']}>
        <Form
          form={form}
          layout="inline"
          className={styles.form}
          onSubmit={handleGetOrders}
        >
          <Form.Item label="关键词" field="searchKey">
            <Input placeholder="请输入商品信息/订单号/商家名" />
          </Form.Item>
          <Form.Item label="下单时间" field="createTimeRange">
            <DatePicker.RangePicker style={{ width: '100%' }} />
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
          <Button
            icon={<IconRefresh />}
            style={{ marginLeft: 16 }}
            onClick={() => form.resetFields()}
          >
            重置
          </Button>
        </div>
      </div>

      <Table
        border={false}
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
