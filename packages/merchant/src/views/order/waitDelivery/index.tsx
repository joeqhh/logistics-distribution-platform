import { useEffect, useState } from 'react'
import {
  getMerchantOrders,
  getMerchantAddresses,
  merchantDeliverOrder,
  logisticsCompanies,
  deleteOrder
} from '@/api'
import type { OrderQueryParams, Address, Order, logisticsCompany } from '@/api'
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
  Modal
} from '@arco-design/web-react'
import { formatLocalDateTime } from '@/utils/formatDate'
import styles from './index.module.less'
import { IconRefresh, IconSearch } from '@arco-design/web-react/icon'

export default function WaitDelivery() {
  const [deleteOrderLoading, setdDleteOrderLoading] = useState(false)
  const [deliverLoading, setDeliverLoading] = useState(false)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<Order[]>()
  const [deliverOrder, setDeliverOrder] = useState<Order>()
  const [senderAddressOptions, setSenderAddressOptions] = useState<Address[]>()
  const [selectedSenderAddressId, setSelectedSenderAddressId] =
    useState<number>()
  const [selectedLogisticCompany, setSelectedLogisticCompany] =
    useState<logisticsCompany>()
  const [modalVisible, setModalVisible] = useState(false)
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
      render: (col: any, record: any) =>
        formatLocalDateTime(
          new Date(record.createTime).toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai'
          })
        )
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
        return (
          <>
            <Space>
              {record.canDeliver ? (
                <Button
                  type="text"
                  size="small"
                  style={{ padding: 0 }}
                  onClick={() => handleShowDeliverModal(record)}
                >
                  发货
                </Button>
              ) : (
                <Button
                  type="text"
                  size="small"
                  style={{ padding: 0 }}
                  loading={deleteOrderLoading}
                  onClick={() => handleDeleteOrder(record.id)}
                >
                  删除订单
                </Button>
              )}
            </Space>
          </>
        )
      }
    }
  ]

  const handleGetMerchantOrders = (query: OrderQueryParams) => {
    setLoading(true)
    getMerchantOrders({
      page: pagination.current,
      limit: pagination.pageSize,
      ...query
    })
      .then((res) => {
        console.log(res)

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
      status: 'WAITDELIVER',
      page: current,
      limit: pageSize,
      canDeliver: filters.canDeliver?.[0]
    })
  }

  const handleOnSubmitForm = (values: any) => {
    const { current, pageSize } = pagination
    handleGetMerchantOrders({
      status: 'WAITDELIVER',
      page: current,
      limit: pageSize,
      ...values,
      createTimeBegin: values.createTimeRange?.[0] || undefined,
      createTimeEnd: values.createTimeRange?.[1] || undefined
    })
  }

  const formatAddress = (address: Address | null | undefined) => {
    if (!address) return ''
    const { name, phone, area, detailedAddress } = address
    return (
      name +
      ',' +
      phone +
      ',' +
      area.replaceAll('/', '') +
      (detailedAddress || '')
    )
  }

  const handleShowDeliverModal = (record: Order) => {
    getMerchantAddresses().then((res) => {
      console.log(res)
      setSenderAddressOptions(res.data.items)
      setDeliverOrder(record)
      setModalVisible(true)
    })
  }

  const handleOnDeliverOrder = () => {
    if (selectedSenderAddressId && selectedLogisticCompany) {
      setDeliverLoading(true)
      merchantDeliverOrder(
        deliverOrder!.id,
        selectedSenderAddressId,
        selectedLogisticCompany
      )
        .then(() => {
          handleGetMerchantOrders({ status: 'WAITDELIVER' })
          Message.success('发货成功!')
          setModalVisible(false)
        })
        .catch(() => {
          Message.error('发货失败!')
        })
        .finally(() => {
          setDeliverLoading(false)
        })
    } else if (!selectedSenderAddressId) {
      Message.info('请选择发货地址!')
    } else {
      Message.info('请选择快递公司!')
    }
  }

  const handleDeleteOrder = (orderId: string) => {
    setdDleteOrderLoading(true)
    deleteOrder(orderId)
      .then((res: any) => {
        if (res && res.code === 200) {
          Message.success(res.msg)
          handleGetMerchantOrders({ status: 'WAITDELIVER' })
        } else {
          Message.error(res.msg)
        }
      })
      .catch((err) => {
        Message.error(err.msg)
      })
      .finally(() => {
        setdDleteOrderLoading(false)
      })
  }

  useEffect(() => {
    handleGetMerchantOrders({ status: 'WAITDELIVER' })
  }, [])

  return (
    <>
      {modalVisible && (
        <Modal
          title="发货地址选择"
          visible={modalVisible}
          onOk={() => {
            handleOnDeliverOrder()
          }}
          onCancel={() => {
            setModalVisible(false)
          }}
          autoFocus={false}
          focusLock={true}
          confirmLoading={deliverLoading}
        >
          <Form>
            <Form.Item label="收货地址">
              <Input
                placeholder="请输入订单号"
                defaultValue={formatAddress(deliverOrder?.receiveAddress)}
                disabled
              />
            </Form.Item>
            <Form.Item
              label="发货地址"
              rules={[{ required: true, message: '请选择发货地址' }]}
            >
              <Select
                placeholder="请选择发货地址"
                onChange={(value) => setSelectedSenderAddressId(value)}
                options={senderAddressOptions?.map((address) => {
                  const { name, phone, area, detailedAddress } = address
                  return {
                    label: (
                      <>
                        <div
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {area.replaceAll('/', '') + (detailedAddress || '')}
                        </div>
                        <div style={{ color: 'gray', fontSize: 12 }}>
                          {name},{phone}
                        </div>
                      </>
                    ),
                    value: address.id
                  }
                })}
              />
            </Form.Item>
            <Form.Item
              label="快递公司"
              rules={[{ required: true, message: '请选择快递公司' }]}
            >
              <Select
                placeholder="请选择快递公司"
                onChange={(value) => setSelectedLogisticCompany(value)}
                options={logisticsCompanies?.map((company) => ({
                  label: company,
                  value: company
                }))}
              />
            </Form.Item>
          </Form>
        </Modal>
      )}
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
            <DatePicker.RangePicker style={{ width: '100%' }} />
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
