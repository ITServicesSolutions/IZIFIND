<template>
  <div class="page-container container">
    <div class="page-header">
      <h2>Roles et permissions</h2>
      <p class="page-subtitle">Controlez les acces d'administration exposes par le backend RBAC.</p>
    </div>

    <div v-if="!authStore.isAdmin" class="notice danger">
      Votre compte doit posseder le role admin pour modifier le RBAC.
    </div>

    <div class="admin-grid">
      <form class="glass-card" @submit.prevent="submitRole">
        <h3>Nouveau role</h3>
        <div class="form-group">
          <label class="form-label">Nom</label>
          <input v-model="roleForm.name" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea v-model="roleForm.description" class="form-control" rows="3"></textarea>
        </div>
        <div class="permission-box">
          <label v-for="permission in permissions" :key="permission.id">
            <input v-model="roleForm.permission_ids" type="checkbox" :value="permission.id" />
            {{ permission.name }}
          </label>
        </div>
        <button class="btn btn-primary" type="submit" :disabled="savingRole || !authStore.isAdmin">
          {{ savingRole ? 'Creation...' : 'Creer le role' }}
        </button>
        <p v-if="roleError" class="inline-error">{{ roleError }}</p>
      </form>

      <form class="glass-card" @submit.prevent="submitPermission">
        <h3>Nouvelle permission</h3>
        <div class="form-group">
          <label class="form-label">Nom</label>
          <input v-model="permissionForm.name" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea v-model="permissionForm.description" class="form-control" rows="3"></textarea>
        </div>
        <button class="btn btn-secondary" type="submit" :disabled="savingPermission || !authStore.isAdmin">
          {{ savingPermission ? 'Creation...' : 'Creer la permission' }}
        </button>
        <p v-if="permissionError" class="inline-error">{{ permissionError }}</p>
      </form>
    </div>

    <div class="object-grid" style="margin-top: 2rem;">
      <article v-for="role in roles" :key="role.id" class="glass-card object-card">
        <h3>{{ role.name }}</h3>
        <p>{{ role.description || 'Sans description' }}</p>
        <div class="chip-row">
          <span v-for="permission in role.permissions" :key="permission.id" class="status-pill found">
            {{ permission.name }}
          </span>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '../../services/api'
import type { Permission, Role } from '../../services/types'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const roles = ref<Role[]>([])
const permissions = ref<Permission[]>([])
const savingRole = ref(false)
const savingPermission = ref(false)
const roleError = ref('')
const permissionError = ref('')
const roleForm = ref({ name: '', description: '', permission_ids: [] as number[] })
const permissionForm = ref({ name: '', description: '' })

const loadRbac = async () => {
  if (!authStore.isAdmin) return
  const [rolesResponse, permissionsResponse] = await Promise.all([
    api.get<Role[]>('/rbac/roles'),
    api.get<Permission[]>('/rbac/permissions'),
  ])
  roles.value = rolesResponse.data
  permissions.value = permissionsResponse.data
}

const submitRole = async () => {
  roleError.value = ''
  savingRole.value = true
  try {
    const { data } = await api.post<Role>('/rbac/roles', roleForm.value)
    roles.value = [data, ...roles.value]
    roleForm.value = { name: '', description: '', permission_ids: [] }
  } catch (err: any) {
    roleError.value = err.response?.data?.detail || 'Creation impossible.'
  } finally {
    savingRole.value = false
  }
}

const submitPermission = async () => {
  permissionError.value = ''
  savingPermission.value = true
  try {
    const { data } = await api.post<Permission>('/rbac/permissions', permissionForm.value)
    permissions.value = [data, ...permissions.value]
    permissionForm.value = { name: '', description: '' }
  } catch (err: any) {
    permissionError.value = err.response?.data?.detail || 'Creation impossible.'
  } finally {
    savingPermission.value = false
  }
}

onMounted(loadRbac)
</script>
