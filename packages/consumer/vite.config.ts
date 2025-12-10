import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true
        }
      }
    },
    server: {
      proxy: {
        '/api': {
          // target: env.VITE_BACKEND_URL,
          target: 'http://localhost:3001',
          changeOrigin: true // 修改请求的 origin 为目标服务器的 origin
          // rewrite: (path) => path.replace(/^\/api/, ''), // 重写路径，去掉 "/api" 前缀
        },
        '/object': {
          target: env.VITE_OBJECT_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/object/, '')
        },
        '/socket.io': {
          // target: 'http://127.0.0.1:5000',
          target: env.VITE_BACKEND_URL,
          ws: true,
          changeOrigin: true,
        },
      }
    }
  }
})
