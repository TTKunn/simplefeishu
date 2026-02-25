<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.js'
import { ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

function handleCommand(command) {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <slot name="title" />
    </div>
    <div class="header-right">
      <el-dropdown @command="handleCommand">
        <span class="user-dropdown">
          <el-avatar :size="32" class="user-avatar">
            {{ userStore.userInfo?.realName?.charAt(0) || '?' }}
          </el-avatar>
          <span class="user-name">{{ userStore.userInfo?.realName || '用户' }}</span>
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item disabled>
              {{ userStore.isTeacher ? '教师' : '学生' }} · {{ userStore.userInfo?.username }}
            </el-dropdown-item>
            <el-dropdown-item divided command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-left {
  font-size: 16px;
  font-weight: 500;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--color-text-primary);
}

.user-avatar {
  background-color: var(--color-primary);
  color: #fff;
  font-size: 14px;
}

.user-name {
  font-size: 14px;
}
</style>
