import { BrowserRouter,Switch ,Route} from 'react-router-dom'
import router from './routers'
// import AuthRouter from "./router/utils/AuthRouter";
// import Permission from "./layout/Permission";
import './App.css'
import { ConfigProvider } from '@arco-design/web-react';
import Login from '@/views/login'
import PageLayout from '@/layout'
import Deliver from '@/views/deliver';

function App() {
  // const Router = RouterProvider as React.ComponentType<{ router: typeof router }>


return <>
      <BrowserRouter>
      <ConfigProvider
        componentConfig={{
          Card: {
            bordered: false,
          },
          List: {
            bordered: false,
          },
          Table: {
            border: false,
          },
        }}
      >
            <Switch>
              <Route path="/login" component={Login} />
              <Route path="/deliver/:orderId" component={Deliver} />
              <Route path="/" component={PageLayout} />
            </Switch>
      </ConfigProvider>
    </BrowserRouter>


</>

  // return (
  //   <>
  //     <RouterProvider router={router} />
  //   </>
  // )
}

export default App
