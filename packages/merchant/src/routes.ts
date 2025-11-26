import auth, { AuthParams } from '@/utils/authentication'
import { useEffect, useMemo, useState } from 'react'

export type IRoute = AuthParams & {
  name: string
  key: string
  // 当前页是否展示面包屑
  breadcrumb?: boolean
  children?: IRoute[]
  // 当前路由是否渲染菜单项，为 true 的话不会在菜单中显示，但可通过路由地址访问。
  ignore?: boolean
  component?: any
  path?: string
}

export const routes: IRoute[] = [
  {
    name: '商品',
    key: 'product',
    children: [
      {
        name: '商品列表',
        key: 'product/list'
      },
      {
        name: '添加商品',
        key: 'product/add'
      }
    ]
  },
  {
    name: '订单',
    key: 'order',
    children: [
      {
        name: '待发货',
        key: 'order/waitDelivery'
      },
      {
        name: '已发货',
        key: 'order/delivered'
      }
    ]
  },
  {
    name: '地址',
    key: 'address',
    children: [
      {
        name: '地址管理',
        key: 'address/manage'
      },
      {
        name: '配送范围',
        key: 'address/deliverRange'
      },
    ]
  }
]

export const getName: any = (path: string, routes: IRoute[]) => {
  return routes.find((item) => {
    const itemPath = `/${item.key}`
    if (path === itemPath) {
      return item.name
    } else if (item.children) {
      return getName(path, item.children)
    }
  })
}

export const generatePermission = (role: string) => {
  const actions = role === 'admin' ? ['*'] : ['read']
  const result: any = {}
  routes.forEach((item) => {
    if (item.children) {
      item.children.forEach((child) => {
        result[child.name] = actions
      })
    }
  })
  return result
}

const useRoute = (userPermission: any): [IRoute[], string] => {
  const filterRoute = (routes: IRoute[], arr: IRoute[] = []): IRoute[] => {
    if (!routes.length) {
      return []
    }
    for (const route of routes) {
      const { requiredPermissions, oneOfPerm } = route
      let visible = true
      if (requiredPermissions) {
        visible = auth({ requiredPermissions, oneOfPerm }, userPermission)
      }

      if (!visible) {
        continue
      }
      if (route.children && route.children.length) {
        const newRoute = { ...route, children: [] }
        filterRoute(route.children, newRoute.children)
        if (newRoute.children.length) {
          arr.push(newRoute)
        }
      } else {
        arr.push({ ...route })
      }
    }

    return arr
  }

  const [permissionRoute, setPermissionRoute] = useState(routes)

  useEffect(() => {
    const newRoutes = filterRoute(routes)
    setPermissionRoute(newRoutes)
  }, [JSON.stringify(userPermission)])

  const defaultRoute = useMemo(() => {
    const first = permissionRoute[0]
    if (first) {
      const firstRoute = first?.children?.[0]?.key || first.key
      return firstRoute
    }
    return ''
  }, [permissionRoute])

  return [permissionRoute, defaultRoute]
}

export default useRoute
