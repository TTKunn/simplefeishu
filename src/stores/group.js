import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  getProjectGroupsApi,
  getGroupDetailApi,
  getMyGroupApi,
  createGroupApi,
  joinGroupApi,
  quitGroupApi,
  getGroupMembersApi,
  dissolveGroupApi,
  transferLeaderApi,
} from '@/api/group.js'

export const useGroupStore = defineStore('group', () => {
  const projectGroups = ref(/** @type {Array<Object>} */ ([]))
  const currentGroup = ref(/** @type {Object | null} */ (null))
  const groupMembers = ref(/** @type {Array<Object>} */ ([]))
  const myGroup = ref(/** @type {Object | null} */ (null))

  /** @param {string} projectId */
  async function fetchProjectGroups(projectId) {
    const res = await getProjectGroupsApi(projectId)
    projectGroups.value = res.data || []
  }

  /** @param {string} groupId */
  async function fetchGroupDetail(groupId) {
    const res = await getGroupDetailApi(groupId)
    currentGroup.value = res.data
  }

  /** @param {string} projectId */
  async function fetchMyGroup(projectId) {
    const res = await getMyGroupApi(projectId)
    myGroup.value = res.data
  }

  /** @param {Object} data */
  async function createGroup(data) {
    const res = await createGroupApi(data)
    return res.data
  }

  /** @param {string} groupId */
  async function joinGroup(groupId) {
    await joinGroupApi(groupId)
  }

  /** @param {string} groupId */
  async function quitGroup(groupId) {
    await quitGroupApi(groupId)
  }

  /** @param {string} groupId */
  async function fetchGroupMembers(groupId) {
    const res = await getGroupMembersApi(groupId)
    groupMembers.value = res.data || []
  }

  /** @param {string} groupId */
  async function dissolveGroup(groupId) {
    await dissolveGroupApi(groupId)
  }

  /** @param {string} groupId @param {string} newLeaderId */
  async function transferLeader(groupId, newLeaderId) {
    await transferLeaderApi(groupId, newLeaderId)
  }

  return {
    projectGroups,
    currentGroup,
    groupMembers,
    myGroup,
    fetchProjectGroups,
    fetchGroupDetail,
    fetchMyGroup,
    createGroup,
    joinGroup,
    quitGroup,
    fetchGroupMembers,
    dissolveGroup,
    transferLeader,
  }
})
