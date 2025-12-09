import Map from '../Map'
import {
  Empty,
  Spin,
  Timeline,
  Image,
  Button,
  Message
} from '@arco-design/web-react'
import styles from './index.module.less'
import { localeStringDate } from '../../utils/formatDate'
import receiveIcon from '../../assets/re.png'
import Footer from './footer'
import {
  type Order,
  type Logistics
} from '@logistics-distribution-platform/backend/src/models'

const TimelineItem = Timeline.Item

const logisticsStatus = {
  WAITDELIVER: '已下单',
  TRANSPORTING: '运输中',
  DELIVERING: '派送中',
  WAITRECEIVE: '待收货',
  RECEIVED: '已收货'
} as const

const logisticsCompaniyLogos = {
  顺丰速运: '/object/platform-avatar/shunfeng.png',
  中通快递: '/object/platform-avatar/zhongtong.png',
  圆通速递: '/object/platform-avatar/yuantong.png',
  申通快递: '/object/platform-avatar/shentong.png',
  韵达快递: '/object/platform-avatar/yunda.jpg',
  京东快递: '/object/platform-avatar/jingdong.png',
  邮政EMS: '/object/platform-avatar/ems.png',
  中国邮政快递包裹: '/object/platform-avatar/youzheng.png',
  百世快递: '/object/platform-avatar/baishi.png',
  德邦快递: '/object/platform-avatar/debang.png',
  极兔速递: '/object/platform-avatar/jitu.jpg',
  天天快递: '/object/platform-avatar/tiantian.png',
  苏宁物流: '/object/platform-avatar/suning.jpg'
} as const

interface LogisticsCompProps {
  mapKey: string
  handleOnCreatedMap?: (map: any, AMap: any) => Promise<any>
  order?: Order
  logistics?: Logistics[]
  loading?: boolean
  isEmpty?: boolean
}

export default function LogisticsComp(props: LogisticsCompProps) {
  const { handleOnCreatedMap, order, logistics, mapKey ,loading, isEmpty} = props

  const handleOnCopy = () => {
    navigator.clipboard
      .writeText(order?.number || '')
      .then(() => {
        Message.success('复制成功')
      })
      .catch(() => {
        Message.error('复制失败')
      })
  }

  const handleToProductDetail = () => {
    const productId = order?.product.id
    if (productId) {
      window.open(`http://localhost:5173/product/${productId}`, '_blank')
    }
  }

  return (
    <>
      {loading ? (
        <Spin />
      ) : (
        <>
          {isEmpty ? (
            <Empty description="暂无物流信息" />
          ) : (
            <>
              {logistics && order && (
                <>
                  <Map
                    plugins={['AMap.Driving']}
                    onCreated={handleOnCreatedMap}
                    mapKey={mapKey}
                    style={{ width: '100%', height: 500 }}
                  />

                  <div className={styles['logistics-content']}>
                    <div className={styles['logistics-content-product']}>
                      <Image
                        width={64}
                        height={64}
                        src={`/object/${order?.product.cover}`}
                      ></Image>
                      <div className={styles['logistics-content-product-text']}>
                        <span style={{ color: 'rgba(0,0,0,.92)' }}>
                          {
                            logisticsStatus[
                              order?.status as keyof typeof logisticsStatus
                            ]
                          }
                        </span>
                        <span>{order?.product.name}</span>
                        <span
                          onClick={handleToProductDetail}
                          style={{ cursor: 'pointer' }}
                        >
                          {'查看商品 >'}
                        </span>
                      </div>
                    </div>
                    <div className={styles['logistics-content-company']}>
                      <img
                        className={styles['logistics-content-img']}
                        src={
                          logisticsCompaniyLogos[
                            order?.company as keyof typeof logisticsCompaniyLogos
                          ]
                        }
                      />
                      {order?.company} {order?.number}
                      <Button
                        type="text"
                        style={{
                          marginLeft: 6,
                          color: 'var(--color-text-2)'
                        }}
                        onClick={() => handleOnCopy()}
                      >
                        复制
                      </Button>
                    </div>
                    <Timeline
                      reverse
                      direction="vertical"
                      style={{ width: '100%' }}
                    >
                      {logistics.map((item, index) => (
                        <TimelineItem
                          key={item.id}
                          label={
                            <span style={{ fontSize: 14 }}>
                              {item.describe}
                            </span>
                          }
                          dotColor={
                            index < logistics.length - 1 ? '#C9CDD4' : undefined
                          }
                        >
                          <span
                            style={{
                              fontWeight: 'bold',
                              fontSize: '16px',
                              marginRight: 10
                            }}
                          >
                            {index === logistics.length - 1 ||
                            item.status != logistics[index + 1].status
                              ? logisticsStatus[
                                  item.status as keyof typeof logisticsStatus
                                ]
                              : ''}
                          </span>
                          <span>
                            {localeStringDate(
                              typeof item.createTime === 'string'
                                ? item.createTime
                                : item.createTime.toString()
                            )}
                          </span>
                        </TimelineItem>
                      ))}
                    </Timeline>
                    <div className={styles['logistics-content-receiver']}>
                      <img
                        className={styles['logistics-content-img']}
                        src={receiveIcon}
                        alt=""
                      />
                      <span>
                        {order?.receiveAddress.name}，
                        {order?.receiveAddress.phone}，
                        {order?.receiveAddress.area.replaceAll('/', '') +
                          order?.receiveAddress.detailedAddress}
                      </span>
                    </div>
                    <Footer />
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  )
}
