import { InputNumber } from '@arco-design/web-react'
import { IconMinus } from '@arco-design/web-react/icon'
import styles from './index.module.less'

type InputValue = {
  begin: number | undefined
  end: number | undefined
}

interface NumberPickerProps {
  value?: InputValue
  onChange?: (value: InputValue) => any
  precision?: number
  beginPlaceholder?: string
  endPlaceholder?: string
}

export default function NumberPicker({ value, onChange, precision = 0, beginPlaceholder, endPlaceholder }: NumberPickerProps) {
  const { begin, end } = value || { begin: undefined, end: undefined }

  return (
    <>
      <div className={styles['number-picker-container']}>
        <InputNumber
          placeholder={beginPlaceholder}
          className={styles['number-picker-input']}
          min={0}
          step={1}
          defaultValue={begin}
          precision={precision}
          onChange={(val) => {
            onChange?.({ begin: val as number, end })
          }}
        />
        <IconMinus style={{ color: 'var(--color-text-1)', margin: '0 8px' }} />
        <InputNumber
          placeholder={endPlaceholder}
          className={styles['number-picker-input']}
          min={begin ? Math.max(0, begin) : undefined}
          step={1}
          defaultValue={end}
          precision={precision}
          onChange={(val) => {
            onChange?.({ begin, end: val as number })
          }}
        />
      </div>
    </>
  )
}
