<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user.js'
import { useProjectStore } from '@/stores/project.js'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'

const userStore = useUserStore()
const projectStore = useProjectStore()

onMounted(async () => {
  if (userStore.isLoggedIn && !userStore.userInfo) {
    await userStore.fetchUserInfo()
  }
  await projectStore.fetchMyProjects()
})
</script>

<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="layout-main">
      <AppHeader />
      <main class="layout-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
}

.layout-main {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
}

.layout-content {
  flex: 1;
  padding: 24px;
  background: var(--color-bg-page);
}
</style>
