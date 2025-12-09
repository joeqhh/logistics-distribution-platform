import { useEffect, useState } from 'react'
import { Table, Button, Space, Message } from '@arco-design/web-react'
import {
  getAddresses,
  deleteAddress,
  type Address,
  type UpdateAddressParams
} from '@/api'
import AddressModal from './adressModal'

export default function Address() {
  const [addressModalOperateType, setAddressModalOperateType] = useState<
    'CREATE' | 'UPDATE'
  >('CREATE')
  const [updatedAddress, setUpdatedAddress] = useState<
    UpdateAddressParams | undefined
  >()
  const [addressModalVisible, setAddressModalVisible] = useState(false)
  const [addressList, setAddressList] = useState<Address[]>()
  const [pagination, setPagination] = useState({
    sizeCanChange: true,
    showTotal: true,
    total: 0,
    pageSize: 10,
    current: 1,
    pageSizeChangeResetCurrent: true
  })
  const [loading, setLoading] = useState(false)

  const columns = [
    {
      title: '手机号码',
      dataIndex: 'phone'
    },
    {
      title: '联系人',
      dataIndex: 'name'
    },
    {
      title: '地址',
      dataIndex: 'area',
      render: (col: any, record: any) => record.area.replaceAll('/', '')
    },
    {
      title: '详细地址',
      dataIndex: 'detailedAddress'
    },
    {
      title: '操作',
      dataIndex: 'operation',
      align: 'left' as const,
      render: (col: any, record: any) => {
        const handleUpdateAddress = async () => {
          setAddressModalOperateType('UPDATE')
          setUpdatedAddress(record)
          setAddressModalVisible(true)
        }

        const handleDeleteAddress = async () => {
          try {
            setLoading(true)
            await deleteAddress(record.id)
            Message.success('删除成功')
            initMerchantAddresses()
          } catch (error) {
            Message.error('删除失败，请重试')
          } finally {
            setLoading(false)
          }
        }

        return (
          <>
            <Space>
              <Button
                type="text"
                size="small"
                style={{ padding: 0}}
                onClick={handleUpdateAddress}
              >
                编辑
              </Button>
              <Button
                type="text"
                status="danger"
                size="small"
                style={{ padding: 0, marginLeft: 10 }}
                onClick={handleDeleteAddress}
              >
                删除
              </Button>
            </Space>
          </>
        )
      }
    }
  ]

  function onChangeTable(pagination: any) {
    const { current, pageSize } = pagination
    setLoading(true)
    getAddresses(current, pageSize).then((res) => {
      setAddressList(res.data.items)
      setPagination((pagination) => ({
        ...pagination,
        current,
        pageSize,
        total: res.data.total
      }))
      setLoading(false)
    })
  }

  function initMerchantAddresses() {
    getAddresses().then((res) => {
      setAddressList(res.data.items)
      setPagination((pagination) => ({
        ...pagination,
        total: res.data.total
      }))
    })
  }

  useEffect(() => {
    initMerchantAddresses()
  }, [])

  return (
    <>
      <AddressModal
        visible={addressModalVisible}
        onChange={setAddressModalVisible}
        address={updatedAddress}
        type={addressModalOperateType}
        onSuccess={initMerchantAddresses}
      />
      <Space
        style={{
          marginBottom: 16,
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end'
        }}
      >
        <Button
          type="primary"
          onClick={() => {
            setAddressModalOperateType('CREATE')
            setUpdatedAddress(undefined)
            setAddressModalVisible(true)
          }}
        >
          新建地址
        </Button>
      </Space>
      <Table
        loading={loading}
        columns={columns}
        data={addressList}
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
