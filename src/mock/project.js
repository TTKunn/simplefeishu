import { projects, projectMembers, users, getUserByToken, uuid } from './data.js'

/** @type {Array<import('./index.js').MockRoute>} */
export const projectRoutes = [
  {
    method: 'get',
    url: '/api/project/my',
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const memberOf = projectMembers
        .filter((pm) => pm.userId === user.userId && pm.status === 1)
        .map((pm) => pm.projectId)

      const list = projects
        .filter((p) => memberOf.includes(p.projectId))
        .map((p) => ({
          projectId: p.projectId,
          projectName: p.projectName,
          projectCode: p.projectCode,
          description: p.description,
          status: p.status,
        }))

      return { code: 200, message: '操作成功', data: list }
    },
  },
  {
    method: 'get',
    url: /^\/api\/project\/code\/.+/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const code = config.url.split('/api/project/code/')[1]
      const project = projects.find((p) => p.projectCode === code)
      if (!project) return { code: 404, message: '项目不存在', data: null }
      return { code: 200, message: '操作成功', data: project }
    },
  },
  {
    method: 'get',
    url: /^\/api\/project\/[^/]+\/members$/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const projectId = config.url.match(/\/api\/project\/([^/]+)\/members/)[1]
      const members = projectMembers
        .filter((pm) => pm.projectId === projectId && pm.status === 1)
        .map((pm) => {
          const u = users.find((u) => u.userId === pm.userId)
          return {
            ...pm,
            username: u?.username,
            realName: u?.realName,
            studentId: u?.studentId,
          }
        })
      return { code: 200, message: '操作成功', data: members }
    },
  },
  {
    method: 'get',
    url: /^\/api\/project\/[^/]+$/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const projectId = config.url.split('/api/project/')[1]
      const project = projects.find((p) => p.projectId === projectId)
      if (!project) return { code: 404, message: '项目不存在', data: null }
      return { code: 200, message: '操作成功', data: project }
    },
  },
  {
    method: 'post',
    url: '/api/project',
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }
      if (user.role !== 'TEACHER') return { code: 403, message: '无权限', data: null }

      const data = JSON.parse(config.data)
      const now = new Date()
      const code = `PRJ${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${Math.random().toString(36).substring(2, 5).toUpperCase()}`

      const newProject = {
        projectId: uuid(),
        projectName: data.projectName,
        projectCode: code,
        description: data.description || '',
        creatorId: user.userId,
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        status: 1,
        maxGroupSize: data.maxGroupSize || 6,
        minGroupSize: data.minGroupSize || 3,
        groupDeadline: data.groupDeadline || null,
        allowStudentCreateGroup: data.allowStudentCreateGroup ?? 1,
        createTime: now.toISOString(),
        updateTime: now.toISOString(),
      }
      projects.push(newProject)

      projectMembers.push({
        projectMemberId: uuid(),
        projectId: newProject.projectId,
        userId: user.userId,
        roleInProject: 'OWNER',
        joinTime: now.toISOString(),
        status: 1,
      })

      return { code: 200, message: '操作成功', data: newProject }
    },
  },
  {
    method: 'put',
    url: /^\/api\/project\/[^/]+$/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const projectId = config.url.split('/api/project/')[1]
      const project = projects.find((p) => p.projectId === projectId)
      if (!project) return { code: 404, message: '项目不存在', data: null }

      const data = JSON.parse(config.data)
      Object.assign(project, data, { updateTime: new Date().toISOString() })
      return { code: 200, message: '操作成功', data: null }
    },
  },
  {
    method: 'delete',
    url: /^\/api\/project\/[^/]+\/quit$/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const projectId = config.url.match(/\/api\/project\/([^/]+)\/quit/)[1]
      const pm = projectMembers.find(
        (m) => m.projectId === projectId && m.userId === user.userId && m.status === 1,
      )
      if (!pm) return { code: 404, message: '未加入该项目', data: null }
      if (pm.roleInProject === 'OWNER') return { code: 403, message: '项目创建者不能退出', data: null }

      pm.status = 0
      return { code: 200, message: '操作成功', data: null }
    },
  },
  {
    method: 'delete',
    url: /^\/api\/project\/[^/]+$/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const projectId = config.url.split('/api/project/')[1]
      const idx = projects.findIndex((p) => p.projectId === projectId)
      if (idx === -1) return { code: 404, message: '项目不存在', data: null }

      projects.splice(idx, 1)
      return { code: 200, message: '操作成功', data: null }
    },
  },
  {
    method: 'post',
    url: '/api/project/join',
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const data = JSON.parse(config.data)
      const project = projects.find((p) => p.projectCode === data.projectCode)
      if (!project) return { code: 404, message: '项目不存在', data: null }
      if (project.status === 3 || project.status === 4) {
        return { code: 400, message: '项目已结束或已取消', data: null }
      }

      const exists = projectMembers.find(
        (pm) => pm.projectId === project.projectId && pm.userId === user.userId && pm.status === 1,
      )
      if (exists) return { code: 400, message: '已加入该项目', data: null }

      projectMembers.push({
        projectMemberId: uuid(),
        projectId: project.projectId,
        userId: user.userId,
        roleInProject: 'MEMBER',
        joinTime: new Date().toISOString(),
        status: 1,
      })

      return { code: 200, message: '操作成功', data: null }
    },
  },
]
