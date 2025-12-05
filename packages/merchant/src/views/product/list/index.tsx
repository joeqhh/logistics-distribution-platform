import { useState } from 'react'
import styles from './index.module.less'
import {
  Image,
  Badge,
  Table,
  Space,
  Button,
  Message,
  Form,
  Select,
  Input,
  DatePicker,
} from '@arco-design/web-react'
import { IconSearch, IconRefresh } from '@arco-design/web-react/icon'
import {
  getMerchantProducts,
  putProductOnSale,
  putProductOffSale,
  deleteProduct,
  batchPutProductsOnSale,
  batchPutProductsOffSale,
  batchDeleteProducts
} from '@/api/product'
import { useEffect } from 'react'
import { formatLocalDateTime } from '@/utils/formatDate'
import { Product } from '@/api/types'
import NumberPicker from '@/components/NumberPicker'
import ProductEditModal from './productEditModal'

export default function ProductList() {
        const [editVisible, setEditVisible] = useState(false)
  const [editProduct, setEditProduct] = useState<Product>()

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

  const [form] = Form.useForm()

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
              <Image src={'/object' + record.cover} width={50} height={50} />
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
          value: 'SALE'
        },
        {
          text: '下架',
          value: 'UNDERCARRIAGE'
        }
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
      sorter: (a: Product, b: Product) => Number(a.price) - Number(b.price)
    },
    {
      title: '销量',
      dataIndex: 'sales',
      sorter: (a: Product, b: Product) => a.sales - b.sales
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
      align: 'left' as const,
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
            const res = await getMerchantProducts({
              page: pagination.current,
              limit: pagination.pageSize
            })
            setProductList(res.data.list)
          } catch (error) {
            Message.error('操作失败，请重试')
          } finally {
            setLoading(false)
          }
        }

        const handleEditProduct = async () => {
          setEditProduct(record)
          setEditVisible(true)
        }

        const handleDelete = async () => {
          try {
            setLoading(true)
            await deleteProduct(record.id)
            Message.success('删除成功')
            // 重新加载数据
            const res = await getMerchantProducts({
              page: pagination.current,
              limit: pagination.pageSize
            })
            setProductList(res.data.list)
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
                style={{ padding: 0 }}
                onClick={handleStatusChange}
              >
                {record.status === 'UNDERCARRIAGE' ? '上架' : '下架'}
              </Button>
              <Button
                type="text"
                size="small"
                style={{ padding: 0, marginLeft: 10 }}
                onClick={handleEditProduct}
              >
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

  function onChangeTable(
    pagination: any,
    _: any,
    filters: any,
  ) {
    const { current, pageSize } = pagination
    setLoading(true)
    getMerchantProducts({
      page: current,
      limit: pageSize,
      status: filters.status?.[0],
    }).then((res) => {
      setProductList(res.data.list)
      setPagination((pagination) => ({
        ...pagination,
        current,
        pageSize,
        total: res.data.total
      }))
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
      await batchPutProductsOnSale(selectedRowKeys.map((key) => key.toString()))
      Message.success('批量上架成功')
      setSelectedRowKeys([])
      // 重新加载数据
      const res = await getMerchantProducts({
        page: pagination.current,
        limit: pagination.pageSize
      })
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
      await batchPutProductsOffSale(
        selectedRowKeys.map((key) => key.toString())
      )
      Message.success('批量下架成功')
      setSelectedRowKeys([])
      // 重新加载数据
      const res = await getMerchantProducts({
        page: pagination.current,
        limit: pagination.pageSize
      })
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
      await batchDeleteProducts(selectedRowKeys.map((key) => key.toString()))
      Message.success('批量删除成功')
      setSelectedRowKeys([])
      // 重新加载数据
      const res = await getMerchantProducts({
        page: pagination.current,
        limit: pagination.pageSize
      })
      setProductList(res.data.list)
    } catch (error) {
      Message.error('批量删除失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleOnSubmitForm = () => {
    const values = form.getFieldsValue()
    const { current, pageSize } = pagination
    setLoading(true)
    getMerchantProducts({
      page: current,
      limit: pageSize,
      name: values.name,
      id: values.number,
      status: values.status,
      priceBegin: values.price && values.price.begin,
      priceEnd: values.price && values.price.end,
      salesBegin: values.sales && values.sales.begin,
      salesEnd: values.sales && values.sales.end,
      createTimeBegin: values.createTime && values.createTime[0],
      createTimeEnd: values.createTime && values.createTime[1]
    }).then((res) => {
      setProductList(res.data.list)
      setPagination((pagination) => ({
        ...pagination,
        current,
        pageSize,
        total: res.data.total
      }))
      setLoading(false)
    })
  }


  useEffect(() => {
    getMerchantProducts({
      page: pagination.current,
      limit: pagination.pageSize
    }).then((res) => {
      setProductList(res.data.list)
      setPagination((pagination) => ({ ...pagination, total: res.data.total }))
    })
  }, [])

  return (
    <>
      {editVisible && editProduct && (
        <ProductEditModal product={editProduct} visible={editVisible} onCancel={() => setEditVisible(false)}  onSuccess={handleOnSubmitForm} />
      )}

      <div className={styles.container}>
        <div className={styles['product-list-container']}>
          <Form
            form={form}
            layout="inline"
            className={styles.form}
            onSubmit={handleOnSubmitForm}
          >
            <Form.Item label="商品名称" field="name">
              <Input placeholder="请输入商品名称" />
            </Form.Item>
            <Form.Item label="商品编号" field="number">
              <Input placeholder="请输入商品编号" />
            </Form.Item>
            <Form.Item label="商品状态" field="status">
              <Select
                placeholder="全部"
                defaultValue=""
                options={[
                  { label: '全部', value: '' },
                  { label: '上架', value: 'SALE' },
                  { label: '下架', value: 'UNDERCARRIAGE' }
                ]}
              />
            </Form.Item>

            <Form.Item label="创建时间" field="createTime">
              <DatePicker.RangePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="商品价格" field="price">
              <NumberPicker
                precision={2}
                beginPlaceholder="最低价"
                endPlaceholder="最高价"
              />
            </Form.Item>
            <Form.Item label="商品销量" field="sales">
              <NumberPicker
                beginPlaceholder="最低销量"
                endPlaceholder="最高销量"
              />
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

        <Space
          style={{
            marginBottom: 16,
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-start'
          }}
        >
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
    </>
  )
}
