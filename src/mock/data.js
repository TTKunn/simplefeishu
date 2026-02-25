/** 内存数据库 - 预置测试数据 */

/** @type {Array<Object>} */
export const users = [
  {
    id: 1,
    userId: 'teacher-uuid-001',
    username: 'teacher',
    password: '123456',
    realName: '王老师',
    email: 'teacher@school.edu',
    phone: '13800000001',
    avatar: '',
    role: 'TEACHER',
    studentId: null,
    teacherId: 'T001',
    status: 1,
    createTime: '2024-01-01T10:00:00',
    updateTime: '2024-01-01T10:00:00',
  },
  {
    id: 2,
    userId: 'student-uuid-001',
    username: 'student1',
    password: '123456',
    realName: '张三',
    email: 'zhangsan@school.edu',
    phone: '13800000002',
    avatar: '',
    role: 'STUDENT',
    studentId: '2021001',
    teacherId: null,
    status: 1,
    createTime: '2024-01-02T10:00:00',
    updateTime: '2024-01-02T10:00:00',
  },
  {
    id: 3,
    userId: 'student-uuid-002',
    username: 'student2',
    password: '123456',
    realName: '李四',
    email: 'lisi@school.edu',
    phone: '13800000003',
    avatar: '',
    role: 'STUDENT',
    studentId: '2021002',
    teacherId: null,
    status: 1,
    createTime: '2024-01-03T10:00:00',
    updateTime: '2024-01-03T10:00:00',
  },
]

/** @type {Array<Object>} */
export const projects = [
  {
    projectId: 'project-uuid-001',
    projectName: '软件工程课程项目',
    projectCode: 'PRJ20240301ABC',
    description: '2024春季学期软件工程实践项目，要求完成一个完整的Web应用开发。',
    creatorId: 'teacher-uuid-001',
    startTime: '2024-03-01T00:00:00',
    endTime: '2024-06-30T23:59:59',
    status: 2,
    maxGroupSize: 6,
    minGroupSize: 3,
    groupDeadline: '2024-03-15T23:59:59',
    allowStudentCreateGroup: 1,
    createTime: '2024-02-20T10:00:00',
    updateTime: '2024-03-01T10:00:00',
  },
]

/** @type {Array<Object>} */
export const projectMembers = [
  {
    projectMemberId: 'pm-uuid-001',
    projectId: 'project-uuid-001',
    userId: 'teacher-uuid-001',
    roleInProject: 'OWNER',
    joinTime: '2024-02-20T10:00:00',
    status: 1,
  },
  {
    projectMemberId: 'pm-uuid-002',
    projectId: 'project-uuid-001',
    userId: 'student-uuid-001',
    roleInProject: 'MEMBER',
    joinTime: '2024-03-01T10:00:00',
    status: 1,
  },
  {
    projectMemberId: 'pm-uuid-003',
    projectId: 'project-uuid-001',
    userId: 'student-uuid-002',
    roleInProject: 'MEMBER',
    joinTime: '2024-03-02T10:00:00',
    status: 1,
  },
]

/** @type {Array<Object>} */
export const groups = [
  {
    groupId: 'group-uuid-001',
    projectId: 'project-uuid-001',
    groupName: '前端攻城狮',
    groupCode: 'GRP001',
    description: '专注前端开发的小组',
    leaderId: 'student-uuid-001',
    creatorId: 'student-uuid-001',
    currentMembers: 2,
    maxMembers: 6,
    status: 1,
    createTime: '2024-03-05T10:00:00',
    updateTime: '2024-03-05T10:00:00',
  },
]

/** @type {Array<Object>} */
export const groupMembers = [
  {
    groupMemberId: 'gm-uuid-001',
    groupId: 'group-uuid-001',
    userId: 'student-uuid-001',
    roleInGroup: 'LEADER',
    username: 'student1',
    realName: '张三',
    studentId: '2021001',
  },
  {
    groupMemberId: 'gm-uuid-002',
    groupId: 'group-uuid-001',
    userId: 'student-uuid-002',
    roleInGroup: 'MEMBER',
    username: 'student2',
    realName: '李四',
    studentId: '2021002',
  },
]

/** 简易 token 映射 */
export const tokenMap = new Map()

/** @type {Array<Object>} */
export const tasks = [
  {
    taskId: 'task-uuid-001',
    projectId: 'project-uuid-001',
    groupId: 'group-uuid-001',
    taskTitle: '需求分析文档',
    taskDescription: '完成系统需求分析文档编写',
    taskCode: 'TASK001',
    priority: 1,
    status: 0,
    progress: 0,
    parentTaskId: null,
    creatorId: 'student-uuid-001',
    startTime: '2024-03-10T00:00:00',
    endTime: '2024-03-20T23:59:59',
    estimatedHours: 20,
    actualHours: 0,
    tags: '["文档","需求"]',
    createTime: '2024-03-06T10:00:00',
    updateTime: '2024-03-06T10:00:00',
  },
]

/** @type {Array<Object>} */
export const taskAssignments = [
  {
    assignmentId: 'ta-uuid-001',
    taskId: 'task-uuid-001',
    userId: 'student-uuid-001',
    username: 'student1',
    realName: '张三',
    assignedBy: 'student-uuid-001',
    status: 0,
    progress: 0,
    actualHours: 0,
    assignTime: '2024-03-06T10:00:00',
    startTime: null,
    finishTime: null,
  },
]

/** @type {Array<Object>} */
export const taskDependencies = []

/** @type {Array<Object>} */
export const folders = []

/** @type {Array<Object>} */
export const documents = []

/** 生成简易 token */
export function generateToken(userId) {
  const token = `mock-token-${userId}-${Date.now()}`
  tokenMap.set(token, userId)
  return token
}

/** 根据 token 获取用户 */
export function getUserByToken(token) {
  const userId = tokenMap.get(token)
  return users.find((u) => u.userId === userId) || null
}

/** 生成 UUID */
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
