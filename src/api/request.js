import axios from 'axios'
import { ElMessage } from 'element-plus'
import { setupMock } from '@/mock/index.js'

const instance = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
})

// 开发环境启用 mock
setupMock(instance)

// 请求拦截器：注入 token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：统一错误处理
instance.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      if (res.code === 401 || res.code === 1004 || res.code === 1005) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      return Promise.reject(new Error(res.message))
    }
    return res
  },
  (error) => {
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  },
)

export default instance
