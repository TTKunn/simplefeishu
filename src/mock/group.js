import {
  groups,
  groupMembers,
  projectMembers,
  users,
  getUserByToken,
  uuid,
} from './data.js'

/** @type {Array<import('./index.js').MockRoute>} */
export const groupRoutes = [
  {
    method: 'get',
    url: /^\/api\/group\/project\/.+/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const projectId = config.url.split('/api/group/project/')[1]
      const list = groups.filter((g) => g.projectId === projectId && g.status === 1)
      return { code: 200, message: '操作成功', data: list }
    },
  },
  {
    method: 'get',
    url: /^\/api\/group\/my\/.+/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const projectId = config.url.split('/api/group/my/')[1]
      const gm = groupMembers.find((m) => m.userId === user.userId)
      if (!gm) return { code: 200, message: '操作成功', data: null }

      const group = groups.find(
        (g) => g.groupId === gm.groupId && g.projectId === projectId && g.status === 1,
      )
      return { code: 200, message: '操作成功', data: group || null }
    },
  },
  {
    method: 'get',
    url: /^\/api\/group\/[^/]+\/members$/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const groupId = config.url.match(/\/api\/group\/([^/]+)\/members/)[1]
      const members = groupMembers.filter((m) => m.groupId === groupId)
      return { code: 200, message: '操作成功', data: members }
    },
  },
  {
    method: 'get',
    url: /^\/api\/group\/[^/]+$/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const groupId = config.url.split('/api/group/')[1]
      const group = groups.find((g) => g.groupId === groupId)
      if (!group) return { code: 404, message: '小组不存在', data: null }
      return { code: 200, message: '操作成功', data: group }
    },
  },
  {
    method: 'post',
    url: '/api/group',
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const data = JSON.parse(config.data)

      // 检查是否已在该项目的某个小组中
      const existingMembership = groupMembers.find((m) => m.userId === user.userId)
      if (existingMembership) {
        const existingGroup = groups.find(
          (g) =>
            g.groupId === existingMembership.groupId &&
            g.projectId === data.projectId &&
            g.status === 1,
        )
        if (existingGroup) {
          return { code: 400, message: '你已在该项目的小组中', data: null }
        }
      }

      const projectGroups = groups.filter((g) => g.projectId === data.projectId)
      const groupCode = `GRP${String(projectGroups.length + 1).padStart(3, '0')}`

      const newGroup = {
        groupId: uuid(),
        projectId: data.projectId,
        groupName: data.groupName,
        groupCode,
        description: data.description || '',
        leaderId: user.userId,
        creatorId: user.userId,
        currentMembers: 1,
        maxMembers: 6,
        status: 1,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
      }
      groups.push(newGroup)

      groupMembers.push({
        groupMemberId: uuid(),
        groupId: newGroup.groupId,
        userId: user.userId,
        roleInGroup: 'LEADER',
        username: user.username,
        realName: user.realName,
        studentId: user.studentId,
      })

      return { code: 200, message: '操作成功', data: newGroup }
    },
  },
  {
    method: 'post',
    url: /^\/api\/group\/[^/]+\/join$/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const groupId = config.url.match(/\/api\/group\/([^/]+)\/join/)[1]
      const group = groups.find((g) => g.groupId === groupId && g.status === 1)
      if (!group) return { code: 404, message: '小组不存在', data: null }

      if (group.currentMembers >= group.maxMembers) {
        return { code: 400, message: '小组已满', data: null }
      }

      const exists = groupMembers.find((m) => m.groupId === groupId && m.userId === user.userId)
      if (exists) return { code: 400, message: '已在该小组中', data: null }

      groupMembers.push({
        groupMemberId: uuid(),
        groupId,
        userId: user.userId,
        roleInGroup: 'MEMBER',
        username: user.username,
        realName: user.realName,
        studentId: user.studentId,
      })
      group.currentMembers++

      return { code: 200, message: '操作成功', data: null }
    },
  },
  {
    method: 'delete',
    url: /^\/api\/group\/[^/]+\/quit$/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const groupId = config.url.match(/\/api\/group\/([^/]+)\/quit/)[1]
      const group = groups.find((g) => g.groupId === groupId)
      if (!group) return { code: 404, message: '小组不存在', data: null }

      if (group.leaderId === user.userId) {
        return { code: 400, message: '组长不能直接退出，请先转让组长', data: null }
      }

      const idx = groupMembers.findIndex((m) => m.groupId === groupId && m.userId === user.userId)
      if (idx === -1) return { code: 400, message: '不在该小组中', data: null }

      groupMembers.splice(idx, 1)
      group.currentMembers--

      return { code: 200, message: '操作成功', data: null }
    },
  },
  {
    method: 'delete',
    url: /^\/api\/group\/[^/]+\/dissolve$/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }
      if (user.role !== 'TEACHER') return { code: 403, message: '无权限', data: null }

      const groupId = config.url.match(/\/api\/group\/([^/]+)\/dissolve/)[1]
      const group = groups.find((g) => g.groupId === groupId)
      if (!group) return { code: 404, message: '小组不存在', data: null }

      group.status = 2
      // 移除所有成员
      for (let i = groupMembers.length - 1; i >= 0; i--) {
        if (groupMembers[i].groupId === groupId) {
          groupMembers.splice(i, 1)
        }
      }
      group.currentMembers = 0

      return { code: 200, message: '操作成功', data: null }
    },
  },
  {
    method: 'put',
    url: /^\/api\/group\/[^/]+\/leader$/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const groupId = config.url.match(/\/api\/group\/([^/]+)\/leader/)[1]
      const group = groups.find((g) => g.groupId === groupId)
      if (!group) return { code: 404, message: '小组不存在', data: null }

      const params = new URLSearchParams(config.data)
      const newLeaderId = params.get('newLeaderId')

      const newLeader = groupMembers.find(
        (m) => m.groupId === groupId && m.userId === newLeaderId,
      )
      if (!newLeader) return { code: 400, message: '新组长必须是小组成员', data: null }

      // 旧组长变成普通成员
      const oldLeader = groupMembers.find(
        (m) => m.groupId === groupId && m.userId === group.leaderId,
      )
      if (oldLeader) oldLeader.roleInGroup = 'MEMBER'

      newLeader.roleInGroup = 'LEADER'
      group.leaderId = newLeaderId

      return { code: 200, message: '操作成功', data: null }
    },
  },
]
