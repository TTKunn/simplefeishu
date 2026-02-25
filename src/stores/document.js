import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  createFolderApi,
  deleteFolderApi,
  updateFolderApi,
  getGroupFoldersApi,
  uploadDocumentApi,
} from '@/api/document.js'

export const useDocumentStore = defineStore('document', () => {
  const groupFolders = ref(/** @type {Array<Object>} */ ([]))

  /** @param {string} groupId */
  async function fetchGroupFolders(groupId) {
    const res = await getGroupFoldersApi(groupId)
    groupFolders.value = res.data || []
  }

  /** @param {Object} data */
  async function createFolder(data) {
    const res = await createFolderApi(data)
    return res.data
  }

  /** @param {string} folderId */
  async function deleteFolder(folderId) {
    await deleteFolderApi(folderId)
  }

  /** @param {string} folderId @param {Object} data */
  async function updateFolder(folderId, data) {
    await updateFolderApi(folderId, data)
  }

  /** @param {Object} data */
  async function uploadDocument(data) {
    const res = await uploadDocumentApi(data)
    return res.data
  }

  return {
    groupFolders,
    fetchGroupFolders,
    createFolder,
    deleteFolder,
    updateFolder,
    uploadDocument,
  }
})
