import request from './request.js'

export function getUserInfoApi() {
  return request.get('/api/user/info')
}

/** @param {Record<string, string>} data */
export function updateUserInfoApi(data) {
  return request.put('/api/user/info', data)
}
