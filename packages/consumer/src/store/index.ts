import { create } from 'zustand'
import defaultSettings from '@/settings.json'
import { type ConsumerInfo, consumerProfile } from '@/api'
import { persist } from 'zustand/middleware'
import {removeToken} from '@/utils/authentication'

export interface GlobalState {
  isLogin: boolean
  login: (user: ConsumerInfo) => void
    logout: () => void
  settings?: typeof defaultSettings
  userInfo?: ConsumerInfo
  userLoading?: boolean
  updateSettings: (settings: typeof defaultSettings) => void
  updateUserInfo: (
    userInfo?: GlobalState['userInfo'],
    userLoading?: boolean
  ) => void
  initUserInfo: () => Promise<any>
}

const initialUserInfo: ConsumerInfo = {
  id: -1,
  account: '',
  name: '',
  avatar: ''
}

export const useStore = create<GlobalState>()(
  persist(
    (set, get) => ({
      isLogin: false,
      settings: defaultSettings,
      userInfo: initialUserInfo,
      userLoading: false,
      login: (userInfo: ConsumerInfo) => set({ isLogin: true, userInfo }),
      logout: () => {
        set({ isLogin: false, userInfo: undefined })
        // localStorage.setItem('cStatus', 'logout')
        removeToken()
        // window.location.href = '/login'
      },
      updateSettings: (settings) => set({ settings }),
      updateUserInfo: (userInfo = initialUserInfo, userLoading) =>
        set({ userInfo, userLoading }),
      initUserInfo: async () => {
        if(!get().isLogin) return
        const userInfo = get().userInfo
        if (!userInfo || userInfo.id === -1) {
          const res = await consumerProfile()
          const userInfo = res.data
          set({ userInfo })
        }
      }
    }),
    {
      name: 'logistics-consumer',
      partialize: (state) => ({
        isLogin: state.isLogin,
        userInfo: state.userInfo
      })
    }
  )
)
