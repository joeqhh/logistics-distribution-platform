import { useRef, useState, useEffect } from 'react'
import styles from './index.module.less'
import { Button, Message } from '@arco-design/web-react'
import { getMerchantDeliveryArea, updateMerchantDeliveryArea } from '@/api'
import { Map } from '@logistics-distribution-platform/shared-ui'

const defaultPath = [
  [97.110528, 40.453448],
  [116.680303, 42.734775],
  [118.946736, 27.880342],
  [98.269077, 29.070466]
]

export default function DeliverRange() {
  const polyEditor = useRef<any>()

  const [isEdit, setIsEdit] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  const handleOnMapCreated = (map: any, AMap: any) => {
    getMerchantDeliveryArea().then((res) => {
      const currentPath = res.data.deliveryArea
      const path = currentPath || defaultPath
      const polygon = new AMap.Polygon({
        path: path,
        strokeColor: 'green',
        strokeWeight: 6,
        strokeOpacity: 0.2,
        fillOpacity: 0.4,
        fillColor: '#1791fc',
        zIndex: 50,
        bubble: true
      })

      // var marker = new AMap.Marker({
      //   map: map,
      //   draggable: true,
      //   position: [116.566298, 40.014179]
      // })

      // function compute() {
      //   var point = marker.getPosition()
      //   var isPointInRing = AMap.GeometryUtil.isPointInRing(point, path)
      //   marker.setLabel({
      //     content: isPointInRing ? '内部' : '外部',
      //     offset: new AMap.Pixel(20, 0)
      //   })
      // }
      // compute()
      // // 为marker绑定拖拽事件
      // marker.on('dragging', compute)

      map.add([polygon])

      // 缩放地图到合适的视野级别
      map.setFitView()
      polyEditor.current = new AMap.PolygonEditor(map, polygon)
    })
  }

  const handleEditDeliveRange = () => {
    polyEditor.current?.open()
    setIsEdit(true)
  }

  const handleSaveDeliveRange = async () => {
    setSubmitLoading(true)
    polyEditor.current?.close()
    const paths = polyEditor.current?.getTarget().getPath()
    console.log(paths)
    try {
      const deliveryArea = paths.map((path: any) => [path.lng, path.lat])
      await updateMerchantDeliveryArea({ deliveryArea })
      setIsEdit(false)
      Message.success('修改成功！')
    } catch (error) {
      Message.success('修改失败！')
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <>
      <div className={styles.container}>
        <Button
          type="primary"
          loading={submitLoading}
          className={styles['update-button']}
          onClick={() =>
            isEdit ? handleSaveDeliveRange() : handleEditDeliveRange()
          }
        >
          {isEdit ? '保存配送范围' : '修改配送范围'}
        </Button>

        <Map
          plugins={['AMap.PolygonEditor']}
          onCreated={handleOnMapCreated}
          mapKey={import.meta.env.VITE_KEY}
          style={{ width: '100%', flex: 1 }}
        />

      </div>
    </>
  )
}
