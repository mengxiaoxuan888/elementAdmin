import router from './router' //路由配置
import { useAppStoreWithOut } from '@/store/modules/app' //状态管理
import { useCache } from '@/hooks/web/useCache' //常用hooks-使用缓存
import type { RouteRecordRaw } from 'vue-router' //路由
import { useTitle } from '@/hooks/web/useTitle' //常用hooks-使用标题
import { useNProgress } from '@/hooks/web/useNProgress' //常用hooks
import { usePermissionStoreWithOut } from '@/store/modules/permission' //状态管理-用户权限存储超时
import { useDictStoreWithOut } from '@/store/modules/dict' //状态管理
import { usePageLoading } from '@/hooks/web/usePageLoading' //常用hooks-使用页面加载
import { getDictApi } from '@/api/common' //api接口管理

const permissionStore = usePermissionStoreWithOut()

const appStore = useAppStoreWithOut()

const dictStore = useDictStoreWithOut()

const { wsCache } = useCache()

const { start, done } = useNProgress()

const { loadStart, loadDone } = usePageLoading()

const whiteList = ['/login'] // 不重定向白名单

router.beforeEach(async (to, from, next) => {
  start()
  loadStart()
  //获取缓存用户信息
  if (wsCache.get(appStore.getUserInfo)) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      if (!dictStore.getIsSetDict) {
        // 获取所有字典
        const res = await getDictApi()
        if (res) {
          dictStore.setDictObj(res.data)
          dictStore.setIsSetDict(true)
        }
      }
      if (permissionStore.getIsAddRouters) {
        next()
        return
      }

      // 开发者可根据实际情况进行修改
      //角色路由器
      const roleRouters = wsCache.get('roleRouters') || []
      //获取缓存用户信息
      const userInfo = wsCache.get(appStore.getUserInfo)

      // 是否使用动态路由，即权限管理，管理员身份和普通身份
      if (appStore.getDynamicRouter) {
        userInfo.role === 'admin'
          ? await permissionStore.generateRoutes('admin', roleRouters as AppCustomRouteRecordRaw[])
          : await permissionStore.generateRoutes('test', roleRouters as string[])
      } else {
        await permissionStore.generateRoutes('none')
      }

      permissionStore.getAddRouters.forEach((route) => {
        router.addRoute(route as unknown as RouteRecordRaw) // 动态添加可访问路由表
      })
      const redirectPath = from.query.redirect || to.path
      const redirect = decodeURIComponent(redirectPath as string)
      const nextData = to.path === redirect ? { ...to, replace: true } : { path: redirect }
      permissionStore.setIsAddRouters(true)
      next(nextData)
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`) // 否则全部重定向到登录页
    }
  }
})

router.afterEach((to) => {
  useTitle(to?.meta?.title as string)
  done() // 结束Progress
  loadDone()
})
