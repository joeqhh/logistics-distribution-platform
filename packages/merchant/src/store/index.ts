import { create } from 'zustand';
import defaultSettings from '@/settings.json';

export interface GlobalState {
  settings?: typeof defaultSettings;
  userInfo?: {
    name?: string;
    avatar?: string;
    job?: string;
    organization?: string;
    location?: string;
    email?: string;
    permissions: Record<string, string[]>;
  };
  userLoading?: boolean;
  updateSettings: (settings: typeof defaultSettings) => void;
  updateUserInfo: (userInfo?: GlobalState['userInfo'], userLoading?: boolean) => void;
}

const initialUserInfo = {
  permissions: {},
};

export const useStore = create<GlobalState>((set) => ({
  settings: defaultSettings,
  userInfo: initialUserInfo,
  userLoading: false,
  updateSettings: (settings) => set({ settings }),
  updateUserInfo: (userInfo = initialUserInfo, userLoading) => 
    set({ userInfo, userLoading }),
}));
