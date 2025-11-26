import { useState } from 'react'
import styles from './index.module.less'
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Message,
  Upload,
} from '@arco-design/web-react'

import { UploadItem } from '@arco-design/web-react/es/Upload'
import { createProduct } from '@/api/product'


export default function ProductAdd() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [coverImage, setCoverImage] = useState<UploadItem[]>([])
  const [carouselImages, setCarouselImages] = useState<UploadItem[]>([])

  // 处理封面图片上传
  const handleCoverUpload = (fileList: UploadItem[]) => {
    // 只保留一张封面图
    setCoverImage(fileList)
  }

  // 处理取消操作

  const handleCarouselUpload = (fileList: UploadItem[]) => {
    setCarouselImages(fileList)
  }


  const handleSubmit = async (values: any) => {
      
    try {
      setLoading(true)

      // 创建FormData对象
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('price', values.price)
      formData.append('cover', coverImage[0]!.originFile!)

      // 添加轮播图片
      carouselImages.forEach((image) => {
        formData.append('image', image!.originFile!)
      })
      // 调用API创建商品
      await createProduct(formData)
      Message.success('商品添加成功！')
      // 重置表单
      form.resetFields()
      // 清空封面图片
      setCoverImage([])
      // 清空轮播图片
      setCarouselImages([])
      // 跳转到商品列表页
      // navigate('/product')
    } catch (error) {
      console.error('添加商品失败:', error)
      Message.error('添加商品失败，请重试')
    } finally {
      setLoading(false)
    // }
  }
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Form
          form={form}
          layout="vertical"
          onSubmit={handleSubmit}
          className={styles.form}
          initialValues={{
            price: 0
          }}
        >
          {/* 基本信息区域 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>添加商品</h3>

            <Form.Item
              label="商品名称"
              field="name"
              rules={[
                { required: true, message: '请输入商品名称' },
                { max: 100, message: '商品名称不能超过100个字符' }
              ]}
            >
              <Input
                placeholder="请输入商品名称"
                style={{ width: 'auto', minWidth: '300px' }}
              />
            </Form.Item>

            {/* 封面图片上传 */}
            <Form.Item
              label="封面图片"
              field="coverImage"
              rules={[{ required: true, message: '请上传商品封面图片' }]}
            >
              <Upload
                autoUpload={false}
                limit={1}
                imagePreview
                fileList={coverImage}
                onChange={handleCoverUpload}
                listType="picture-card"
              ></Upload>
              <div style={{ marginTop: 8, fontSize: 12, color: '#86909C' }}>
                仅支持单张图片，建议尺寸 800x800px
              </div>
            </Form.Item>

            {/* 轮播图片上传 */}
            <Form.Item
              label="轮播图片"
              field="carouselImages"
              rules={[{ required: true, message: '请上传至少一张轮播图片' }]}
            >
              <Upload
                autoUpload={false}
                limit={5}
                multiple
                imagePreview
                onChange={handleCarouselUpload}
                fileList={carouselImages}
                listType="picture-card"
              ></Upload>
              <div style={{ marginTop: 8, fontSize: 12, color: '#86909C' }}>
                支持最多5张图片，建议尺寸 800x800px
              </div>
            </Form.Item>
          </div>

          {/* 价格区域 */}
          <div className={styles.section}>
            <Form.Item
              label="商品价格"
              field="price"
              rules={[
                { required: true, message: '请输入商品价格' },
                { type: 'number', min: 0, message: '价格不能为负数' }
              ]}
            >
              <InputNumber
                style={{ width: '300px' }}
                placeholder="请输入价格"
                precision={2}
              />
            </Form.Item>
          </div>

          {/* 操作按钮区域 */}
          <div className={styles.actionBar}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={loading}
              style={{ marginRight: 12 }}
            >
              提交
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}