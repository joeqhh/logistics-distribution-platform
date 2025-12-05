import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {type Product} from '@/api'

interface User {
  id: string
  username: string
  email?: string
  phone?: string
}

interface Address {
  id: string
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}


interface AppState {
  // 用户状态
  isLogin: boolean
  user: User | null
  login: (user: User) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  
  // 地址管理
  addresses: Address[]
  addAddress: (address: Omit<Address, 'id'>) => void
  updateAddress: (id: string, address: Partial<Address>) => void
  deleteAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
  
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 用户状态
      isLogin: false,
      user: null,
      login: (user: User) => set({ isLogin: true, user }),
      logout: () => set({ isLogin: false, user: null }),
      updateUser: (userData: Partial<User>) => 
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        })),
      
      // 地址管理
      addresses: [],
      addAddress: (address: Omit<Address, 'id'>) => 
        set((state) => {
          const newAddress = {
            ...address,
            id: Date.now().toString()
          }
          return {
            addresses: state.addresses.concat(newAddress)
          }
        }),
      updateAddress: (id: string, addressData: Partial<Address>) =>
        set((state) => ({
          addresses: state.addresses.map(addr => 
            addr.id === id ? { ...addr, ...addressData } : addr
          )
        })),
      deleteAddress: (id: string) =>
        set((state) => ({
          addresses: state.addresses.filter(addr => addr.id !== id)
        })),
      setDefaultAddress: (id: string) =>
        set((state) => ({
          addresses: state.addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === id
          }))
        })),
    }),
    {
      name: 'logistics-mall-storage',
      partialize: (state) => ({
        isLogin: state.isLogin,
        user: state.user,
        addresses: state.addresses,
      })
    }
  )
)