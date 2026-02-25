import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  createTaskApi,
  updateTaskApi,
  getTaskDetailApi,
  deleteTaskApi,
  getProjectTasksApi,
  getGroupTasksApi,
  getMyTasksApi,
  assignTaskApi,
  updateTaskAssignmentApi,
  addTaskDependencyApi,
  deleteTaskDependencyApi,
} from '@/api/task.js'

export const useTaskStore = defineStore('task', () => {
  const projectTasks = ref(/** @type {Array<Object>} */ ([]))
  const groupTasks = ref(/** @type {Array<Object>} */ ([]))
  const myTasks = ref(/** @type {Array<Object>} */ ([]))
  const currentTask = ref(/** @type {Object | null} */ (null))

  /** @param {string} projectId */
  async function fetchProjectTasks(projectId) {
    const res = await getProjectTasksApi(projectId)
    projectTasks.value = res.data || []
  }

  /** @param {string} groupId */
  async function fetchGroupTasks(groupId) {
    const res = await getGroupTasksApi(groupId)
    groupTasks.value = res.data || []
  }

  async function fetchMyTasks() {
    const res = await getMyTasksApi()
    myTasks.value = res.data || []
  }

  /** @param {string} taskId */
  async function fetchTaskDetail(taskId) {
    const res = await getTaskDetailApi(taskId)
    currentTask.value = res.data
  }

  /** @param {Object} data */
  async function createTask(data) {
    const res = await createTaskApi(data)
    return res.data
  }

  /** @param {string} taskId @param {Object} data */
  async function updateTask(taskId, data) {
    await updateTaskApi(taskId, data)
  }

  /** @param {string} taskId */
  async function deleteTask(taskId) {
    await deleteTaskApi(taskId)
  }

  /** @param {string} taskId @param {string} userIds */
  async function assignTask(taskId, userIds) {
    await assignTaskApi(taskId, userIds)
  }

  /** @param {string} taskId @param {Object} data */
  async function updateTaskAssignment(taskId, data) {
    await updateTaskAssignmentApi(taskId, data)
  }

  /** @param {string} taskId @param {string} dependOnTaskId */
  async function addTaskDependency(taskId, dependOnTaskId) {
    await addTaskDependencyApi(taskId, dependOnTaskId)
  }

  /** @param {string} taskId */
  async function deleteTaskDependency(taskId) {
    await deleteTaskDependencyApi(taskId)
  }

  return {
    projectTasks,
    groupTasks,
    myTasks,
    currentTask,
    fetchProjectTasks,
    fetchGroupTasks,
    fetchMyTasks,
    fetchTaskDetail,
    createTask,
    updateTask,
    deleteTask,
    assignTask,
    updateTaskAssignment,
    addTaskDependency,
    deleteTaskDependency,
  }
})
