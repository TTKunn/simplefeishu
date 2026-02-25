import request from './request.js'

/** @param {string} projectId */
export function getProjectGroupsApi(projectId) {
  return request.get(`/api/group/project/${projectId}`)
}

/** @param {string} groupId */
export function getGroupDetailApi(groupId) {
  return request.get(`/api/group/${groupId}`)
}

/** @param {string} projectId */
export function getMyGroupApi(projectId) {
  return request.get(`/api/group/my/${projectId}`)
}

/** @param {Object} data */
export function createGroupApi(data) {
  return request.post('/api/group', data)
}

/** @param {string} groupId */
export function joinGroupApi(groupId) {
  return request.post(`/api/group/${groupId}/join`)
}

/** @param {string} groupId */
export function quitGroupApi(groupId) {
  return request.delete(`/api/group/${groupId}/quit`)
}

/** @param {string} groupId */
export function getGroupMembersApi(groupId) {
  return request.get(`/api/group/${groupId}/members`)
}

/** @param {string} groupId */
export function dissolveGroupApi(groupId) {
  return request.delete(`/api/group/${groupId}/dissolve`)
}

/** @param {string} groupId @param {string} newLeaderId */
export function transferLeaderApi(groupId, newLeaderId) {
  return request.put(`/api/group/${groupId}/leader`, new URLSearchParams({ newLeaderId }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}
