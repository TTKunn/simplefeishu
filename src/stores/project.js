import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  getMyProjectsApi,
  getProjectDetailApi,
  createProjectApi,
  updateProjectApi,
  deleteProjectApi,
  joinProjectApi,
  quitProjectApi,
  getProjectMembersApi,
} from '@/api/project.js'

export const useProjectStore = defineStore('project', () => {
  const myProjects = ref(/** @type {Array<Object>} */ ([]))
  const currentProject = ref(/** @type {Object | null} */ (null))
  const projectMembers = ref(/** @type {Array<Object>} */ ([]))

  async function fetchMyProjects() {
    const res = await getMyProjectsApi()
    myProjects.value = res.data || []
  }

  /** @param {string} projectId */
  async function fetchProjectDetail(projectId) {
    const res = await getProjectDetailApi(projectId)
    currentProject.value = res.data
  }

  /** @param {Object} data */
  async function createProject(data) {
    const res = await createProjectApi(data)
    await fetchMyProjects()
    return res.data
  }

  /** @param {string} projectId @param {Object} data */
  async function updateProject(projectId, data) {
    await updateProjectApi(projectId, data)
    await fetchProjectDetail(projectId)
  }

  /** @param {string} projectId */
  async function deleteProject(projectId) {
    await deleteProjectApi(projectId)
    await fetchMyProjects()
  }

  /** @param {string} projectCode */
  async function joinProject(projectCode) {
    await joinProjectApi(projectCode)
    await fetchMyProjects()
  }

  /** @param {string} projectId */
  async function quitProject(projectId) {
    await quitProjectApi(projectId)
    await fetchMyProjects()
  }

  /** @param {string} projectId */
  async function fetchProjectMembers(projectId) {
    const res = await getProjectMembersApi(projectId)
    projectMembers.value = res.data || []
  }

  return {
    myProjects,
    currentProject,
    projectMembers,
    fetchMyProjects,
    fetchProjectDetail,
    createProject,
    updateProject,
    deleteProject,
    joinProject,
    quitProject,
    fetchProjectMembers,
  }
})
