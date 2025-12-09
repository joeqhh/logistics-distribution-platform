import { useEffect } from 'react'
import Navbar from '@/components/NavBar'
import styles from './index.module.less'
import { useStore } from '@/store'

export default function Header() {
  const { initUserInfo } = useStore()

  useEffect(() => {
    initUserInfo()
  }, [])

  return (
    <div className={styles['layout-navbar']}>
      <Navbar show={true} />
    </div>
  )
}
