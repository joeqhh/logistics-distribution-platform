import { RouterProvider } from 'react-router'
import router from './routers'
// import AuthRouter from "./router/utils/AuthRouter";
// import Permission from "./layout/Permission";
import './App.css'

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
