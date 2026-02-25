import request from './request.js'

/** @param {Object} data */
export function createTaskApi(data) {
  return request.post('/api/task', data)
}

/** @param {string} taskId @param {Object} data */
export function updateTaskApi(taskId, data) {
  return request.put(`/api/task/${taskId}`, data)
}

/** @param {string} taskId */
export function getTaskDetailApi(taskId) {
  return request.get(`/api/task/${taskId}`)
}

/** @param {string} taskId */
export function deleteTaskApi(taskId) {
  return request.delete(`/api/task/${taskId}`)
}

/** @param {string} projectId */
export function getProjectTasksApi(projectId) {
  return request.get(`/api/task/project/${projectId}`)
}

/** @param {string} groupId */
export function getGroupTasksApi(groupId) {
  return request.get(`/api/task/group/${groupId}`)
}

export function getMyTasksApi() {
  return request.get('/api/task/my')
}

/** @param {string} taskId @param {string} userIds */
export function assignTaskApi(taskId, userIds) {
  return request.post(`/api/task/${taskId}/assign`, new URLSearchParams({ userIds }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

/** @param {string} taskId @param {Object} data */
export function updateTaskAssignmentApi(taskId, data) {
  return request.put(`/api/task/${taskId}/assignment`, data)
}

/** @param {string} taskId @param {string} dependOnTaskId */
export function addTaskDependencyApi(taskId, dependOnTaskId) {
  return request.post(`/api/task/${taskId}/dependency`, new URLSearchParams({ dependOnTaskId }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

/** @param {string} taskId */
export function deleteTaskDependencyApi(taskId) {
  return request.delete(`/api/task/${taskId}/dependency`)
}
