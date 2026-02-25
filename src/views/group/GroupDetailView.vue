<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.js'
import { useGroupStore } from '@/stores/group.js'
import { useTaskStore } from '@/stores/task.js'
import { useDocumentStore } from '@/stores/document.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus, FolderAdd, Upload } from '@element-plus/icons-vue'
import {
  TaskStatusLabel,
  TaskStatusType,
  TaskPriorityLabel,
  TaskPriorityType,
} from '@/utils/constants.js'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const groupStore = useGroupStore()
const taskStore = useTaskStore()
const documentStore = useDocumentStore()

const loading = ref(true)
const activeTab = ref('info')

const projectId = computed(() => /** @type {string} */ (route.params.projectId))
const groupId = computed(() => /** @type {string} */ (route.params.groupId))

const group = computed(() => groupStore.currentGroup)
const isLeader = computed(
  () => group.value?.leaderId === userStore.userInfo?.userId,
)
const isMember = computed(
  () => groupStore.groupMembers.some((m) => m.userId === userStore.userInfo?.userId),
)

// 文件夹
const createFolderDialogVisible = ref(false)
const folderName = ref('')
const createFolderLoading = ref(false)
const editFolderDialogVisible = ref(false)
const editFolderName = ref('')
const editFolderId = ref('')
const editFolderLoading = ref(false)

// 上传文档
const uploadDialogVisible = ref(false)
const uploadForm = ref({ folderId: '', description: '' })
const uploadFile = ref(/** @type {File | null} */ (null))
const uploadLoading = ref(false)

onMounted(async () => {
  try {
    await Promise.all([
      groupStore.fetchGroupDetail(groupId.value),
      groupStore.fetchGroupMembers(groupId.value),
      taskStore.fetchGroupTasks(groupId.value),
      documentStore.fetchGroupFolders(groupId.value),
    ])
  } finally {
    loading.value = false
  }
})

async function handleQuitGroup() {
  await ElMessageBox.confirm('确定要退出该小组吗？', '退出小组', { type: 'warning' })
  try {
    await groupStore.quitGroup(groupId.value)
    ElMessage.success('已退出小组')
    router.push(`/project/${projectId.value}`)
  } catch {
    //
  }
}

async function handleDissolveGroup() {
  await ElMessageBox.confirm('确定要解散该小组吗？所有成员将被移除。', '解散小组', {
    type: 'warning',
    confirmButtonText: '解散',
  })
  try {
    await groupStore.dissolveGroup(groupId.value)
    ElMessage.success('小组已解散')
    router.push(`/project/${projectId.value}`)
  } catch {
    //
  }
}

async function handleTransferLeader(newLeaderId) {
  const member = groupStore.groupMembers.find((m) => m.userId === newLeaderId)
  await ElMessageBox.confirm(
    `确定将组长转让给 ${member?.realName} 吗？`,
    '转让组长',
    { type: 'warning' },
  )
  try {
    await groupStore.transferLeader(groupId.value, newLeaderId)
    ElMessage.success('组长已转让')
    await groupStore.fetchGroupDetail(groupId.value)
    await groupStore.fetchGroupMembers(groupId.value)
  } catch {
    //
  }
}

async function handleCreateFolder() {
  if (!folderName.value.trim()) {
    ElMessage.warning('请输入文件夹名称')
    return
  }
  createFolderLoading.value = true
  try {
    await documentStore.createFolder({
      groupId: groupId.value,
      folderName: folderName.value.trim(),
      parentFolderId: null,
    })
    ElMessage.success('文件夹创建成功')
    createFolderDialogVisible.value = false
    folderName.value = ''
    await documentStore.fetchGroupFolders(groupId.value)
  } catch {
    //
  } finally {
    createFolderLoading.value = false
  }
}

function openEditFolder(folder) {
  editFolderId.value = folder.folderId
  editFolderName.value = folder.folderName
  editFolderDialogVisible.value = true
}

async function handleEditFolder() {
  if (!editFolderName.value.trim()) {
    ElMessage.warning('请输入文件夹名称')
    return
  }
  editFolderLoading.value = true
  try {
    await documentStore.updateFolder(editFolderId.value, { folderName: editFolderName.value.trim() })
    ElMessage.success('文件夹已更新')
    editFolderDialogVisible.value = false
    await documentStore.fetchGroupFolders(groupId.value)
  } catch {
    //
  } finally {
    editFolderLoading.value = false
  }
}

