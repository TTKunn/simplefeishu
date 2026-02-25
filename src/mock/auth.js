import { users, generateToken } from './data.js'

/** @type {Array<import('./index.js').MockRoute>} */
export const authRoutes = [
  {
    method: 'post',
    url: '/api/auth/login',
    handler(config) {
      const params = new URLSearchParams(config.data)
      const username = params.get('username')
      const password = params.get('password')
      const user = users.find((u) => u.username === username && u.password === password)
      if (!user) {
        return { code: 1003, message: '用户名或密码错误', data: null }
      }
      const token = generateToken(user.userId)
      return {
        code: 200,
        message: '操作成功',
        data: {
          token,
          userId: user.userId,
          username: user.username,
          realName: user.realName,
          role: user.role,
        },
      }
    },
  },
  {
    method: 'post',
    url: '/api/auth/register',
    handler(config) {
      const data = JSON.parse(config.data)
      const exists = users.find((u) => u.username === data.username)
      if (exists) {
        return { code: 1002, message: '用户已存在', data: null }
      }
      const newUser = {
        id: users.length + 1,
        userId: `student-uuid-${String(users.length + 1).padStart(3, '0')}`,
        username: data.username,
        password: data.password,
        realName: data.realName,
        email: '',
        phone: '',
        avatar: '',
        role: 'STUDENT',
        studentId: data.studentId,
        teacherId: null,
        status: 1,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
      }
      users.push(newUser)
      return { code: 200, message: '操作成功', data: null }
    },
  },
]
