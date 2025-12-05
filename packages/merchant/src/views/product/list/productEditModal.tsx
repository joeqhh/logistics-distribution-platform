import { useState } from 'react'
import styles from './index.module.less'
import {
  Form,
  Input,
  Modal,
  Upload,
  InputNumber,
  type ModalProps,
  Message
} from '@arco-design/web-react'
import { Product } from '@/api/types'
import { UploadItem } from '@arco-design/web-react/es/Upload'
import { updateProduct } from '@/api/product'

interface ProductEditModalProps extends ModalProps {
  product: Product
  onSuccess?: (...args: any) => any
}

export default function ProductEditModal(props: ProductEditModalProps) {
  const { product, onSuccess, ...modalProps } = props
  const [form] = Form.useForm()
  const [coverImage, setCoverImage] = useState<UploadItem>()
  const [carouselImages, setCarouselImages] = useState<UploadItem[]>([])
  const [deletedImages, setDeletedImages] = useState<string[]>([])
  const [confirmLoading, setConfirmLoading] = useState(false)
  
  const handleCoverUpload = (_: any, file: UploadItem) => {
    setCoverImage(file)
  }

  const handleRemoveImages = (file: UploadItem) => {
    setDeletedImages([...deletedImages, file.url!.replace('/object', '')])
  }

  const handleCarouselUpload = (_: any, file: UploadItem) => {
    setCarouselImages([...carouselImages, file])
  }

  const handleEditSubmit = (values: any) => {
    const formData = new FormData()
    formData.append('name', values.name)
    formData.append('price', values.price)

    if (coverImage && coverImage.originFile) {
      formData.append('cover', coverImage!.originFile!)
    }

    carouselImages.forEach((image) => {
      if (image.originFile) {
        formData.append('image', image.originFile)
      }
    })
    deletedImages.forEach((imgPath) => {
      formData.append('deletedImages', imgPath)
    })
    setConfirmLoading(true)
    updateProduct(product.id, formData)
      .then(() => {
        setCoverImage(undefined)
        setCarouselImages([])
        setDeletedImages([])
        Message.success('商品更新成功')
        onSuccess?.()
        modalProps.onCancel?.()
      })
      .catch((error) => {
        console.log(error)

        Message.error('商品更新失败，请重试！')
      })
      .finally(() => {
        setConfirmLoading(false)
      })
  }

  return (
    <>
      <Modal
        title="编辑商品"
        {...modalProps}
        unmountOnExit={true}
        maskClosable={false}
        focusLock={false}
        onConfirm={() => form.submit()}
        confirmLoading={confirmLoading}
      >
        <Form
          form={form}
          onSubmit={handleEditSubmit}
          // className={styles.form}
          initialValues={{
            price: product?.price,
            name: product?.name
          }}
        >
          {/* 基本信息区域 */}
          <div className={styles.section}>
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
                defaultFileList={[
                  {
                    uid: '-2',
                    name: 'cover.png',
                    url: `/object${product?.cover}`
                  }
                ]}
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
                onRemove={handleRemoveImages}
                onChange={handleCarouselUpload}
                defaultFileList={
                  product?.images.map((img: string, index: number) => ({
                    uid: `-${index}`,
                    name: `image-${index}.png`,
                    url: `/object${img}`
                  })) || []
                }
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
        </Form>
      </Modal>
    </>
  )
}
