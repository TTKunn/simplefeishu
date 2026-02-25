import { users, getUserByToken } from './data.js'

/** @type {Array<import('./index.js').MockRoute>} */
export const userRoutes = [
  {
    method: 'get',
    url: '/api/user/info',
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) {
        return { code: 401, message: '未授权', data: null }
      }
      return {
        code: 200,
        message: '操作成功',
        data: { ...user, password: null },
      }
    },
  },
  {
    method: 'put',
    url: '/api/user/info',
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) {
        return { code: 401, message: '未授权', data: null }
      }
      const data = JSON.parse(config.data)
      if (data.realName) user.realName = data.realName
      if (data.email) user.email = data.email
      if (data.phone) user.phone = data.phone
      if (data.avatar) user.avatar = data.avatar
      user.updateTime = new Date().toISOString()
      return { code: 200, message: '操作成功', data: null }
    },
  },
]
