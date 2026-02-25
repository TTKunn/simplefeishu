<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.js'
import { useProjectStore } from '@/stores/project.js'
import { useGroupStore } from '@/stores/group.js'
import { useTaskStore } from '@/stores/task.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus, ArrowDown } from '@element-plus/icons-vue'
import {
  ProjectStatusLabel,
  ProjectStatusType,
  ProjectStatus,
  TaskStatusLabel,
  TaskStatusType,
  TaskPriorityLabel,
  TaskPriorityType,
} from '@/utils/constants.js'
import GroupCard from '@/components/group/GroupCard.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const projectStore = useProjectStore()
const groupStore = useGroupStore()
const taskStore = useTaskStore()

const activeTab = ref('overview')
const loading = ref(true)

const projectId = computed(() => /** @type {string} */ (route.params.projectId))

// 编辑项目
const editDialogVisible = ref(false)
const editForm = ref({})
const editLoading = ref(false)

// 创建小组
const createGroupDialogVisible = ref(false)
const createGroupForm = ref({ groupName: '', description: '' })
const createGroupLoading = ref(false)

// 创建任务
const createTaskDialogVisible = ref(false)
const createTaskForm = ref({
  taskTitle: '',
  taskDescription: '',
  groupId: '',
  priority: 1,
  startTime: '',
  endTime: '',
  estimatedHours: 0,
  tags: [],
  assignToUserIds: [],
})
const createTaskLoading = ref(false)
const tagInput = ref('')

// 任务详情
const taskDetailDialogVisible = ref(false)
const taskDetailLoading = ref(false)

// 任务分配
const assignDialogVisible = ref(false)
const assignTaskId = ref('')
const assignUserIds = ref('')
const assignLoading = ref(false)

// 任务状态更新
const statusDialogVisible = ref(false)
const statusTaskId = ref('')
const statusForm = ref({ status: 0, progress: 0, actualHours: 0 })
const statusLoading = ref(false)

// 任务依赖
const depTaskId = ref('')
const depInput = ref('')
const depLoading = ref(false)

// 选中小组的成员列表（用于指派人选择）
const groupMembersForAssign = ref(/** @type {Array<Object>} */ ([]))

onMounted(async () => {
  try {
    await Promise.all([
      projectStore.fetchProjectDetail(projectId.value),
      projectStore.fetchProjectMembers(projectId.value),
      groupStore.fetchProjectGroups(projectId.value),
      groupStore.fetchMyGroup(projectId.value),
      taskStore.fetchProjectTasks(projectId.value),
    ])
  } finally {
    loading.value = false
  }
})

const project = computed(() => projectStore.currentProject)

function openEditDialog() {
  editForm.value = {
    projectName: project.value?.projectName || '',
    description: project.value?.description || '',
    maxGroupSize: project.value?.maxGroupSize || 6,
    minGroupSize: project.value?.minGroupSize || 3,
    allowStudentCreateGroup: project.value?.allowStudentCreateGroup ?? 1,
    status: project.value?.status || 1,
  }
  editDialogVisible.value = true
}

async function handleEditProject() {
  editLoading.value = true
  try {
    await projectStore.updateProject(projectId.value, editForm.value)
    ElMessage.success('项目更新成功')
    editDialogVisible.value = false
  } catch {
    //
  } finally {
    editLoading.value = false
  }
}

