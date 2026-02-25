import request from './request.js'

export function getMyProjectsApi() {
  return request.get('/api/project/my')
}

/** @param {string} projectId */
export function getProjectDetailApi(projectId) {
  return request.get(`/api/project/${projectId}`)
}

/** @param {string} code */
export function getProjectByCodeApi(code) {
  return request.get(`/api/project/code/${code}`)
}

/** @param {Object} data */
export function createProjectApi(data) {
  return request.post('/api/project', data)
}

/** @param {string} projectId @param {Object} data */
export function updateProjectApi(projectId, data) {
  return request.put(`/api/project/${projectId}`, data)
}

/** @param {string} projectId */
export function deleteProjectApi(projectId) {
  return request.delete(`/api/project/${projectId}`)
}

/** @param {string} projectCode */
export function joinProjectApi(projectCode) {
  return request.post('/api/project/join', { projectCode })
}

/** @param {string} projectId */
export function quitProjectApi(projectId) {
  return request.delete(`/api/project/${projectId}/quit`)
}

/** @param {string} projectId */
export function getProjectMembersApi(projectId) {
  return request.get(`/api/project/${projectId}/members`)
}
