import React, { useEffect ,useState} from 'react'

import { getMerchantOrders,type OrderQueryParams } from '@/api'
import {
  Image,
  Badge,
  Table,
  Space,
  Button,
  Message
} from '@arco-design/web-react'
export default function WaitDelivery() {

  const [loading,setLoading] = useState(false)
  const [orders,setOrders] = useState<any[]>()

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
              <Image src={'/object' + record.product.cover} width={50} height={50} />
              <span style={{ marginLeft: 10 }}>{record.product.name}</span>
            </div>
          </>
        )
      }
    },
    {
      title: '收货人',
      dataIndex: 'receiver',
      render: (col: any, record: any) => record.receiveAddress.name
    },
    {
      title: '手机号',
      dataIndex: 'receiver',
      render: (col: any, record: any) => record.receiveAddress.phone
    },
    {
      title: '收货地址',
      dataIndex: 'receiver',
      render: (col: any, record: any) => record.receiveAddress.area.replaceAll('/','') + record.receiveAddress.detailedAddress
    },
    // {
    //   title: '详细地址',
    //   dataIndex: 'detailedAddress',
    //       render: (col: any, record: any) => {
    //   return (
    //     <>
    //       {record.status === 'SALE' ? (
    //         <Badge status="success" text="上架" />
    //       ) : (
    //         <Badge status="error" text="下架" />
    //       )}
    //     </>
    //   )
    // }
    // },
    {
      title: '操作',
      dataIndex: 'operation',
      align: 'left' as const,
      // render: (col: any, record: any) => {
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

      //   return (
      //     <>
      //       <Space>
      //         <Button
      //           type="text"
      //           size="small"
      //           style={{ padding: 0 }}
      //           onClick={handleUpdateAddress}
      //         >
      //           编辑
      //         </Button>
      //         <Button
      //           type="text"
      //           status="danger"
      //           size="small"
      //           style={{ padding: 0, marginLeft: 10 }}
      //           onClick={handleDeleteAddress}
      //         >
      //           删除
      //         </Button>
      //       </Space>
      //     </>
      //   )
      // }
    }
  ]

  const handleGetMerchantOrders =  (query: OrderQueryParams) => {
    setLoading(true)
      getMerchantOrders(query).then((res) => {
      const {orders,total} = res.data!
      setOrders(orders)
      setPagination((pagination) => ({ ...pagination, total }))
    }).finally(() => {
      
      setLoading(false)
    })
  }

  useEffect(() => {
    handleGetMerchantOrders({ status: 'WAITDISPATCH' })
  },[])

  return <>
      <Table
        loading={loading}
        columns={columns}
        data={orders}
        pagination={pagination}
        // onChange={onChangeTable}
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
}
