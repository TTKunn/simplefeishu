<script setup>
import { ProjectStatusLabel, ProjectStatusType } from '@/utils/constants.js'

defineProps({
  project: { type: Object, required: true },
})

defineEmits(['click'])
</script>

<template>
  <el-card class="project-card" shadow="hover" @click="$emit('click', project)">
    <div class="card-header">
      <span class="project-name">{{ project.projectName }}</span>
      <el-tag :type="ProjectStatusType[project.status]" size="small">
        {{ ProjectStatusLabel[project.status] }}
      </el-tag>
    </div>
    <div class="card-body">
      <p class="project-desc">{{ project.description || '暂无描述' }}</p>
    </div>
    <div class="card-footer">
      <span class="project-code">{{ project.projectCode }}</span>
    </div>
  </el-card>
</template>

<style scoped>
.project-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.project-card:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.project-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.card-body {
  margin-bottom: 12px;
}

.project-desc {
  font-size: 13px;
  color: var(--color-text-regular);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-footer {
  font-size: 12px;
  color: var(--color-text-secondary);
}
</style>
