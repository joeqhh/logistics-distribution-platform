import React from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store';

// 权限控制Hook
export const useAuth = () => {
  const { user, isLogin } = useAppStore();
  
  const checkAuth = () => {
    if (!isLogin || !user) {
      return false;
    }
    return true;
  };
  
  const requireAuth = () => {
    if (!checkAuth()) {
      // 这里可以添加一些额外的逻辑，比如保存当前页面以便登录后重定向
      return false;
    }
    return true;
  };
  
  return {
    user,
    isLogin,
    checkAuth,
    requireAuth,
  };
};

// 受保护的路由组件
interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: string;
}

// 具名导出
const ProtectedRouteImpl: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = '/login' 
}) => {
  const location = useLocation();
  const { requireAuth } = useAuth();
  
  // 如果未授权，重定向到登录页面，并保存当前路径以便登录后返回
  if (!requireAuth()) {
    return <Redirect to={{ pathname: fallback, state: { from: location } }} />;
  }
  
  return <>{children}</>;
};

// 同时导出具名和默认
// 具名导出
export const ProtectedRoute = ProtectedRouteImpl;
// 默认导出
export default ProtectedRouteImpl;

// 登录检查装饰器，用于函数式组件内的权限控制
export const WithAuthCheck = (
  fn: () => any,
  fallbackAction?: () => void
) => {
  const { isLogin } = useAppStore();
  
  return () => {
    if (!isLogin) {
      if (fallbackAction) {
        fallbackAction();
      } else {
        // 默认重定向到登录页
        window.location.href = '/login';
      }
      return;
    }
    
    fn();
  };
};