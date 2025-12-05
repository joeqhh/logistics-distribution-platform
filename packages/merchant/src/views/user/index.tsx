import { useEffect, useState } from 'react'
import { Card, Tabs } from '@arco-design/web-react'
import UserInfoHeader from './header'
import InfoForm from './info'
// import Security from './security';
import { getMerchantInfo, type MerchantInfo } from '@/api'
import {useStore} from '@/store'

function UserInfo() {
  // const [userInfo, setUserInfo] = useState<MerchantInfo>()
  const loading = false
  const [activeTab, setActiveTab] = useState('basic')

  const {userInfo,updateUserInfo} = useStore()


  // useEffect(() => {
  //   getUserInfo().then((res) => {
  //     setUserInfo(res)
  //     console.log(res);
      
  //   })
  // }, [])

  const onUpdate = (newUserInfo: MerchantInfo) => {
    
    updateUserInfo(newUserInfo)
  }

  return (
    <div>
      <Card style={{ padding: '14px 20px' }}>
        <UserInfoHeader userInfo={userInfo} loading={loading} onUpdate={onUpdate} />
      </Card>
      <Card style={{ marginTop: '16px' }}>
        <Tabs activeTab={activeTab} onChange={setActiveTab} type="rounded">
          <Tabs.TabPane key="basic" title="基本信息">
            {userInfo && 
            
            <InfoForm loading={loading} userInfo={userInfo} onUpdate={onUpdate} />
            }
          </Tabs.TabPane>
          <Tabs.TabPane key="security" title="安全设置">
            {/* <Security /> */}
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default UserInfo
