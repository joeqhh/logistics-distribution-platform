import { create } from 'zustand'
import defaultSettings from '@/settings.json'
import {getMerchantInfo, type MerchantInfo } from '@/api'

export interface GlobalState {
  settings?: typeof defaultSettings
  userInfo?: MerchantInfo
  userLoading?: boolean
  updateSettings: (settings: typeof defaultSettings) => void
  updateUserInfo: (
    userInfo?: GlobalState['userInfo'],
    userLoading?: boolean
  ) => void
  initUserInfo: () => Promise<any>
}

const initialUserInfo: MerchantInfo = {
  id: -1,
  account: '',
  name: '',
  avatar: ''
}

export const useStore = create<GlobalState>((set,get) => ({
  settings: defaultSettings,
  userInfo: initialUserInfo,
  userLoading: false,
  updateSettings: (settings) => set({ settings }),
  updateUserInfo: (userInfo = initialUserInfo, userLoading) => set({ userInfo, userLoading }),
  initUserInfo: async () => {
    const userInfo = get().userInfo
    if(!userInfo || userInfo.id === -1) {
      const res = await getMerchantInfo()
      const userInfo = res.data
      set({userInfo})
    }
  } 
}))