async function handleDeleteFolder(folderId) {
  await ElMessageBox.confirm('确定要删除该文件夹吗？', '删除文件夹', { type: 'warning' })
  try {
    await documentStore.deleteFolder(folderId)
    ElMessage.success('文件夹已删除')
    await documentStore.fetchGroupFolders(groupId.value)
  } catch {
    //
  }
}

function handleFileChange(file) {
  uploadFile.value = file.raw
}

async function handleUpload() {
  if (!uploadFile.value) {
    ElMessage.warning('请选择文件')
    return
  }
  uploadLoading.value = true
  try {
    await documentStore.uploadDocument({
      groupId: groupId.value,
      folderId: uploadForm.value.folderId || '',
      description: uploadForm.value.description,
      file: uploadFile.value,
    })
    ElMessage.success('文档上传成功')
    uploadDialogVisible.value = false
    uploadFile.value = null
    uploadForm.value = { folderId: '', description: '' }
  } catch {
    //
  } finally {
    uploadLoading.value = false
  }
}

function parseTags(tags) {
  if (Array.isArray(tags)) return tags
  try { return JSON.parse(tags) } catch { return [] }
}
</script>

<template>
  <div class="group-detail" v-loading="loading">
    <div class="detail-header">
      <el-button :icon="ArrowLeft" text @click="router.push(`/project/${projectId}`)">
        返回项目
      </el-button>
      <h2 v-if="group" class="group-title">{{ group.groupName }}</h2>
    </div>

    <template v-if="group">
      <el-tabs v-model="activeTab">
        <!-- 基本信息 -->
        <el-tab-pane label="信息" name="info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="小组名称">{{ group.groupName }}</el-descriptions-item>
            <el-descriptions-item label="小组编码">{{ group.groupCode }}</el-descriptions-item>
            <el-descriptions-item label="小组描述" :span="2">
              {{ group.description || '暂无描述' }}
            </el-descriptions-item>
            <el-descriptions-item label="当前人数">
              {{ group.currentMembers }}/{{ group.maxMembers }} 人
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ group.createTime }}</el-descriptions-item>
          </el-descriptions>

          <div class="section-title">小组成员</div>
          <el-table :data="groupStore.groupMembers" stripe>
            <el-table-column label="姓名" prop="realName" />
            <el-table-column label="用户名" prop="username" />
            <el-table-column label="学号" prop="studentId" />
            <el-table-column label="角色" prop="roleInGroup">
              <template #default="{ row }">
                <el-tag :type="row.roleInGroup === 'LEADER' ? 'warning' : 'info'" size="small">
                  {{ row.roleInGroup === 'LEADER' ? '组长' : '成员' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              v-if="userStore.isTeacher || isLeader"
              label="操作"
              width="120"
            >
              <template #default="{ row }">
                <el-button
                  v-if="row.roleInGroup !== 'LEADER'"
                  type="primary"
                  text
                  size="small"
                  @click="handleTransferLeader(row.userId)"
                >
                  设为组长
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="actions-section">
            <el-button
              v-if="userStore.isStudent && isMember && !isLeader"
              type="warning"
              @click="handleQuitGroup"
            >
              退出小组
            </el-button>
            <el-button
              v-if="userStore.isTeacher"
              type="danger"
              @click="handleDissolveGroup"
            >
              解散小组
            </el-button>
          </div>
        </el-tab-pane>

        <!-- 任务 -->
        <el-tab-pane label="任务" name="tasks">
          <el-table v-if="taskStore.groupTasks.length" :data="taskStore.groupTasks" stripe>
            <el-table-column label="编码" prop="taskCode" width="100" />
            <el-table-column label="标题" prop="taskTitle" min-width="160" />
            <el-table-column label="跟进人" min-width="120">
              <template #default="{ row }">
                <template v-if="row.assignees?.length">
                  <el-tag
                    v-for="name in row.assignees"
                    :key="name"
                    size="small"
                    effect="plain"
                    style="margin-right: 4px"
                  >{{ name }}</el-tag>
                </template>
                <span v-else style="color: var(--color-text-secondary)">未分配</span>
              </template>
            </el-table-column>
            <el-table-column label="优先级" width="80">
              <template #default="{ row }">
                <el-tag :type="TaskPriorityType[row.priority]" size="small">
                  {{ TaskPriorityLabel[row.priority] }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="TaskStatusType[row.status]" size="small">
                  {{ TaskStatusLabel[row.status] }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="标签" min-width="120">
              <template #default="{ row }">
                <el-tag
                  v-for="tag in parseTags(row.tags)"
                  :key="tag"
                  size="small"
                  effect="plain"
                  style="margin-right: 4px"
                >
                  {{ tag }}
                </el-tag>
                <span v-if="!parseTags(row.tags).length" style="color: var(--color-text-secondary)">-</span>
              </template>
            </el-table-column>
            <el-table-column label="截止时间" width="160">
              <template #default="{ row }">{{ row.endTime || '-' }}</template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无任务" />
        </el-tab-pane>

        <!-- 文档 -->
        <el-tab-pane label="文档" name="documents">
          <div class="doc-header">
            <el-button
              type="primary"
              size="small"
              :icon="FolderAdd"
              @click="createFolderDialogVisible = true"
            >
              新建文件夹
            </el-button>
            <el-button
              size="small"
              :icon="Upload"
              @click="uploadDialogVisible = true"
            >
              上传文档
            </el-button>
          </div>

          <div v-if="documentStore.groupFolders.length" class="folder-list">
            <el-card
              v-for="folder in documentStore.groupFolders"
              :key="folder.folderId"
              shadow="hover"
              class="folder-card"
            >
              <div class="folder-info">
                <el-icon style="font-size: 20px; color: var(--color-primary)"><FolderAdd /></el-icon>
                <span class="folder-name">{{ folder.folderName }}</span>
              </div>
              <div class="folder-meta">
                <span>{{ folder.createTime }}</span>
                <span>
                  <el-button type="primary" text size="small" @click="openEditFolder(folder)">
                    重命名
                  </el-button>
                  <el-button type="danger" text size="small" @click="handleDeleteFolder(folder.folderId)">
                    删除
                  </el-button>
                </span>
              </div>
            </el-card>
          </div>
          <el-empty v-else description="暂无文件夹" />
        </el-tab-pane>
      </el-tabs>
    </template>

    <!-- 创建文件夹弹窗 -->
    <el-dialog v-model="createFolderDialogVisible" title="新建文件夹" width="400px" @closed="folderName = ''">
      <el-input v-model="folderName" placeholder="请输入文件夹名称" @keyup.enter="handleCreateFolder" />
      <template #footer>
        <el-button @click="createFolderDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createFolderLoading" @click="handleCreateFolder">创建</el-button>
      </template>
    </el-dialog>

    <!-- 重命名文件夹弹窗 -->
    <el-dialog v-model="editFolderDialogVisible" title="重命名文件夹" width="400px">
      <el-input v-model="editFolderName" placeholder="请输入新名称" @keyup.enter="handleEditFolder" />
      <template #footer>
        <el-button @click="editFolderDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="editFolderLoading" @click="handleEditFolder">保存</el-button>
      </template>
    </el-dialog>

    <!-- 上传文档弹窗 -->
    <el-dialog v-model="uploadDialogVisible" title="上传文档" width="460px">
      <el-form :model="uploadForm" label-width="80px">
        <el-form-item label="文件夹">
          <el-select v-model="uploadForm.folderId" placeholder="选择文件夹（可选）" clearable>
            <el-option
              v-for="f in documentStore.groupFolders"
              :key="f.folderId"
              :label="f.folderName"
              :value="f.folderId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="uploadForm.description" placeholder="文档描述（可选）" />
        </el-form-item>
        <el-form-item label="文件">
          <el-upload
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
          >
            <el-button size="small" type="primary">选择文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="uploadLoading" @click="handleUpload">上传</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.detail-header {
  margin-bottom: 16px;
}

.group-title {
  font-size: 20px;
  font-weight: 600;
  margin-top: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin: 20px 0 12px;
}

.actions-section {
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid var(--color-border);
}

.doc-header {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.folder-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.folder-card {
  cursor: default;
}

.folder-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.folder-name {
  font-size: 15px;
  font-weight: 500;
}

.folder-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-secondary);
}
</style>
