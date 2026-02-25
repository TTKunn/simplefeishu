import request from './request.js'

/**
 * @param {string} username
 * @param {string} password
 */
export function loginApi(username, password) {
  return request.post('/api/auth/login', new URLSearchParams({ username, password }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

/**
 * @param {{ username: string, password: string, realName: string, studentId: string }} data
 */
export function registerApi(data) {
  return request.post('/api/auth/register', data)
}
