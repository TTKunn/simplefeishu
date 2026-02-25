import { folders, documents, getUserByToken, uuid } from './data.js'

/** @type {Array<import('./index.js').MockRoute>} */
export const documentRoutes = [
  {
    method: 'post',
    url: '/api/document/folder',
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const data = JSON.parse(config.data)
      const now = new Date().toISOString()

      const newFolder = {
        id: folders.length + 1,
        folderId: uuid(),
        groupId: data.groupId,
        folderName: data.folderName,
        parentFolderId: data.parentFolderId || null,
        creatorId: user.userId,
        status: 1,
        createTime: now,
        updateTime: now,
      }
      folders.push(newFolder)

      return { code: 200, message: '操作成功', data: newFolder }
    },
  },
  {
    method: 'delete',
    url: /^\/api\/document\/folder\/[^/]+$/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const folderId = config.url.split('/api/document/folder/')[1]
      const idx = folders.findIndex((f) => f.folderId === folderId)
      if (idx === -1) return { code: 404, message: '文件夹不存在', data: null }

      folders.splice(idx, 1)
      return { code: 200, message: '操作成功', data: null }
    },
  },
  {
    method: 'put',
    url: /^\/api\/document\/folder\/[^/]+$/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const folderId = config.url.split('/api/document/folder/')[1]
      const folder = folders.find((f) => f.folderId === folderId)
      if (!folder) return { code: 404, message: '文件夹不存在', data: null }

      const params = new URLSearchParams(config.data)
      const folderName = params.get('folderName')
      if (folderName) folder.folderName = folderName
      folder.updateTime = new Date().toISOString()

      return { code: 200, message: '操作成功', data: null }
    },
  },
  {
    method: 'get',
    url: /^\/api\/document\/folder\/group\/.+/,
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      const groupId = config.url.split('/api/document/folder/group/')[1]
      const list = folders.filter((f) => f.groupId === groupId && f.status === 1)
      return { code: 200, message: '操作成功', data: list }
    },
  },
  {
    method: 'post',
    url: '/api/document/upload',
    handler(config) {
      const user = getUserByToken(config.token)
      if (!user) return { code: 401, message: '未授权', data: null }

      // mock 文件上传：从 FormData 中提取信息
      const now = new Date().toISOString()
      const newDoc = {
        id: documents.length + 1,
        documentId: uuid(),
        groupId: 'mock-group',
        folderId: 'mock-folder',
        fileName: 'mock-file.txt',
        fileSize: 1024,
        description: '',
        uploaderId: user.userId,
        uploaderName: user.realName,
        status: 1,
        createTime: now,
        updateTime: now,
      }
      documents.push(newDoc)

      return { code: 200, message: '操作成功', data: newDoc }
    },
  },
]
