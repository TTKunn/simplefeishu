<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.js'
import { useProjectStore } from '@/stores/project.js'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import ProjectCard from '@/components/project/ProjectCard.vue'
import JoinProjectDialog from '@/components/project/JoinProjectDialog.vue'

const router = useRouter()
const userStore = useUserStore()
const projectStore = useProjectStore()

const joinDialogVisible = ref(false)
const createDialogVisible = ref(false)
const createLoading = ref(false)

const createForm = reactive({
  projectName: '',
  description: '',
  maxGroupSize: 6,
  minGroupSize: 3,
  allowStudentCreateGroup: 1,
})

/** @type {import('vue').Ref<import('element-plus').FormInstance | null>} */
const createFormRef = ref(null)

const createRules = {
  projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
}

function handleProjectClick(project) {
  router.push(`/project/${project.projectId}`)
}

async function handleCreateProject() {
  const valid = await createFormRef.value?.validate().catch(() => false)
  if (!valid) return

  createLoading.value = true
  try {
    await projectStore.createProject({ ...createForm })
    ElMessage.success('项目创建成功')
    createDialogVisible.value = false
    Object.assign(createForm, {
      projectName: '',
      description: '',
      maxGroupSize: 6,
      minGroupSize: 3,
      allowStudentCreateGroup: 1,
    })
  } catch {
    // 错误已在拦截器中处理
  } finally {
    createLoading.value = false
  }
}
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2 class="page-title">我的项目</h2>
      <div class="header-actions">
        <el-button v-if="userStore.isStudent" type="primary" @click="joinDialogVisible = true">
          加入项目
        </el-button>
        <el-button
          v-if="userStore.isTeacher"
          type="primary"
          :icon="Plus"
          @click="createDialogVisible = true"
        >
          创建项目
        </el-button>
      </div>
    </div>

    <div v-if="projectStore.myProjects.length" class="project-grid">
      <ProjectCard
        v-for="project in projectStore.myProjects"
        :key="project.projectId"
        :project="project"
        @click="handleProjectClick"
      />
    </div>

    <el-empty v-else description="暂无项目">
      <el-button v-if="userStore.isStudent" type="primary" @click="joinDialogVisible = true">
        加入项目
      </el-button>
      <el-button
        v-if="userStore.isTeacher"
        type="primary"
        @click="createDialogVisible = true"
      >
        创建项目
      </el-button>
    </el-empty>

    <!-- 学生加入项目弹窗 -->
    <JoinProjectDialog v-model:visible="joinDialogVisible" />

    <!-- 教师创建项目弹窗 -->
    <el-dialog v-model="createDialogVisible" title="创建项目" width="500px">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="120px">
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="createForm.projectName" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入项目描述"
          />
        </el-form-item>
        <el-form-item label="小组人数范围">
          <div style="display: flex; align-items: center; gap: 8px">
            <el-input-number v-model="createForm.minGroupSize" :min="1" :max="20" />
            <span>至</span>
            <el-input-number v-model="createForm.maxGroupSize" :min="1" :max="20" />
            <span>人</span>
          </div>
        </el-form-item>
        <el-form-item label="学生创建小组">
          <el-switch
            v-model="createForm.allowStudentCreateGroup"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" @click="handleCreateProject">
          创建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}
</style>
