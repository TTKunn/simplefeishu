import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { loginApi, registerApi } from '@/api/auth.js'
import { getUserInfoApi, updateUserInfoApi } from '@/api/user.js'
import { Role } from '@/utils/constants.js'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(/** @type {import('@/utils/constants.js').UserInfo | null} */ (null))

  const isLoggedIn = computed(() => !!token.value)
  const isTeacher = computed(() => userInfo.value?.role === Role.TEACHER)
  const isStudent = computed(() => userInfo.value?.role === Role.STUDENT)

  /**
   * @param {string} username
   * @param {string} password
   */
  async function login(username, password) {
    const res = await loginApi(username, password)
    token.value = res.data.token
    localStorage.setItem('token', res.data.token)
    userInfo.value = res.data
  }

  /**
   * @param {{ username: string, password: string, realName: string, studentId: string }} data
   */
  async function register(data) {
    await registerApi(data)
  }

  async function fetchUserInfo() {
    const res = await getUserInfoApi()
    userInfo.value = res.data
  }

  /** @param {Record<string, string>} data */
  async function updateUserInfo(data) {
    await updateUserInfoApi(data)
    await fetchUserInfo()
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  return { token, userInfo, isLoggedIn, isTeacher, isStudent, login, register, fetchUserInfo, updateUserInfo, logout }
})