async function handleDeleteProject() {
  await ElMessageBox.confirm('确定要删除该项目吗？此操作不可恢复。', '删除项目', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  try {
    await projectStore.deleteProject(projectId.value)
    ElMessage.success('项目已删除')
    router.push('/')
  } catch {
    //
  }
}

async function handleCreateGroup() {
  if (!createGroupForm.value.groupName.trim()) {
    ElMessage.warning('请输入小组名称')
    return
  }
  createGroupLoading.value = true
  try {
    await groupStore.createGroup({
      projectId: projectId.value,
      groupName: createGroupForm.value.groupName,
      description: createGroupForm.value.description,
    })
    ElMessage.success('小组创建成功')
    createGroupDialogVisible.value = false
    createGroupForm.value = { groupName: '', description: '' }
    await groupStore.fetchProjectGroups(projectId.value)
    await groupStore.fetchMyGroup(projectId.value)
  } catch {
    //
  } finally {
    createGroupLoading.value = false
  }
}

async function handleJoinGroup(groupId) {
  try {
    await groupStore.joinGroup(groupId)
    ElMessage.success('加入小组成功')
    await groupStore.fetchProjectGroups(projectId.value)
    await groupStore.fetchMyGroup(projectId.value)
  } catch {
    //
  }
}

function goToGroup(groupId) {
  router.push(`/project/${projectId.value}/group/${groupId}`)
}

function addTag() {
  const tag = tagInput.value.trim()
  if (tag && !createTaskForm.value.tags.includes(tag)) {
    createTaskForm.value.tags.push(tag)
  }
  tagInput.value = ''
}

function removeTag(tag) {
  createTaskForm.value.tags = createTaskForm.value.tags.filter((t) => t !== tag)
}

function openCreateTaskDialog() {
  createTaskForm.value = {
    taskTitle: '',
    taskDescription: '',
    groupId: groupStore.myGroup?.groupId || groupStore.projectGroups[0]?.groupId || '',
    priority: 1,
    startTime: '',
    endTime: '',
    estimatedHours: 0,
    tags: [],
    assignToUserIds: [],
  }
  createTaskDialogVisible.value = true
}

async function handleCreateTask() {
  if (!createTaskForm.value.taskTitle.trim()) {
    ElMessage.warning('请输入任务标题')
    return
  }
  createTaskLoading.value = true
  try {
    await taskStore.createTask({
      ...createTaskForm.value,
      projectId: projectId.value,
    })
    ElMessage.success('任务创建成功')
    createTaskDialogVisible.value = false
    await taskStore.fetchProjectTasks(projectId.value)
  } catch {
    //
  } finally {
    createTaskLoading.value = false
  }
}

async function handleDeleteTask(taskId) {
  await ElMessageBox.confirm('确定要删除该任务吗？', '删除任务', { type: 'warning' })
  try {
    await taskStore.deleteTask(taskId)
    ElMessage.success('任务已删除')
    await taskStore.fetchProjectTasks(projectId.value)
  } catch {
    //
  }
}

function parseTags(tags) {
  if (Array.isArray(tags)) return tags
  try {
    return JSON.parse(tags)
  } catch {
    return []
  }
}

function handleTaskCommand(command, taskId) {
  switch (command) {
    case 'detail':
      openTaskDetail(taskId)
      break
    case 'assign':
      openAssignDialog(taskId)
      break
    case 'status':
      openStatusDialog(taskId)
      break
    case 'delete':
      handleDeleteTask(taskId)
      break
  }
}

// 查看任务详情
async function openTaskDetail(taskId) {
  taskDetailLoading.value = true
  taskDetailDialogVisible.value = true
  try {
    await taskStore.fetchTaskDetail(taskId)
  } finally {
    taskDetailLoading.value = false
  }
}

// 加载小组成员（用于创建任务时选择指派人）
async function onGroupChange(gId) {
  if (!gId) {
    groupMembersForAssign.value = []
    return
  }
  const { getGroupMembersApi } = await import('@/api/group.js')
  const res = await getGroupMembersApi(gId)
  groupMembersForAssign.value = res.data || []
}

// 打开分配弹窗
function openAssignDialog(taskId) {
  assignTaskId.value = taskId
  assignUserIds.value = ''
  assignDialogVisible.value = true
}

async function handleAssignTask() {
  if (!assignUserIds.value) {
    ElMessage.warning('请选择要分配的成员')
    return
  }
  assignLoading.value = true
  try {
    await taskStore.assignTask(assignTaskId.value, assignUserIds.value)
    ElMessage.success('任务分配成功')
    assignDialogVisible.value = false
    // 刷新详情（如果打开了的话）
    if (taskStore.currentTask?.taskId === assignTaskId.value) {
      await taskStore.fetchTaskDetail(assignTaskId.value)
    }
  } catch {
    //
  } finally {
    assignLoading.value = false
  }
}

// 打开状态更新弹窗
function openStatusDialog(taskId) {
  statusTaskId.value = taskId
  statusForm.value = { status: 0, progress: 0, actualHours: 0 }
  statusDialogVisible.value = true
}

async function handleUpdateStatus() {
  statusLoading.value = true
  try {
    await taskStore.updateTaskAssignment(statusTaskId.value, statusForm.value)
    ElMessage.success('任务状态已更新')
    statusDialogVisible.value = false
    await taskStore.fetchProjectTasks(projectId.value)
    if (taskStore.currentTask?.taskId === statusTaskId.value) {
      await taskStore.fetchTaskDetail(statusTaskId.value)
    }
  } catch {
    //
  } finally {
    statusLoading.value = false
  }
}

// 添加依赖
async function handleAddDependency() {
  if (!depInput.value.trim()) {
    ElMessage.warning('请输入依赖任务的编码或ID')
    return
  }
  depLoading.value = true
  try {
    // 尝试通过 taskCode 查找 taskId
    const target = taskStore.projectTasks.find(
      (t) => t.taskCode === depInput.value.trim() || t.taskId === depInput.value.trim(),
    )
    if (!target) {
      ElMessage.error('未找到该任务')
      depLoading.value = false
      return
    }
    await taskStore.addTaskDependency(depTaskId.value, target.taskId)
    ElMessage.success('依赖添加成功')
    depInput.value = ''
    await taskStore.fetchTaskDetail(depTaskId.value)
  } catch {
    //
  } finally {
    depLoading.value = false
  }
}

async function handleRemoveDependency(taskId) {
  try {
    await taskStore.deleteTaskDependency(taskId)
    ElMessage.success('依赖已移除')
    await taskStore.fetchTaskDetail(taskId)
  } catch {
    //
  }
}

// 根据 taskId 找 taskCode
function getTaskCodeById(taskId) {
  const t = taskStore.projectTasks.find((t) => t.taskId === taskId)
  return t?.taskCode || taskId
}
</script>

<template>
  <div class="project-detail" v-loading="loading">
    <div class="detail-header">
      <el-button :icon="ArrowLeft" text @click="router.push('/')">返回</el-button>
      <h2 v-if="project" class="project-title">
        {{ project.projectName }}
        <el-tag :type="ProjectStatusType[project.status]" size="small" style="margin-left: 8px">
          {{ ProjectStatusLabel[project.status] }}
        </el-tag>
      </h2>
    </div>

    <el-tabs v-model="activeTab">
      <!-- 概览 -->
      <el-tab-pane label="概览" name="overview">
        <el-descriptions v-if="project" :column="2" border>
          <el-descriptions-item label="项目名称">{{ project.projectName }}</el-descriptions-item>
          <el-descriptions-item label="项目编码">
            <el-text copyable>{{ project.projectCode }}</el-text>
          </el-descriptions-item>
          <el-descriptions-item label="项目描述" :span="2">
            {{ project.description || '暂无描述' }}
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">
            {{ project.startTime || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="结束时间">
            {{ project.endTime || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="小组人数">
            {{ project.minGroupSize }} - {{ project.maxGroupSize }} 人
          </el-descriptions-item>
          <el-descriptions-item label="组队截止">
            {{ project.groupDeadline || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="学生创建小组">
            {{ project.allowStudentCreateGroup === 1 ? '允许' : '不允许' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <!-- 成员 -->
      <el-tab-pane label="成员" name="members">
        <el-table :data="projectStore.projectMembers" stripe>
          <el-table-column label="姓名" prop="realName" />
          <el-table-column label="用户名" prop="username" />
          <el-table-column label="学号" prop="studentId">
            <template #default="{ row }">
              {{ row.studentId || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="角色" prop="roleInProject">
            <template #default="{ row }">
              <el-tag :type="row.roleInProject === 'OWNER' ? 'warning' : 'info'" size="small">
                {{ row.roleInProject === 'OWNER' ? '创建者' : '成员' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="加入时间" prop="joinTime" />
        </el-table>
      </el-tab-pane>

      <!-- 小组 -->
      <el-tab-pane label="小组" name="groups">
        <div class="groups-header">
          <div v-if="groupStore.myGroup" class="my-group-tip">
            <el-tag type="success" size="small">我的小组</el-tag>
            <span>{{ groupStore.myGroup.groupName }}</span>
          </div>
          <el-button
            v-if="userStore.isStudent && !groupStore.myGroup"
            type="primary"
            size="small"
            @click="createGroupDialogVisible = true"
          >
            创建小组
          </el-button>
        </div>
        <div v-if="groupStore.projectGroups.length" class="group-grid">
          <GroupCard
            v-for="group in groupStore.projectGroups"
            :key="group.groupId"
            :group="group"
            :is-my-group="groupStore.myGroup?.groupId === group.groupId"
            :can-join="userStore.isStudent && !groupStore.myGroup"
            @click="goToGroup(group.groupId)"
            @join="handleJoinGroup(group.groupId)"
          />
        </div>
        <el-empty v-else description="暂无小组" />
      </el-tab-pane>

      <!-- 任务 -->
      <el-tab-pane label="任务" name="tasks">
        <div class="tasks-header">
          <span>共 {{ taskStore.projectTasks.length }} 个任务</span>
          <el-button type="primary" size="small" :icon="Plus" @click="openCreateTaskDialog">
            创建任务
          </el-button>
        </div>
        <el-table v-if="taskStore.projectTasks.length" :data="taskStore.projectTasks" stripe>
          <el-table-column label="编码" prop="taskCode" width="100" />
          <el-table-column label="标题" prop="taskTitle" min-width="180">
            <template #default="{ row }">
              <a class="task-title-link" @click="openTaskDetail(row.taskId)">{{ row.taskTitle }}</a>
            </template>
          </el-table-column>
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
              <span v-else class="text-muted">未分配</span>
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
                class="task-tag"
                effect="plain"
              >
                {{ tag }}
              </el-tag>
              <span v-if="!parseTags(row.tags).length" class="text-muted">-</span>
            </template>
          </el-table-column>
          <el-table-column label="截止时间" width="160">
            <template #default="{ row }">
              {{ row.endTime || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-dropdown trigger="click" @command="(cmd) => handleTaskCommand(cmd, row.taskId)">
                <el-button type="primary" text size="small">
                  操作 <el-icon style="margin-left: 2px"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="detail">查看详情</el-dropdown-item>
                    <el-dropdown-item command="assign">分配任务</el-dropdown-item>
                    <el-dropdown-item command="status">更新状态</el-dropdown-item>
                    <el-dropdown-item command="delete" divided style="color: var(--el-color-danger)">
                      删除任务
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无任务" />
      </el-tab-pane>

      <!-- 设置（教师） -->
      <el-tab-pane v-if="userStore.isTeacher" label="设置" name="settings">
        <div class="settings-section">
          <h3>项目设置</h3>
          <el-button type="primary" @click="openEditDialog">编辑项目信息</el-button>
        </div>
        <div class="settings-section danger-zone">
          <h3>危险操作</h3>
          <p class="danger-desc">删除项目后，所有相关数据将被清除，此操作不可恢复。</p>
          <el-button type="danger" @click="handleDeleteProject">删除项目</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 编辑项目弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑项目" width="500px">
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="项目名称">
          <el-input v-model="editForm.projectName" />
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input v-model="editForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="项目状态">
          <el-select v-model="editForm.status">
            <el-option
              v-for="(label, key) in ProjectStatusLabel"
              :key="key"
              :label="label"
              :value="Number(key)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="小组人数范围">
          <div style="display: flex; align-items: center; gap: 8px">
            <el-input-number v-model="editForm.minGroupSize" :min="1" :max="20" />
            <span>至</span>
            <el-input-number v-model="editForm.maxGroupSize" :min="1" :max="20" />
            <span>人</span>
          </div>
        </el-form-item>
        <el-form-item label="学生创建小组">
          <el-switch
            v-model="editForm.allowStudentCreateGroup"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="editLoading" @click="handleEditProject">保存</el-button>
      </template>
    </el-dialog>

    <!-- 创建小组弹窗 -->
    <el-dialog
      v-model="createGroupDialogVisible"
      title="创建小组"
      width="420px"
      @closed="createGroupForm = { groupName: '', description: '' }"
    >
      <el-form :model="createGroupForm" label-width="80px">
        <el-form-item label="小组名称">
          <el-input v-model="createGroupForm.groupName" placeholder="请输入小组名称" />
        </el-form-item>
        <el-form-item label="小组描述">
          <el-input
            v-model="createGroupForm.description"
            type="textarea"
            :rows="2"
            placeholder="请输入小组描述（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createGroupDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createGroupLoading" @click="handleCreateGroup">
          创建
        </el-button>
      </template>
    </el-dialog>

    <!-- 创建任务弹窗 -->
    <el-dialog v-model="createTaskDialogVisible" title="创建任务" width="560px">
      <el-form :model="createTaskForm" label-width="100px">
        <el-form-item label="任务标题">
          <el-input v-model="createTaskForm.taskTitle" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input
            v-model="createTaskForm.taskDescription"
            type="textarea"
            :rows="3"
            placeholder="请输入任务描述"
          />
        </el-form-item>
        <el-form-item label="所属小组">
          <el-select v-model="createTaskForm.groupId" placeholder="选择小组" @change="onGroupChange">
            <el-option
              v-for="g in groupStore.projectGroups"
              :key="g.groupId"
              :label="g.groupName"
              :value="g.groupId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="createTaskForm.priority">
            <el-option :value="0" label="低" />
            <el-option :value="1" label="中" />
            <el-option :value="2" label="高" />
            <el-option :value="3" label="紧急" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <div style="display: flex; align-items: center; gap: 8px">
            <el-date-picker
              v-model="createTaskForm.startTime"
              type="datetime"
              placeholder="开始时间"
              style="flex: 1"
            />
            <span>至</span>
            <el-date-picker
              v-model="createTaskForm.endTime"
              type="datetime"
              placeholder="截止时间"
              style="flex: 1"
            />
          </div>
        </el-form-item>
        <el-form-item label="预估工时">
          <el-input-number v-model="createTaskForm.estimatedHours" :min="0" :precision="1" />
          <span style="margin-left: 8px">小时</span>
        </el-form-item>
        <el-form-item label="标签">
          <div class="tag-input-area">
            <el-tag
              v-for="tag in createTaskForm.tags"
              :key="tag"
              closable
              size="small"
              @close="removeTag(tag)"
              style="margin-right: 4px"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-model="tagInput"
              size="small"
              placeholder="输入后回车添加"
              style="width: 140px"
              @keyup.enter="addTag"
            />
          </div>
        </el-form-item>
        <el-form-item label="指派成员">
          <el-select
            v-model="createTaskForm.assignToUserIds"
            multiple
            placeholder="选择要指派的成员"
            style="width: 100%"
          >
            <el-option
              v-for="m in groupMembersForAssign"
              :key="m.userId"
              :label="`${m.realName} (${m.studentId || m.username})`"
              :value="m.userId"
            />
          </el-select>
          <div v-if="!createTaskForm.groupId" style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px">
            请先选择所属小组
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createTaskDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createTaskLoading" @click="handleCreateTask">
          创建
        </el-button>
      </template>
    </el-dialog>

    <!-- 任务详情弹窗 -->
    <el-dialog v-model="taskDetailDialogVisible" title="任务详情" width="620px">
      <div v-loading="taskDetailLoading">
        <template v-if="taskStore.currentTask">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="编码">{{ taskStore.currentTask.taskCode }}</el-descriptions-item>
            <el-descriptions-item label="标题">{{ taskStore.currentTask.taskTitle }}</el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">
              {{ taskStore.currentTask.taskDescription || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="优先级">
              <el-tag :type="TaskPriorityType[taskStore.currentTask.priority]" size="small">
                {{ TaskPriorityLabel[taskStore.currentTask.priority] }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="TaskStatusType[taskStore.currentTask.status]" size="small">
                {{ TaskStatusLabel[taskStore.currentTask.status] }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ taskStore.currentTask.startTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="截止时间">{{ taskStore.currentTask.endTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="预估工时">{{ taskStore.currentTask.estimatedHours }}h</el-descriptions-item>
            <el-descriptions-item label="标签">
              <el-tag
                v-for="tag in (taskStore.currentTask.tags || [])"
                :key="tag"
                size="small"
                effect="plain"
                style="margin-right: 4px"
              >{{ tag }}</el-tag>
              <span v-if="!(taskStore.currentTask.tags || []).length">-</span>
            </el-descriptions-item>
          </el-descriptions>

          <!-- 指派人列表 -->
          <div class="detail-section-title">指派人</div>
          <el-table
            v-if="taskStore.currentTask.assignments?.length"
            :data="taskStore.currentTask.assignments"
            size="small"
            stripe
          >
            <el-table-column label="姓名" prop="realName" />
            <el-table-column label="用户名" prop="username" />
            <el-table-column label="状态">
              <template #default="{ row }">
                <el-tag :type="TaskStatusType[row.status]" size="small">
                  {{ TaskStatusLabel[row.status] }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="进度">
              <template #default="{ row }">
                <el-progress :percentage="row.progress" :stroke-width="6" style="width: 100px" />
              </template>
            </el-table-column>
            <el-table-column label="实际工时" prop="actualHours">
              <template #default="{ row }">{{ row.actualHours }}h</template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无指派人" :image-size="40" />

          <!-- 依赖管理 -->
          <div class="detail-section-title">
            任务依赖
          </div>
          <div v-if="taskStore.currentTask.dependOnTaskIds?.length" class="dep-list">
            <el-tag
              v-for="depId in taskStore.currentTask.dependOnTaskIds"
              :key="depId"
              closable
              @close="handleRemoveDependency(taskStore.currentTask.taskId)"
              style="margin-right: 6px; margin-bottom: 6px"
            >
              {{ getTaskCodeById(depId) }}
            </el-tag>
          </div>
          <div v-else style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 8px">
            无依赖
          </div>
          <div class="dep-add-row" v-if="taskStore.currentTask">
            <el-input
              v-model="depInput"
              size="small"
              placeholder="输入任务编码（如 TASK001）"
              style="width: 200px"
              @keyup.enter="() => { depTaskId = taskStore.currentTask.taskId; handleAddDependency() }"
            />
            <el-button
              size="small"
              type="primary"
              :loading="depLoading"
              @click="() => { depTaskId = taskStore.currentTask.taskId; handleAddDependency() }"
            >
              添加依赖
            </el-button>
          </div>

          <!-- 子任务 -->
          <div v-if="taskStore.currentTask.subTasks?.length">
            <div class="detail-section-title">子任务</div>
            <el-tag
              v-for="sub in taskStore.currentTask.subTasks"
              :key="sub.taskId"
              style="margin-right: 6px"
              size="small"
            >
              {{ sub.taskCode }} - {{ sub.taskTitle }}
            </el-tag>
          </div>
        </template>
      </div>
    </el-dialog>

    <!-- 分配任务弹窗 -->
    <el-dialog v-model="assignDialogVisible" title="分配任务" width="420px">
      <p style="margin-bottom: 12px; font-size: 14px; color: var(--color-text-regular)">
        选择要分配的小组成员（可多选，用逗号分隔用户ID）
      </p>
      <el-select
        v-model="assignUserIds"
        placeholder="选择成员"
        style="width: 100%"
      >
        <el-option
          v-for="m in projectStore.projectMembers.filter(m => m.roleInProject !== 'OWNER')"
          :key="m.userId"
          :label="`${m.realName} (${m.studentId || m.username})`"
          :value="m.userId"
        />
      </el-select>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="assignLoading" @click="handleAssignTask">分配</el-button>
      </template>
    </el-dialog>

    <!-- 更新任务状态弹窗 -->
    <el-dialog v-model="statusDialogVisible" title="更新任务状态" width="420px">
      <el-form :model="statusForm" label-width="80px">
        <el-form-item label="状态">
          <el-select v-model="statusForm.status">
            <el-option :value="0" label="待处理" />
            <el-option :value="1" label="进行中" />
            <el-option :value="2" label="已完成" />
          </el-select>
        </el-form-item>
        <el-form-item label="进度">
          <el-slider v-model="statusForm.progress" :max="100" show-input />
        </el-form-item>
        <el-form-item label="实际工时">
          <el-input-number v-model="statusForm.actualHours" :min="0" :precision="1" />
          <span style="margin-left: 8px">小时</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="statusLoading" @click="handleUpdateStatus">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.detail-header {
  margin-bottom: 20px;
}

.project-title {
  font-size: 20px;
  font-weight: 600;
  margin-top: 8px;
  display: flex;
  align-items: center;
}

.groups-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.my-group-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.group-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.settings-section {
  margin-bottom: 32px;
}

.settings-section h3 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
}

.danger-zone {
  border: 1px solid var(--el-color-danger-light-5);
  border-radius: 8px;
  padding: 20px;
}

.danger-desc {
  font-size: 13px;
  color: var(--color-text-regular);
  margin-bottom: 12px;
}

.tasks-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--color-text-regular);
}

.task-tag {
  margin-right: 4px;
}

.task-title-link {
  color: var(--color-primary);
  cursor: pointer;
}

.task-title-link:hover {
  text-decoration: underline;
}

.text-muted {
  color: var(--color-text-secondary);
  font-size: 13px;
}

.tag-input-area {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.detail-section-title {
  font-size: 14px;
  font-weight: 500;
  margin: 16px 0 8px;
}

.dep-list {
  margin-bottom: 8px;
}

.dep-add-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
