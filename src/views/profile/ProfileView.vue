<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useUserStore } from '@/stores/user.js'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const loading = ref(false)

const form = reactive({
  realName: '',
  email: '',
  phone: '',
})

/** @type {import('vue').Ref<import('element-plus').FormInstance | null>} */
const formRef = ref(null)

const rules = {
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }],
}

onMounted(() => {
  if (userStore.userInfo) {
    form.realName = userStore.userInfo.realName || ''
    form.email = userStore.userInfo.email || ''
    form.phone = userStore.userInfo.phone || ''
  }
})

async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await userStore.updateUserInfo({
      realName: form.realName,
      email: form.email,
      phone: form.phone,
    })
    ElMessage.success('信息更新成功')
  } catch {
    //
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="profile-page">
    <h2 class="page-title">个人中心</h2>

    <el-card class="profile-card">
      <div class="profile-header">
        <el-avatar :size="64" class="profile-avatar">
          {{ userStore.userInfo?.realName?.charAt(0) || '?' }}
        </el-avatar>
        <div class="profile-meta">
          <h3>{{ userStore.userInfo?.realName }}</h3>
          <el-tag size="small">
            {{ userStore.isTeacher ? '教师' : '学生' }}
          </el-tag>
        </div>
      </div>

      <el-divider />

      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" style="max-width: 480px">
        <el-form-item label="用户名">
          <el-input :model-value="userStore.userInfo?.username" disabled />
        </el-form-item>
        <el-form-item v-if="userStore.isStudent" label="学号">
          <el-input :model-value="userStore.userInfo?.studentId" disabled />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.page-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
}

.profile-card {
  max-width: 600px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-avatar {
  background-color: var(--color-primary);
  color: #fff;
  font-size: 24px;
}

.profile-meta h3 {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 4px;
}
</style>
