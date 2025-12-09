import { BrowserRouter, Switch, Route } from 'react-router-dom'
// import AuthRouter from "./router/utils/AuthRouter";
// import Permission from "./layout/Permission";
import './App.css'
import { ConfigProvider } from '@arco-design/web-react'
import Login from '@/views/login'
import Register from '@/views/register'
import PageLayout from '@/layout'
import Logistics from '@/views/logistics'

function App() {
  // const Router = RouterProvider as React.ComponentType<{ router: typeof router }>

  return (
    <>
      <BrowserRouter>
        <ConfigProvider
          componentConfig={{
            Card: {
              bordered: false
            },
            List: {
              bordered: false
            },
            Table: {
              border: false
            }
          }}
        >
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/logistics/:orderId" component={Logistics} />
            <Route path="/" component={PageLayout} />
          </Switch>
        </ConfigProvider>
      </BrowserRouter>
    </>
  )

  // return (
  //   <>
  //     <RouterProvider router={router} />
  //   </>
  // )
}

export default App
