import Navbar from '@/components/navbar'
import styles from './index.module.less'

export default function Header() {
  return (
      <div
        className={styles['layout-navbar']}
      >
        <Navbar />
      </div>
  )
}
