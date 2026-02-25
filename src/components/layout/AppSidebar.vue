<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.js'
import { useProjectStore } from '@/stores/project.js'
import { HomeFilled, User, FolderOpened } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const projectStore = useProjectStore()

const activeMenu = computed(() => route.path)

function handleMenuSelect(index) {
  router.push(index)
}
</script>

<template>
  <aside class="app-sidebar">
    <div class="sidebar-logo" @click="router.push('/')">
      <span class="logo-text">SimpleFeishu</span>
    </div>
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      :collapse="false"
      @select="handleMenuSelect"
    >
      <el-menu-item index="/">
        <el-icon><HomeFilled /></el-icon>
        <span>工作台</span>
      </el-menu-item>

      <el-sub-menu index="projects" v-if="projectStore.myProjects.length">
        <template #title>
          <el-icon><FolderOpened /></el-icon>
          <span>我的项目</span>
        </template>
        <el-menu-item
          v-for="p in projectStore.myProjects"
          :key="p.projectId"
          :index="`/project/${p.projectId}`"
        >
          {{ p.projectName }}
        </el-menu-item>
      </el-sub-menu>

      <el-menu-item index="/profile">
        <el-icon><User /></el-icon>
        <span>个人中心</span>
      </el-menu-item>
    </el-menu>
  </aside>
</template>

<style scoped>
.app-sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background: #fff;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
}

.sidebar-logo {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary);
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;
}
</style>
