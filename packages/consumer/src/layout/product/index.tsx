import React, { useEffect } from 'react'
import { Layout } from '@arco-design/web-react'
import { useStore } from '@/store'
import styles from './index.module.less'
import Navbar from '@/components/navbar'
const { Header, Content, Footer } = Layout

interface LayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: LayoutProps) {
  const initUserInfo = useStore((state) => state.initUserInfo)

  useEffect(() => {
    initUserInfo()
  }, [])

  return (
    <Layout className={styles.layout} style={{ backgroundColor: '#fff' }}>
      <Header className={styles.header}>
        <Navbar />
      </Header>

      <Content className={styles.content}>{children}</Content>

      <Footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerInfo}>
            <p>© 2025 电商物流配送平台 版权所有</p>
          </div>
          <div className={styles.footerLinks}>
            <a href="#">关于我们</a>
            <a href="#">联系我们</a>
            <a href="#">隐私政策</a>
          </div>
        </div>
      </Footer>
    </Layout>
  )
}
