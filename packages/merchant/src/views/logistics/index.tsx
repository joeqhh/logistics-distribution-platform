import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrderDetail, logisticsCompaniyLogos, type Order } from '@/api'
import { Map } from '@logistics-distribution-platform/shared-ui'
import Header from '@/layout/header'
import {
  Layout,
  Empty,
  Spin,
  Timeline,
  Image,
  Button,
  Message
} from '@arco-design/web-react'
import styles from './index.module.less'
import { localeStringDate } from '@/utils/formatDate'
import receiveIcon from '@/assets/re.png'
import Footer from '@/layout/footer'

const TimelineItem = Timeline.Item

const iconMap = {
  TRANSPORTING: () => import('@/assets/track.png'),
  DELIVERING: () => import('@/assets/deliver.png'),
  WAITRECEIVE: () =>
    Promise.resolve({
      default: 'https://webapi.amap.com/theme/v1.3/markers/n/end.png'
    }),
  RECEIVED: () =>
    Promise.resolve({
      default: 'https://webapi.amap.com/theme/v1.3/markers/n/end.png'
    })
} as const

const logisticsStatus = {
  WAITDELIVER: '已下单',
  TRANSPORTING: '运输中',
  DELIVERING: '派送中',
  WAITRECEIVE: '待收货',
  RECEIVED: '已收货'
} as const

export default function Logistics() {
  const { orderId } = useParams<{ orderId: string }>()
  const [isEmpty, setIsEmpty] = useState(true)
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<Order>()

  const [logistics, setLogistics] = useState<any[]>()

  useEffect(() => {
    getOrderDetail(orderId)
      .then((res) => {
        if (res.data) {
          const { logistics, order } = res.data
          console.log(res.data)
          if (!order || order.status === 'WAITDELIVER') {
            setIsEmpty(true)
            return
          }
          console.log(order)

          setIsEmpty(false)
          setOrder(order)
          setLogistics(logistics)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleOnCreatedMap = async (map: any, AMap: any) => {
    if (order) {
      const route = logistics!

      const path = []
      for (let i = 1, l = route.length; i < l; i++) {
        const step = route[i]
        const locations = step.location.split(';')

        for (const location of locations) {
          const [lng, lat] = location
            .split(',')
            .map((point: string) => parseFloat(point))

          const lnglat = new AMap.LngLat(lng, lat)
          path.push(lnglat)
        }
      }

      const startMarker = new AMap.Marker({
        position: path[0],
        icon: 'https://webapi.amap.com/theme/v1.3/markers/n/start.png',
        map: map,
        anchor: 'center'
      })

      const endMarker = new AMap.Marker({
        position: path[path.length - 1],
        icon: (await iconMap[order.status as keyof typeof iconMap]()).default,
        map: map,
        anchor: 'center'
      })

      const routeLine = new AMap.Polyline({
        path: path,
        isOutline: true,
        outlineColor: '#ffeeee',
        borderWeight: 2,
        strokeWeight: 5,
        strokeOpacity: 0.9,
        strokeColor: '#0091ff',
        lineJoin: 'round'
      })
      map.add(routeLine)

      map.setFitView([startMarker, endMarker, routeLine])
    }
  }

  const handleOnCopy = () => {
    navigator.clipboard
      .writeText(order?.number || '')
      .then((res) => {
        Message.success('复制成功')
      })
      .catch((err) => {
        Message.error('复制失败')
      })
  }

  return (
    <>
      <Layout>
        <Layout.Header>
          <Header />
        </Layout.Header>

        <Layout.Content className={styles['logistics-body']}>
          {loading ? (
            <Spin />
          ) : (
            <>
              {isEmpty ? (
                <Empty description="暂无物流信息" />
              ) : (
                <>
                  {logistics && (
                    <>
                      <Map
                        plugins={['AMap.Driving']}
                        onCreated={handleOnCreatedMap}
                        mapKey={import.meta.env.VITE_KEY}
                        style={{ width: '100%', height: 500 }}
                      />

                      <div className={styles['logistics-content']}>
                        <div className={styles['logistics-content-product']}>
                          <Image
                            width={64}
                            height={64}
                            src={`/object/${order?.product.cover}`}
                          ></Image>
                          <div
                            className={styles['logistics-content-product-text']}
                          >
                            <span style={{color: 'rgba(0,0,0,.92)'}}>
                              {
                                logisticsStatus[
                                  order?.status as keyof typeof logisticsStatus
                                ]
                              }
                            </span>
                            <span>{order?.product.name}</span>
                            <span>{'查看商品 >'}</span>
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
                                index < logistics.length - 1
                                  ? '#C9CDD4'
                                  : undefined
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
                              <span>{localeStringDate(item.createTime)}</span>
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
        </Layout.Content>
      </Layout>
    </>
  )
}
