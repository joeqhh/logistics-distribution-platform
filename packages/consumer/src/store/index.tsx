import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface Address {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface AppStore {
  // 用户状态
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // 地址状态
  addresses: Address[];
  
  // 购物车状态
  cartItems: CartItem[];
  
  // 用户操作
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  
  // 地址操作
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, updates: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  
  // 购物车操作
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  updateCartItem: (id: string, quantity: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

// 模拟数据和API调用
const mockUsers = [
  { id: '1', username: 'test', password: 'test123', email: 'test@example.com', phone: '13800138000' }
];

const mockAddresses: Address[] = [
  {
    id: '1',
    name: '张三',
    phone: '13800138000',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '某某街道某某小区1号楼101室',
    isDefault: true
  },
  {
    id: '2',
    name: '李四',
    phone: '13900139000',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    detail: '某某路123号',
    isDefault: false
  }
];

const mockCartItems: CartItem[] = [];

export const useAppStore = create<AppStore>()(persist((set, get) => ({
  // 初始状态
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  addresses: mockAddresses,
  cartItems: mockCartItems,

  // 登录
  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user = mockUsers.find(u => u.username === username && u.password === password);
      if (!user) {
        throw new Error('用户名或密码错误');
      }
      
      set({ 
        user: { id: user.id, username: user.username, email: user.email, phone: user.phone },
        isAuthenticated: true
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '登录失败' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // 登出
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  // 注册
  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 检查用户名是否已存在
      if (mockUsers.some(u => u.username === username)) {
        throw new Error('用户名已存在');
      }
      
      // 检查邮箱是否已存在
      if (mockUsers.some(u => u.email === email)) {
        throw new Error('邮箱已被注册');
      }
      
      // 创建新用户（实际应用中应该是服务器创建）
      const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password // 实际应用中应该加密存储
      };
      
      mockUsers.push(newUser);
      
      set({
        user: { id: newUser.id, username: newUser.username, email: newUser.email },
        isAuthenticated: true
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '注册失败' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // 更新用户资料
  updateUserProfile: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const currentUser = get().user;
      if (!currentUser) {
        throw new Error('用户未登录');
      }
      
      // 更新模拟用户数据
      const userIndex = mockUsers.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
      }
      
      set({ user: { ...currentUser, ...updates } });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '更新失败' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // 添加地址
  addAddress: async (address) => {
    set({ isLoading: true, error: null });
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newAddress = {
        ...address,
        id: Date.now().toString()
      };
      
      let updatedAddresses = [...get().addresses, newAddress];
      
      // 如果新地址是默认地址，更新其他地址
      if (newAddress.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({
          ...addr,
          isDefault: addr.id === newAddress.id
        }));
      }
      
      set({ addresses: updatedAddresses });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '添加地址失败' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // 更新地址
  updateAddress: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const addresses = get().addresses;
      let updatedAddresses = addresses.map(addr => 
        addr.id === id ? { ...addr, ...updates } : addr
      );
      
      // 如果更新的地址设置为默认，更新其他地址
      if (updates.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({
          ...addr,
          isDefault: addr.id === id
        }));
      }
      
      set({ addresses: updatedAddresses });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '更新地址失败' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // 删除地址
  deleteAddress: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const addresses = get().addresses;
      const addressToDelete = addresses.find(addr => addr.id === id);
      
      if (!addressToDelete) {
        throw new Error('地址不存在');
      }
      
      const updatedAddresses = addresses.filter(addr => addr.id !== id);
      
      // 如果删除的是默认地址，设置第一个地址为默认
      if (addressToDelete.isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0] = { ...updatedAddresses[0], isDefault: true };
      }
      
      set({ addresses: updatedAddresses });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '删除地址失败' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // 设置默认地址
  setDefaultAddress: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const addresses = get().addresses;
      if (!addresses.some(addr => addr.id === id)) {
        throw new Error('地址不存在');
      }
      
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      }));
      
      set({ addresses: updatedAddresses });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '设置默认地址失败' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // 添加到购物车
  addToCart: async (item) => {
    set({ isLoading: true, error: null });
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const cartItems = get().cartItems;
      const existingItemIndex = cartItems.findIndex(ci => ci.name === item.name);
      
      if (existingItemIndex !== -1) {
        // 如果商品已存在，增加数量
        const updatedItems = [...cartItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity
        };
        set({ cartItems: updatedItems });
      } else {
        // 如果商品不存在，添加新商品
        const newItem: CartItem = {
          ...item,
          id: Date.now().toString()
        };
        set({ cartItems: [...cartItems, newItem] });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '添加到购物车失败' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // 更新购物车商品数量
  updateCartItem: async (id, quantity) => {
    set({ isLoading: true, error: null });
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const cartItems = get().cartItems;
      const updatedItems = cartItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      );
      
      set({ cartItems: updatedItems });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '更新购物车商品失败' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // 从购物车移除商品
  removeFromCart: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const cartItems = get().cartItems;
      const updatedItems = cartItems.filter(item => item.id !== id);
      
      set({ cartItems: updatedItems });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '从购物车移除商品失败' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // 清空购物车
  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set({ cartItems: [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '清空购物车失败' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}), {
  name: 'app-store',
  // 持久化用户信息、地址和购物车
  partialize: (state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    addresses: state.addresses,
    cartItems: state.cartItems
  })
}));