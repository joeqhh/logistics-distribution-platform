import {useEffect} from 'react'
import AMapLoader from '@amap/amap-jsapi-loader'

interface MapProps {
    mapKey: string
    className?: string
    style?: React.CSSProperties
    onCreated?: (map: any,AMap: any) => any
    plugins?: string[]
}


export default function Map({className,mapKey,onCreated,style,plugins}:MapProps ) {

  useEffect(() => {
    let map: any
    AMapLoader.load({
      key: mapKey, // 申请好的Web端开发者Key，首次调用 load 时必填
      version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins, // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    })
      .then((AMap) => {
        map = new AMap.Map('map-container', {
          // 设置地图容器id
          viewMode: '3D', // 是否为3D地图模式
          zoom: 11, // 初始化地图级别
        })
        onCreated?.(map,AMap)
      })
      .catch((e) => {
        console.log(e)
      })

    return () => {
      map?.destroy()
    }
  }, [])

  return (
    <div id="map-container" className={className} style={style}></div>
  )
}
