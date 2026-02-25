import request from './request.js'

/** @param {Object} data */
export function createFolderApi(data) {
  return request.post('/api/document/folder', data)
}

/** @param {string} folderId */
export function deleteFolderApi(folderId) {
  return request.delete(`/api/document/folder/${folderId}`)
}

/** @param {string} folderId @param {Object} data */
export function updateFolderApi(folderId, data) {
  return request.put(`/api/document/folder/${folderId}`, new URLSearchParams(data), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

/** @param {string} groupId */
export function getGroupFoldersApi(groupId) {
  return request.get(`/api/document/folder/group/${groupId}`)
}

/**
 * @param {Object} data
 * @param {string} data.groupId
 * @param {string} data.folderId
 * @param {string} data.description
 * @param {File} data.file
 */
export function uploadDocumentApi(data) {
  const formData = new FormData()
  formData.append('groupId', data.groupId)
  formData.append('folderId', data.folderId)
  formData.append('description', data.description || '')
  formData.append('file', data.file)
  return request.post('/api/document/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
