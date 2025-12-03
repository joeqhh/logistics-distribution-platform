import Navbar from '@/components/NavBar'
import styles from './index.module.less'

export default function Header() {
  return (
      <div
        className={styles['layout-navbar']}
      >
        <Navbar show={true} />
      </div>
  )
}
