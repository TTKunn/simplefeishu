<script setup>
defineProps({
  group: { type: Object, required: true },
  isMyGroup: { type: Boolean, default: false },
  canJoin: { type: Boolean, default: false },
})

defineEmits(['click', 'join'])
</script>

<template>
  <el-card
    class="group-card"
    :class="{ 'is-my-group': isMyGroup }"
    shadow="hover"
    @click="$emit('click', group)"
  >
    <div class="card-header">
      <span class="group-name">{{ group.groupName }}</span>
      <el-tag v-if="isMyGroup" type="success" size="small">我的小组</el-tag>
    </div>
    <div class="card-body">
      <p class="group-desc">{{ group.description || '暂无描述' }}</p>
    </div>
    <div class="card-footer">
      <span class="group-info">
        <span class="group-code">{{ group.groupCode }}</span>
        <span class="member-count">{{ group.currentMembers }}/{{ group.maxMembers }} 人</span>
      </span>
      <el-button
        v-if="canJoin && group.currentMembers < group.maxMembers"
        type="primary"
        size="small"
        @click.stop="$emit('join', group.groupId)"
      >
        加入
      </el-button>
    </div>
  </el-card>
</template>

<style scoped>
.group-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.group-card:hover {
  transform: translateY(-2px);
}

.group-card.is-my-group {
  border-color: var(--el-color-success-light-5);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.group-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.card-body {
  margin-bottom: 12px;
}

.group-desc {
  font-size: 13px;
  color: var(--color-text-regular);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.group-info {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--color-text-secondary);
}
</style>
