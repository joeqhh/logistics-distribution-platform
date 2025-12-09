import React, { useEffect, useState } from 'react'
import {
  Button,
  Avatar,
  Upload,
  Descriptions,
  Tag,
  Skeleton,
  Link
} from '@arco-design/web-react'
import { IconCamera, IconPlus } from '@arco-design/web-react/icon'
import styles from './index.module.less'
import { localeStringDate } from '@/utils/formatDate'
import { updateConsumerProfile } from '@/api'

export default function UserInfoHeader({
  userInfo = {},
  loading,
  onUpdate
}: {
  userInfo: any
  loading: boolean
  onUpdate: (data: any) => any
}) {
  const [avatar, setAvatar] = useState('')

  function onAvatarChange(_: any, file: any) {
    setAvatar(file.originFile ? URL.createObjectURL(file.originFile) : '')
    const formData = new FormData()
    formData.append('avatar',file.originFile)
    updateConsumerProfile(formData).then(res => {
      onUpdate(res.data)
      console.log(res);
    })
  }

  useEffect(() => {
    setAvatar(userInfo.avatar)
  }, [userInfo])

  const loadingImg = (
    <Skeleton
      text={{ rows: 0 }}
      style={{ width: '100px', height: '100px' }}
      animation
    />
  )

  const loadingNode = <Skeleton text={{ rows: 1 }} animation />
  return (
    <div className={styles['info-wrapper']}>
      <Upload showUploadList={false} onChange={onAvatarChange}>
        {loading ? (
          loadingImg
        ) : (
          <Avatar
            size={100}
            triggerIcon={<IconCamera />}
            className={styles['info-avatar']}
          >
            {avatar ? <img src={`/object/${avatar}`} /> : <IconPlus />}
          </Avatar>
        )}
      </Upload>
      <Descriptions
        className={styles['info-content']}
        column={2}
        colon="："
        labelStyle={{ textAlign: 'right' }}
        data={[
          {
            label: '用户名',
            value: loading ? loadingNode : userInfo.name
          },
          {
            label: '账号',
            value: loading ? loadingNode : userInfo.account
          },
          {
            label: '注册时间',
            value: loading ? loadingNode : localeStringDate(userInfo.createTime)
          }
        ]}
      ></Descriptions>
    </div>
  )
}
