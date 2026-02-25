/** @enum {string} 用户角色 */
export const Role = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
}

/** @enum {number} 项目状态 */
export const ProjectStatus = {
  PREPARING: 1,
  IN_PROGRESS: 2,
  FINISHED: 3,
  CANCELLED: 4,
}

/** @type {Record<number, string>} */
export const ProjectStatusLabel = {
  [ProjectStatus.PREPARING]: '准备中',
  [ProjectStatus.IN_PROGRESS]: '进行中',
  [ProjectStatus.FINISHED]: '已结束',
  [ProjectStatus.CANCELLED]: '已取消',
}

/** @type {Record<number, string>} */
export const ProjectStatusType = {
  [ProjectStatus.PREPARING]: 'info',
  [ProjectStatus.IN_PROGRESS]: 'success',
  [ProjectStatus.FINISHED]: 'warning',
  [ProjectStatus.CANCELLED]: 'danger',
}

/** @enum {number} 小组状态 */
export const GroupStatus = {
  NORMAL: 1,
  DISSOLVED: 2,
}

/** @enum {string} 项目内角色 */
export const ProjectRole = {
  OWNER: 'OWNER',
  MEMBER: 'MEMBER',
}

/** @enum {string} 小组内角色 */
export const GroupRole = {
  LEADER: 'LEADER',
  MEMBER: 'MEMBER',
}

/** @enum {number} 任务状态 */
export const TaskStatus = {
  TODO: 0,
  IN_PROGRESS: 1,
  DONE: 2,
}

/** @type {Record<number, string>} */
export const TaskStatusLabel = {
  [TaskStatus.TODO]: '待处理',
  [TaskStatus.IN_PROGRESS]: '进行中',
  [TaskStatus.DONE]: '已完成',
}

/** @type {Record<number, string>} */
export const TaskStatusType = {
  [TaskStatus.TODO]: 'info',
  [TaskStatus.IN_PROGRESS]: '',
  [TaskStatus.DONE]: 'success',
}

/** @enum {number} 任务优先级 */
export const TaskPriority = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  URGENT: 3,
}

/** @type {Record<number, string>} */
export const TaskPriorityLabel = {
  [TaskPriority.LOW]: '低',
  [TaskPriority.MEDIUM]: '中',
  [TaskPriority.HIGH]: '高',
  [TaskPriority.URGENT]: '紧急',
}

/** @type {Record<number, string>} */
export const TaskPriorityType = {
  [TaskPriority.LOW]: 'info',
  [TaskPriority.MEDIUM]: '',
  [TaskPriority.HIGH]: 'warning',
  [TaskPriority.URGENT]: 'danger',
}
