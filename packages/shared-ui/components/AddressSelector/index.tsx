import options from './areaData.json'
import { Cascader } from '@arco-design/web-react'

interface AdressSelectorProps {
  onChange?: (address: string) => any
  value?: string | string[]
}

const AdressSelector = ({ onChange,value }: AdressSelectorProps) => {
  return (
      <Cascader
        options={options}
        defaultValue={Array.isArray(value) ? value : value?.split('/')}
        onChange={(value) =>
          onChange?.(Array.isArray(value) ? value.join('/') : value)
        }
        placeholder="请选择省 / 市 / 区 / 街道"
      />
  )
}

export default AdressSelector
