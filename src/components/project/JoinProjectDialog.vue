<script setup>
import { ref } from 'vue'
import { useProjectStore } from '@/stores/project.js'
import { ElMessage } from 'element-plus'

const visible = defineModel('visible', { type: Boolean, default: false })
const projectStore = useProjectStore()
const loading = ref(false)
const projectCode = ref('')

async function handleJoin() {
  if (!projectCode.value.trim()) {
    ElMessage.warning('请输入项目编码')
    return
  }
  loading.value = true
  try {
    await projectStore.joinProject(projectCode.value.trim())
    ElMessage.success('加入项目成功')
    visible.value = false
    projectCode.value = ''
  } catch {
    // 错误已在拦截器中处理
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <el-dialog v-model="visible" title="加入项目" width="420px" @closed="projectCode = ''">
    <p style="margin-bottom: 16px; color: var(--color-text-regular); font-size: 14px">
      请输入教师提供的项目编码
    </p>
    <el-input
      v-model="projectCode"
      placeholder="例如：PRJ20240301ABC"
      size="large"
      @keyup.enter="handleJoin"
    />
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleJoin">加入</el-button>
    </template>
  </el-dialog>
</template>
