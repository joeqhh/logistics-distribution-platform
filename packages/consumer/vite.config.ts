import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://8.148.81.252:5001',
        // target: 'http://127.0.0.1:5000',
        changeOrigin: true, // 修改请求的 origin 为目标服务器的 origin
        rewrite: (path) => path.replace(/^\/api/, ''), // 重写路径，去掉 "/api" 前缀
      },
      '/object': {
        target: 'http://8.148.81.252:9000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/object/, ''),
      },
      '/socket.io': {
        // target: 'http://127.0.0.1:5000',
        target: 'http://8.148.81.252:5001',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
