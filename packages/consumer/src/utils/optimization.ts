import React from 'react'
/**
 * 性能优化和错误处理工具函数
 */

/**
 * 防抖函数 - 限制函数在一定时间内只能执行一次
 * @param func 要执行的函数
 * @param delay 延迟时间(毫秒)
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * 节流函数 - 限制函数在一定时间内最多执行一次
 * @param func 要执行的函数
 * @param limit 时间限制(毫秒)
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 错误处理包装器
 * @param fn 可能抛出错误的函数
 * @param errorHandler 错误处理函数
 * @returns 安全执行的函数
 */
export function safeExecute<T extends (...args: any[]) => any>(
  fn: T,
  errorHandler: (error: Error) => void = console.error
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  return (...args: Parameters<T>) => {
    try {
      return fn(...args);
    } catch (error) {
      errorHandler(error as Error);
      return undefined;
    }
  };
}

/**
 * 延迟加载组件的工具函数
 * @param importFn 动态导入函数
 * @returns 加载状态组件
 */
// export function lazyLoad<T extends React.ComponentType<any>>(
//   importFn: () => Promise<{ default: T }>
// ): React.LazyExoticComponent<T> {
//   return React.lazy(() =>
//     importFn().catch((error) => {
//       console.error('组件加载失败:', error);
//       // 返回一个错误占位组件
//       return {
//         default: () => <>
//           <div style={{ 
//             padding: '2rem', 
//             textAlign: 'center', 
//             color: '#ff4d4f' 
//           }}>
//             组件加载失败，请刷新页面重试
//           </div>
//         </>
//       };
//     })
//   );
// }

/**
 * 图片预加载函数
 * @param images 图片URL数组
 * @returns 预加载Promise
 */
export function preloadImages(images: string[]): Promise<any> {
  return Promise.all(
    images.map(
      (src) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(null)
          img.onerror = reject;
          img.src = src;
        })
    )
  );
}

/**
 * 检查是否为移动设备
 */
export const isMobile = (
  typeof window !== 'undefined' &&
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
);

/**
 * 获取设备类型
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

/**
 * 优化本地存储使用，避免频繁写入
 * @param key 存储键名
 * @param value 存储值
 * @param delay 延迟时间(毫秒)
 */
export function debouncedLocalStorage(
  key: string,
  value: any,
  delay: number = 300
): void {
  // 使用防抖来避免频繁写入
  const writeToStorage = debounce(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('本地存储写入失败:', error);
    }
  }, delay);
  
  writeToStorage();
}