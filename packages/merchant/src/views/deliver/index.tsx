import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrderDetail, getMerchantAddresses } from '@/api'
import { Map } from '@logistics-distribution-platform/shared-ui'
import Header from '@/layout/header'
import { Layout } from '@arco-design/web-react'
import styles from './index.module.less'

export default function Deliver() {
  const { orderId } = useParams<{ orderId: string }>()

  const [receiveAddress, setReceiveAddress] = useState<any>()

  useEffect(() => {
    getOrderDetail(orderId).then((res) => {
      console.log(res.data?.receiveAddress)

      setReceiveAddress(res.data?.receiveAddress)
    })
    getMerchantAddresses().then((res) => {
      console.log(res)
    })
  }, [])

  const handleOnCreatedMap = (map: any, AMap: any) => {
    const [city, ...other] = receiveAddress.area.split('/')

    const placeSearch = new AMap.PlaceSearch({
      //city 指定搜索所在城市，支持传入格式有：城市名、citycode 和 adcode
      city,
      type: '生活服务;物流速递;物流速递',
      pageIndex: 1,
      pageSize: 1
    })

    const opts: { waypoints: any } = {
      waypoints: [] //途经点参数，最多支持传入16个途经点
    }

    placeSearch.search(
      other.join('') + (receiveAddress.detailedAddress || '') + '菜鸟驿站',
      function (status: any, result: any) {
        //查询成功时，result 即对应匹配的 POI 信息
        console.log(result)
        const { lng, lat } = result.poiList.pois[0].location

        //构造路线导航类
        
        console.log(opts)
        
        // 根据起终点经纬度规划驾车导航路线
      }
    )
    const driving = new AMap.Driving({
      policy: 10,
      map: map,
      panel: 'panel'
    })
    driving.search(
      [115.801325, 28.656317],
      // [lng, lat],
        [82.986923, 46.751669],
      function (status: any, result: any) {
        console.log(result)

        // result 即是对应的驾车导航信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
        if (status === 'complete') {
          console.log('绘制驾车路线完成')
          map.setCenter([116.442581, 39.882498])
        } else {
          console.log('获取驾车数据失败：', status, result)
        }
      }
    )
  }

  return (
    <>
      <Layout>
        <Layout.Header>
          <Header />
        </Layout.Header>

        <Layout.Content className={styles['deliver-content']}> 
          {receiveAddress && (
            <>
              <Map
                plugins={['AMap.Driving', 'AMap.PlaceSearch']}
                onCreated={handleOnCreatedMap}
                mapKey={import.meta.env.VITE_KEY}
                style={{ width: '100%', height: 500 }}
              />
              <div id="panel"></div>
          <div className={styles['deliver-address-content']}>
              <div>
                {receiveAddress.name},{receiveAddress.phone},{receiveAddress.area.replaceAll('/','') + receiveAddress.detailedAddress}
              </div>

          </div>
            </>
          )}
        </Layout.Content>
      </Layout>
    </>
  )
}
