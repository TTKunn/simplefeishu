import {
  tasks,
  taskAssignments,
  taskDependencies,
  users,
  groupMembers,
  getUserByToken,
  uuid,
} from './data.js'

/** 解析 tags（可能是 JSON 字符串或数组） */
function parseTags(tags) {
  if (Array.isArray(tags)) return tags
  try {
    return JSON.parse(tags)
  } catch {
    return []
  }
}

/** @type {Array<import('./index.js').MockRoute>} */
export const taskRoutes = [
  {
    method: 'post',
    url: '/api/task',
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const data = JSON.parse(config.data)
      const projectTasks = tasks.filter((t) => t.projectId === data.projectId)
      const taskCode = `TASK${String(projectTasks.length + 1).padStart(3, '0')}`
      const now = new Date().toISOString()

      const newTask = {
        taskId: uuid(),
        projectId: data.projectId,
        groupId: data.groupId,
        taskTitle: data.taskTitle,
        taskDescription: data.taskDescription || '',
        taskCode,
        priority: data.priority ?? 1,
        status: 0,
        progress: 0,
        parentTaskId: data.parentTaskId || null,
        creatorId: user.userId,
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        estimatedHours: data.estimatedHours || 0,
        actualHours: 0,
        tags: JSON.stringify(data.tags || []),
        createTime: now,
        updateTime: now,
      }
      tasks.push(newTask)

      // 自动分配
      if (data.assignToUserIds?.length) {
        for (const uid of data.assignToUserIds) {
          const u = users.find((u) => u.userId === uid)
          taskAssignments.push({
            assignmentId: uuid(),
            taskId: newTask.taskId,
            userId: uid,
            username: u?.username || '',
            realName: u?.realName || '',
            assignedBy: user.userId,
            status: 0,
            progress: 0,
            actualHours: 0,
            assignTime: now,
            startTime: null,
            finishTime: null,
          })
        }
      }

      return { code: 200, message: '操作成功', data: newTask }
    },
  },
  {
    method: 'put',
    url: /^\/api\/task\/[^/]+\/assignment$/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const taskId = config.url.match(/\/api\/task\/([^/]+)\/assignment/)[1]
      const data = JSON.parse(config.data)

      const assignment = taskAssignments.find(
        (a) => a.taskId === taskId && a.userId === user.userId,
      )
      if (!assignment) return { code: 404, message: '未找到任务分配', data: null }

      if (data.status !== undefined) assignment.status = data.status
      if (data.progress !== undefined) assignment.progress = data.progress
      if (data.actualHours !== undefined) assignment.actualHours = data.actualHours
      if (data.status === 1 && !assignment.startTime) {
        assignment.startTime = new Date().toISOString()
      }
      if (data.status === 2) {
        assignment.finishTime = new Date().toISOString()
      }

      return { code: 200, message: '操作成功', data: null }
    },
  },
  {
    method: 'post',
    url: /^\/api\/task\/[^/]+\/dependency$/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const taskId = config.url.match(/\/api\/task\/([^/]+)\/dependency/)[1]
      const params = new URLSearchParams(config.data)
      const dependOnTaskId = params.get('dependOnTaskId')

      if (taskId === dependOnTaskId) {
        return { code: 500, message: '任务不能依赖自己', data: null }
      }

      taskDependencies.push({ taskId, dependOnTaskId })
      return { code: 200, message: '操作成功', data: null }
    },
  },
  {
    method: 'delete',
    url: /^\/api\/task\/[^/]+\/dependency$/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const taskId = config.url.match(/\/api\/task\/([^/]+)\/dependency/)[1]
      for (let i = taskDependencies.length - 1; i >= 0; i--) {
        if (taskDependencies[i].taskId === taskId) {
          taskDependencies.splice(i, 1)
        }
      }
      return { code: 200, message: '操作成功', data: null }
    },
  },
  {
    method: 'post',
    url: /^\/api\/task\/[^/]+\/assign$/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const taskId = config.url.match(/\/api\/task\/([^/]+)\/assign/)[1]
      const params = new URLSearchParams(config.data)
      const userIds = params.get('userIds')?.split(',') || []
      const now = new Date().toISOString()

      for (const uid of userIds) {
        const exists = taskAssignments.find((a) => a.taskId === taskId && a.userId === uid)
        if (exists) continue
        const u = users.find((u) => u.userId === uid)
        taskAssignments.push({
          assignmentId: uuid(),
          taskId,
          userId: uid,
          username: u?.username || '',
          realName: u?.realName || '',
          assignedBy: user.userId,
          status: 0,
          progress: 0,
          actualHours: 0,
          assignTime: now,
          startTime: null,
          finishTime: null,
        })
      }

      return { code: 200, message: '操作成功', data: null }
    },
  },
  {
    method: 'get',
    url: /^\/api\/task\/project\/.+/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const projectId = config.url.split('/api/task/project/')[1]
      const list = tasks.filter((t) => t.projectId === projectId).map((t) => ({
        ...t,
        assignees: taskAssignments
          .filter((a) => a.taskId === t.taskId)
          .map((a) => a.realName),
      }))
      return { code: 200, message: '操作成功', data: list }
    },
  },
  {
    method: 'get',
    url: /^\/api\/task\/group\/.+/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const groupId = config.url.split('/api/task/group/')[1]
      const list = tasks.filter((t) => t.groupId === groupId).map((t) => ({
        ...t,
        assignees: taskAssignments
          .filter((a) => a.taskId === t.taskId)
          .map((a) => a.realName),
      }))
      return { code: 200, message: '操作成功', data: list }
    },
  },
  {
    method: 'get',
    url: '/api/task/my',
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const myAssignments = taskAssignments.filter((a) => a.userId === user.userId)
      const myTaskIds = myAssignments.map((a) => a.taskId)
      const list = tasks.filter((t) => myTaskIds.includes(t.taskId)).map((t) => ({
        ...t,
        assignees: taskAssignments
          .filter((a) => a.taskId === t.taskId)
          .map((a) => a.realName),
      }))
      return { code: 200, message: '操作成功', data: list }
    },
  },
  {
    method: 'get',
    url: /^\/api\/task\/[^/]+$/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const taskId = config.url.split('/api/task/')[1]
      const task = tasks.find((t) => t.taskId === taskId)
      if (!task) return { code: 404, message: '任务不存在', data: null }

      const assignments = taskAssignments.filter((a) => a.taskId === taskId)
      const subTasks = tasks.filter((t) => t.parentTaskId === taskId)
      const deps = taskDependencies.filter((d) => d.taskId === taskId).map((d) => d.dependOnTaskId)

      return {
        code: 200,
        message: '操作成功',
        data: {
          ...task,
          tags: parseTags(task.tags),
          assignments,
          subTasks,
          dependOnTaskIds: deps,
        },
      }
    },
  },
  {
    method: 'put',
    url: /^\/api\/task\/[^/]+$/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const taskId = config.url.split('/api/task/')[1]
      const task = tasks.find((t) => t.taskId === taskId)
      if (!task) return { code: 404, message: '任务不存在', data: null }

      const data = JSON.parse(config.data)
      if (data.taskTitle !== undefined) task.taskTitle = data.taskTitle
      if (data.taskDescription !== undefined) task.taskDescription = data.taskDescription
      if (data.priority !== undefined) task.priority = data.priority
      if (data.status !== undefined) task.status = data.status
      if (data.startTime !== undefined) task.startTime = data.startTime
      if (data.endTime !== undefined) task.endTime = data.endTime
      if (data.estimatedHours !== undefined) task.estimatedHours = data.estimatedHours
      if (data.tags !== undefined) task.tags = JSON.stringify(data.tags)
      task.updateTime = new Date().toISOString()

      return { code: 200, message: '操作成功', data: null }
    },
  },
  {
    method: 'delete',
    url: /^\/api\/task\/[^/]+$/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const taskId = config.url.split('/api/task/')[1]
      const idx = tasks.findIndex((t) => t.taskId === taskId)
      if (idx === -1) return { code: 404, message: '任务不存在', data: null }

      tasks.splice(idx, 1)
      // 清理关联数据
      for (let i = taskAssignments.length - 1; i >= 0; i--) {
        if (taskAssignments[i].taskId === taskId) taskAssignments.splice(i, 1)
      }
      for (let i = taskDependencies.length - 1; i >= 0; i--) {
        if (taskDependencies[i].taskId === taskId || taskDependencies[i].dependOnTaskId === taskId) {
          taskDependencies.splice(i, 1)
        }
      }

      return { code: 200, message: '操作成功', data: null }
    },
  },
]
