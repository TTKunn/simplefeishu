import { authRoutes } from './auth.js'
import { userRoutes } from './user.js'
import { projectRoutes } from './project.js'
import { groupRoutes } from './group.js'
import { taskRoutes } from './task.js'
import { documentRoutes } from './document.js'

/**
 * @typedef {{ method: string, url: string | RegExp, handler: (config: any) => any }} MockRoute
 */

/** @type {MockRoute[]} */
const routes = [...authRoutes, ...userRoutes, ...projectRoutes, ...groupRoutes, ...taskRoutes, ...documentRoutes]

/**
 * 注册 mock 到 axios 实例
 * @param {import('axios').AxiosInstance} instance
 */
export function setupMock(instance) {
  const originalAdapter = instance.defaults.adapter

  instance.defaults.adapter = (config) => {
    // 提取 token
    const authHeader = config.headers?.Authorization || config.headers?.authorization || ''
    const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : ''

    const fullUrl = config.url || ''
    const method = (config.method || 'get').toLowerCase()

    for (const route of routes) {
      const matched =
        route.url instanceof RegExp
          ? route.url.test(fullUrl)
          : fullUrl === route.url || fullUrl.startsWith(route.url + '?')

      if (matched && route.method === method) {
        const result = route.handler({ ...config, token })
        return Promise.resolve({
          data: result,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        })
      }
    }

    // 未匹配到 mock，使用原始 adapter
    if (originalAdapter) {
      return originalAdapter(config)
    }
    return Promise.reject(new Error(`未匹配到 mock: ${method.toUpperCase()} ${fullUrl}`))
  }
}

/** 动态添加 mock 路由 */
export function addMockRoutes(/** @type {MockRoute[]} */ newRoutes) {
  routes.push(...newRoutes)
}
