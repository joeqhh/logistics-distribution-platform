import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { getOrderDetail, type Order } from '@/api'
import { LogisticsComp } from '@logistics-distribution-platform/shared-ui'
import Header from '@/layout/header'
import { Layout, Message } from '@arco-design/web-react'
import styles from './index.module.less'
import { formatTimeDiff } from '@/utils/formatDate'
import { io, Socket } from 'socket.io-client'
import './index.less'

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

function createInfoWindow(content: string) {
  const info = document.createElement('div')
  info.className = 'tooltip-info-window'

  // 内容区域
  const middle = document.createElement('div')
  middle.className = 'tiw-content'
  middle.innerHTML = content
  info.appendChild(middle)

  // 底部箭头
  const bottom = document.createElement('div')
  bottom.className = 'tiw-arrow'
  info.appendChild(bottom)

  return info
}


function animateMarker(marker: any, newLngLat: any,routeLine: any, infoWindow: any,expectTime: any,isEnd: boolean,duration = 800) {

  let i = 0

  const func = (point: any) => {
    i++
    const start = marker.getPosition();
    const lng2 = point[0];
    const lat2 = point[1];
    infoWindow.close()
    const lng1 = start.lng;
    const lat1 = start.lat;
  
    const startTime = performance.now();
  
    function animate() {
      const now = performance.now();
      const progress = Math.min((now - startTime) / duration, 1);
  
      // 插值（线性，想更丝滑可以改成 ease-in-out）
      const lng = lng1 + (lng2 - lng1) * progress;
      const lat = lat1 + (lat2 - lat1) * progress;
  
      marker.setPosition([lng, lat]);
      routeLine.setPath([...routeLine.getPath(),[lng, lat]])
      if (progress < 1) requestAnimationFrame(animate);
      else {
        if(i < newLngLat.length) {
          func(newLngLat[i])
        } else {
          if(!isEnd) {
            infoWindow.setPosition(newLngLat[newLngLat.length - 1])
            const time = formatTimeDiff(expectTime)
            infoWindow.setContent(createInfoWindow(parseInt(time) === 0 ? '即将送达' :`预计${formatTimeDiff(expectTime)}后送达`))
            infoWindow.open()
          }
        }
      }
    }
    requestAnimationFrame(animate);
  }
  func(newLngLat[i])
}



export default function Logistics() {
  const { orderId } = useParams<{ orderId: string }>()
  const [isEmpty, setIsEmpty] = useState(true)
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<Order>()
  const [expectDeliveredTime, setExpectDeliveredTime] = useState('')
  const [logistics, setLogistics] = useState<any[]>([])

  // 添加地图和标记的引用
  const mapRef = useRef<any>(null)
  const AMapRef = useRef<any>(null)
  const routeLineRef = useRef<any>(null)
  const currentMarkerRef = useRef<any>(null)
  const socketRef = useRef<Socket | null>(null)
  const callbackRef = useRef<(data: any) => any>()
  const infoWindowRef = useRef<any>()


  const socketCallback = async (data: any) => {
    const {
      points,
      logisticsCreateTime,
      logisticsDescribe,
      logisticsId,
      logisticsStatus
    } = data
    if (
      logistics.length === 0 ||
      logistics[logistics.length - 1].id !== logisticsId
    ) {
      setLogistics((value) => {
        return [
        ...value,
        {
          id: logisticsId,
          status: logisticsStatus,
          createTime: logisticsCreateTime,
          describe: logisticsDescribe
        }
      ]
      })
    }
    if(['WAITRECEIVE','RECEIVED'].includes(logisticsStatus)) {
      currentMarkerRef.current.setMap(null)
    } else {
      currentMarkerRef.current.setIcon((await iconMap[logisticsStatus as keyof typeof iconMap]()).default)
    }
    animateMarker(currentMarkerRef.current,points,routeLineRef.current,infoWindowRef.current,(order as any).expectDeliveredTime,['WAITRECEIVE','RECEIVED'].includes(logisticsStatus))
  }

  const handleOnCreatedMap = async (map: any, AMap: any) => {
    // 存储地图和AMap引用
    mapRef.current = map
    AMapRef.current = AMap

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

      const [lng, lat] = order.receiveAddress.location
        .split(',')
        .map((item: string) => parseFloat(item))

      const endMarker = new AMap.Marker({
        position: new AMap.LngLat(lng, lat),
        icon: 'https://webapi.amap.com/theme/v1.3/markers/n/end.png',
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
      routeLineRef.current = routeLine
      if (['DELIVERING', 'TRANSPORTING'].includes(order.status)) {
        const currentMarker = new AMap.Marker({
          position: path[path.length - 1],
          icon: (await iconMap[order.status as keyof typeof iconMap]()).default,
          map: map,
          anchor: 'center'
        })

        // 存储当前标记引用
        currentMarkerRef.current = currentMarker

        const infoWindow = new AMap.InfoWindow({
          isCustom: true, //使用自定义窗体
          content: createInfoWindow(`预计${expectDeliveredTime}后送达`),
          offset: new AMap.Pixel(16, -45)
        })
        infoWindowRef.current = infoWindow
        infoWindow.open(map, currentMarker.getPosition())
        map.setFitView([startMarker, currentMarker, routeLine])
        setTimeout(() => {
          map.setCenter(currentMarker.getPosition())
        }, 300)
      } else {
        map.setFitView([startMarker, endMarker, routeLine])
      }
    }
  }

  useEffect(() => {
    getOrderDetail(orderId)
      .then((res) => {
        if (res.data) {
          const { logistics, order } = res.data
          if (!order || order.status === 'WAITDELIVER') {
            setIsEmpty(true)
            return
          }

          setExpectDeliveredTime(
            formatTimeDiff((order as any).expectDeliveredTime)
          )
          setIsEmpty(false)
          setOrder(order)
          setLogistics(logistics)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!order || ['WAITRECEIVE', 'RECEIVED'].includes(order.status)) return

    // 创建WebSocket连接
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

    socketRef.current = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket'],
      query: {
        orderId: orderId
      }
    })

    const handler = (data: any) => {
      callbackRef.current?.(data)
    }

    // 连接成功事件（合并加入房间的逻辑）
    socketRef.current.on('connect', () => {
      socketRef.current?.emit('joinLogisticsRoom', orderId)
      Message.success('物流推送连接成功')
    })

    // 接收坐标更新（使用统一事件名）
    socketRef.current.on('logisticsCoordinateUpdate', handler)

    // 连接错误
    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket连接错误:', error)
      Message.error('物流推送连接失败，请刷新页面重试')
    })

    // 连接断开
    socketRef.current.on('disconnect', (reason) => {
      Message.info('物流推送已断开')
    })

    // 组件卸载时离开房间并关闭连接
    return () => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('leaveLogisticsRoom', orderId)
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [order])

  useEffect(() => {
    callbackRef.current = socketCallback
  })

  return (
    <>
      <Layout>
        <Layout.Header>
          <Header />
        </Layout.Header>
        <Layout.Content className={styles['logistics-body']}>
          <LogisticsComp
            loading={loading}
            isEmpty={isEmpty}
            handleOnCreatedMap={handleOnCreatedMap}
            order={order}
            mapKey={import.meta.env.VITE_KEY}
            logistics={logistics}
          />
        </Layout.Content>
      </Layout>
    </>
  )
}
