import { useState } from 'react'
import styles from './index.module.less'
import {
  Image,
  Badge,
  Table,
  Space,
  Button,
  Message
} from '@arco-design/web-react'
import { getMerchantProducts, putProductOnSale, putProductOffSale, deleteProduct, batchPutProductsOnSale, batchPutProductsOffSale, batchDeleteProducts } from '@/api/product'
import { useEffect } from 'react'
import { formatLocalDateTime } from '@/utils/formatDate'
import { Product } from '@/api/types'



export default function ProductList() {
  const [productList, setProductList] = useState([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>(
    []
  )
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
    title: '商品编号',
    dataIndex: 'id'
  },
  {
    title: '商品信息',
    dataIndex: 'name',
    render: (col: any, record: any) => {
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Image 
              src={'/object' + record.cover}
              width={50}
              height={50}
            />
            <span style={{ marginLeft: 10 }}>{record.name}</span>
          </div>
        </>
      )
    }
  },
  {
    title: '状态',
    dataIndex: 'status',
    filterMultiple: false,
    filters: [
      {
        text: '上架',
        value: 'SALE',
      },
      {
        text: '下架',
        value: 'UNDERCARRIAGE',
      },
    ],
    render: (col: any, record: any) => {
      return (
        <>
          {record.status === 'SALE' ? (
            <Badge status="success" text="上架" />
          ) : (
            <Badge status="error" text="下架" />
          )}
        </>
      )
    }
  },
  {
    title: '价格',
    dataIndex: 'price',
    sorter: (a: Product, b: Product) => Number(a.price) - Number(b.price),
  },
  {
    title: '销量',
    dataIndex: 'sales',
    sorter: (a: Product, b: Product) => a.sales - b.sales,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    render: (col: any, record: any) => {
      return formatLocalDateTime(record.createTime)
    }
  },
  {    
    title: '操作',
    dataIndex: 'operation',
    align: "left" as const,
    render: (col: any, record: any) => {
      const handleStatusChange = async () => {
        try {
          setLoading(true)
          if (record.status === 'UNDERCARRIAGE') {
            await putProductOnSale(record.id)
            Message.success('商品上架成功')
          } else {
            await putProductOffSale(record.id)
            Message.success('商品下架成功')
          }
          // 重新加载数据
          const res = await getMerchantProducts(pagination.current, pagination.pageSize)
          setProductList(res.data.list)
        } catch (error) {
          Message.error('操作失败，请重试')
        } finally {
          setLoading(false)
        }
      }

      const handleDelete = async () => {
        try {
          setLoading(true)
          await deleteProduct(record.id)
          Message.success('删除成功')
          // 重新加载数据
          const res = await getMerchantProducts(pagination.current, pagination.pageSize)
          setProductList(res.data.list)
        } catch (error) {
          Message.error('删除失败，请重试')
        } finally {
          setLoading(false)
        }
      }

      return (
        <>
          <Space >
            <Button 
              type="text" 
              size="small" 
              style={{ padding: 0 }}
              onClick={handleStatusChange}
            >
              {record.status === 'UNDERCARRIAGE' ? '上架' : '下架'}
            </Button>
            <Button type="text" size="small" style={{ padding: 0, marginLeft: 10 }}>
              编辑
            </Button>
            <Button 
              type="text" 
              status="danger" 
              size="small" 
              style={{ padding: 0, marginLeft: 10 }}
              onClick={handleDelete}
            >
              删除
            </Button>
          </Space>
        </>
      )
    }
  }
]


  function onChangeTable(pagination: any,_: any,filters: any) {
    const { current, pageSize } = pagination
    setLoading(true)
    getMerchantProducts(current, pageSize,filters.status?.[0]).then((res) => {
      setProductList(res.data.list)
      setPagination((pagination) => ({ ...pagination, current, pageSize ,total: res.data.total }))
      setLoading(false)
    })
  }

  // 批量上架
  const handleBatchOnSale = async () => {
    if (selectedRowKeys.length === 0) {
      Message.warning('请选择要上架的商品')
      return
    }
    
    try {
      setLoading(true)
      await batchPutProductsOnSale(selectedRowKeys.map(key => key.toString()))
      Message.success('批量上架成功')
      setSelectedRowKeys([])
      // 重新加载数据
      const res = await getMerchantProducts(pagination.current, pagination.pageSize)
      setProductList(res.data.list)
    } catch (error) {
      Message.error('批量上架失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 批量下架
  const handleBatchOffSale = async () => {
    if (selectedRowKeys.length === 0) {
      Message.warning('请选择要下架的商品')
      return
    }
    
    try {
      setLoading(true)
      await batchPutProductsOffSale(selectedRowKeys.map(key => key.toString()))
      Message.success('批量下架成功')
      setSelectedRowKeys([])
      // 重新加载数据
      const res = await getMerchantProducts(pagination.current, pagination.pageSize)
      setProductList(res.data.list)
    } catch (error) {
      Message.error('批量下架失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      Message.warning('请选择要删除的商品')
      return
    }
    
    try {
      setLoading(true)
      await batchDeleteProducts(selectedRowKeys.map(key => key.toString()))
      Message.success('批量删除成功')
      setSelectedRowKeys([])
      // 重新加载数据
      const res = await getMerchantProducts(pagination.current, pagination.pageSize)
      setProductList(res.data.list)
    } catch (error) {
      Message.error('批量删除失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getMerchantProducts(pagination.current, pagination.pageSize).then((res) => {
      setProductList(res.data.list)
      setPagination((pagination) => ({ ...pagination, total: res.data.total }))
    })
  }, [])

  return (
    <div className={styles.container}>
      <Space style={{ marginBottom: 16 ,width: '100%', display: 'flex', justifyContent: 'flex-end'}}>
        <Button 
          type="primary" 
          onClick={handleBatchOnSale}
          loading={loading}
          disabled={selectedRowKeys.length === 0}
        >
          批量上架
        </Button>
        <Button 
          onClick={handleBatchOffSale}
          loading={loading}
          disabled={selectedRowKeys.length === 0}
        >
          批量下架
        </Button>
        <Button 
          type="primary" 
          status="danger" 
          onClick={handleBatchDelete}
          loading={loading}
          disabled={selectedRowKeys.length === 0}
        >
          批量删除
        </Button>
      </Space>
      
      <Table
        loading={loading}
        columns={columns}
        data={productList}
        pagination={pagination}
        onChange={onChangeTable}
        rowKey="id"
        rowSelection={{
          selectedRowKeys,
          onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRowKeys(selectedRowKeys)
          }
        }}
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
    </div>
  )
}
