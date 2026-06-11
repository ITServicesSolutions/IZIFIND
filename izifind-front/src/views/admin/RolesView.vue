<template>
  <main class="admin-content">
    <div class="page-header page-header--left">
      <p class="page-subtitle">Administration / RBAC</p>
      <h2>Roles et permissions</h2>
      <p class="page-subtitle">Controlez les acces d'administration exposes par le backend RBAC.</p>
    </div>

    <div v-if="!authStore.isAdmin" class="notice danger">
      Votre compte doit posseder le role admin pour modifier le RBAC.
    </div>

    <section class="glass-card">
      <!-- Tabs -->
      <div class="admin-tabs">
        <button
          :class="['admin-tab', { 'admin-tab--active': activeTab === 'roles' }]"
          @click="activeTab = 'roles'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Rôles
        </button>
        <button
          :class="['admin-tab', { 'admin-tab--active': activeTab === 'permissions' }]"
          @click="activeTab = 'permissions'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Permissions
        </button>
      </div>

      <!-- Roles Tab Content -->
      <div v-if="activeTab === 'roles'" class="admin-tab-content">
        <div class="admin-table-toolbar">
          <div class="chip-row">
            <span class="table-chip">{{ roles.length }} rôles</span>
          </div>
          <button class="btn btn-primary" type="button" @click="openRoleModal()" :disabled="!authStore.isAdmin">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Nouveau rôle
          </button>
        </div>
        <div class="admin-table-wrap" style="max-height: 500px; overflow-y: auto;">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Description</th>
                <th>Permissions</th>
                <th style="width: 150px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="role in roles" :key="role.id">
                <td><strong>{{ role.name }}</strong></td>
                <td>{{ role.description || '—' }}</td>
                <td>
                  <div class="permission-chips">
                    <span
                      v-for="perm in role.permissions.slice(0, 3)"
                      :key="perm.id"
                      class="table-chip"
                    >
                      {{ perm.name }}
                    </span>
                    <span v-if="role.permissions.length > 3" class="table-chip">
                      +{{ role.permissions.length - 3 }}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="admin-table-actions">
                    <button
                      class="admin-action-btn"
                      type="button"
                      @click="openRoleModal(role)"
                      :disabled="!authStore.isAdmin"
                      title="Modifier"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      class="admin-action-btn admin-action-btn--danger"
                      type="button"
                      @click="askDeleteRole(role)"
                      :disabled="!authStore.isAdmin"
                      title="Supprimer"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Permissions Tab Content -->
      <div v-if="activeTab === 'permissions'" class="admin-tab-content">
        <div class="admin-table-toolbar">
          <div class="chip-row">
            <span class="table-chip">{{ permissions.length }} permissions</span>
          </div>
          <button class="btn btn-primary" type="button" @click="openPermissionModal()" :disabled="!authStore.isAdmin">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Nouvelle permission
          </button>
        </div>
        <div class="admin-table-wrap" style="max-height: 500px; overflow-y: auto;">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Description</th>
                <th style="width: 150px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="permission in permissions" :key="permission.id">
                <td><strong>{{ permission.name }}</strong></td>
                <td>{{ permission.description || '—' }}</td>
                <td>
                  <div class="admin-table-actions">
                    <button
                      class="admin-action-btn"
                      type="button"
                      @click="openPermissionModal(permission)"
                      :disabled="!authStore.isAdmin"
                      title="Modifier"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      class="admin-action-btn admin-action-btn--danger"
                      type="button"
                      @click="askDeletePermission(permission)"
                      :disabled="!authStore.isAdmin"
                      title="Supprimer"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Role Modal -->
    <AdminModal
      :open="isRoleModalOpen"
      :title="editingRole ? 'Modifier le rôle' : 'Nouveau rôle'"
      @close="closeRoleModal"
    >
      <form @submit.prevent="editingRole ? updateRole() : submitRole()">
        <div class="form-group">
          <label class="form-label">Nom</label>
          <input v-model="roleForm.name" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea v-model="roleForm.description" class="form-control" rows="2"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Permissions</label>
          <div class="permission-box">
            <label v-for="permission in permissions" :key="permission.id">
              <input v-model="roleForm.permission_ids" type="checkbox" :value="permission.id" />
              {{ permission.name }}
            </label>
          </div>
        </div>
        <div class="btn-group">
          <button class="btn btn-secondary" type="button" @click="closeRoleModal">Annuler</button>
          <button class="btn btn-primary" type="submit" :disabled="savingRole">
            {{ savingRole ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
        <p v-if="roleError" class="inline-error">{{ roleError }}</p>
      </form>
    </AdminModal>

    <!-- Permission Modal -->
    <AdminModal
      :open="isPermissionModalOpen"
      :title="editingPermission ? 'Modifier la permission' : 'Nouvelle permission'"
      @close="closePermissionModal"
    >
      <form @submit.prevent="editingPermission ? updatePermission() : submitPermission()">
        <div class="form-group">
          <label class="form-label">Nom</label>
          <input v-model="permissionForm.name" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea v-model="permissionForm.description" class="form-control" rows="2"></textarea>
        </div>
        <div class="btn-group">
          <button class="btn btn-secondary" type="button" @click="closePermissionModal">Annuler</button>
          <button class="btn btn-primary" type="submit" :disabled="savingPermission">
            {{ savingPermission ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
        <p v-if="permissionError" class="inline-error">{{ permissionError }}</p>
      </form>
    </AdminModal>

    <!-- Delete Swals -->
    <AdminSwal
      :open="!!deleteRoleTarget"
      title="Supprimer ce rôle ?"
      :message="`Êtes-vous sûr de vouloir supprimer le rôle '${deleteRoleTarget?.name}' ?`"
      confirm-label="Supprimer"
      @cancel="deleteRoleTarget = null"
      @confirm="confirmDeleteRole"
    />

    <AdminSwal
      :open="!!deletePermissionTarget"
      title="Supprimer cette permission ?"
      :message="`Êtes-vous sûr de vouloir supprimer la permission '${deletePermissionTarget?.name}' ?`"
      confirm-label="Supprimer"
      @cancel="deletePermissionTarget = null"
      @confirm="confirmDeletePermission"
    />
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '../../services/api'
import AdminModal from '../../components/admin/AdminModal.vue'
import AdminSwal from '../../components/admin/AdminSwal.vue'
import type { Permission, Role } from '../../services/types'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const roles = ref<Role[]>([])
const permissions = ref<Permission[]>([])
const activeTab = ref<'roles' | 'permissions'>('roles')

// Modals state
const isRoleModalOpen = ref(false)
const isPermissionModalOpen = ref(false)
const deleteRoleTarget = ref<Role | null>(null)
const deletePermissionTarget = ref<Permission | null>(null)

// Forms state
const savingRole = ref(false)
const savingPermission = ref(false)
const roleError = ref('')
const permissionError = ref('')
const roleForm = ref({ name: '', description: '', permission_ids: [] as number[] })
const permissionForm = ref({ name: '', description: '' })
const editingRole = ref<Role | null>(null)
const editingPermission = ref<Permission | null>(null)

const loadRbac = async () => {
  if (!authStore.isAdmin) return
  const [rolesResponse, permissionsResponse] = await Promise.all([
    api.get<Role[]>('/rbac/roles'),
    api.get<Permission[]>('/rbac/permissions'),
  ])
  roles.value = rolesResponse.data
  permissions.value = permissionsResponse.data
}

// Role actions
const openRoleModal = (role?: Role) => {
  if (role) {
    editingRole.value = role
    roleForm.value = {
      name: role.name,
      description: role.description || '',
      permission_ids: role.permissions.map(p => p.id)
    }
  } else {
    editingRole.value = null
    roleForm.value = { name: '', description: '', permission_ids: [] }
  }
  roleError.value = ''
  isRoleModalOpen.value = true
}

const closeRoleModal = () => {
  isRoleModalOpen.value = false
}

const submitRole = async () => {
  roleError.value = ''
  savingRole.value = true
  try {
    const { data } = await api.post<Role>('/rbac/roles', roleForm.value)
    roles.value = [data, ...roles.value]
    closeRoleModal()
  } catch (err: any) {
    roleError.value = err.response?.data?.detail || 'Creation impossible.'
  } finally {
    savingRole.value = false
  }
}

const updateRole = async () => {
  if (!editingRole.value) return
  roleError.value = ''
  savingRole.value = true
  try {
    const { data } = await api.put<Role>(`/rbac/roles/${editingRole.value.id}`, roleForm.value)
    roles.value = roles.value.map(r => r.id === data.id ? data : r)
    closeRoleModal()
  } catch (err: any) {
    roleError.value = err.response?.data?.detail || 'Mise à jour impossible.'
  } finally {
    savingRole.value = false
  }
}

const askDeleteRole = (role: Role) => {
  deleteRoleTarget.value = role
}

const confirmDeleteRole = async () => {
  if (!deleteRoleTarget.value) return
  try {
    await api.delete(`/rbac/roles/${deleteRoleTarget.value.id}`)
    roles.value = roles.value.filter(r => r.id !== deleteRoleTarget.value!.id)
    deleteRoleTarget.value = null
  } catch (err: any) {
    alert(err.response?.data?.detail || 'Suppression impossible.')
  }
}

// Permission actions
const openPermissionModal = (permission?: Permission) => {
  if (permission) {
    editingPermission.value = permission
    permissionForm.value = {
      name: permission.name,
      description: permission.description || ''
    }
  } else {
    editingPermission.value = null
    permissionForm.value = { name: '', description: '' }
  }
  permissionError.value = ''
  isPermissionModalOpen.value = true
}

const closePermissionModal = () => {
  isPermissionModalOpen.value = false
}

const submitPermission = async () => {
  permissionError.value = ''
  savingPermission.value = true
  try {
    const { data } = await api.post<Permission>('/rbac/permissions', permissionForm.value)
    permissions.value = [data, ...permissions.value]
    closePermissionModal()
  } catch (err: any) {
    permissionError.value = err.response?.data?.detail || 'Creation impossible.'
  } finally {
    savingPermission.value = false
  }
}

const updatePermission = async () => {
  if (!editingPermission.value) return
  permissionError.value = ''
  savingPermission.value = true
  try {
    const { data } = await api.put<Permission>(`/rbac/permissions/${editingPermission.value.id}`, permissionForm.value)
    permissions.value = permissions.value.map(p => p.id === data.id ? data : p)
    closePermissionModal()
  } catch (err: any) {
    permissionError.value = err.response?.data?.detail || 'Mise à jour impossible.'
  } finally {
    savingPermission.value = false
  }
}

const askDeletePermission = (permission: Permission) => {
  deletePermissionTarget.value = permission
}

const confirmDeletePermission = async () => {
  if (!deletePermissionTarget.value) return
  try {
    await api.delete(`/rbac/permissions/${deletePermissionTarget.value.id}`)
    permissions.value = permissions.value.filter(p => p.id !== deletePermissionTarget.value!.id)
    deletePermissionTarget.value = null
  } catch (err: any) {
    alert(err.response?.data?.detail || 'Suppression impossible.')
  }
}

onMounted(loadRbac)
</script>
<style scoped>
.admin-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid rgba(21, 26, 49, 0.1);
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
}

.admin-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  border-radius: 10px 10px 0 0;
  transition: all 0.2s ease;
}

.admin-tab svg {
  width: 20px;
  height: 20px;
}

.admin-tab:hover {
  background: rgba(244, 149, 23, 0.08);
  color: var(--primary);
}

.admin-tab--active {
  background: rgba(244, 149, 23, 0.12);
  color: var(--primary);
  border-bottom: 2px solid var(--primary);
  margin-bottom: -0.5rem;
}

.admin-tab-content {
  padding: 0;
}

.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary svg, .btn-secondary svg {
  width: 18px;
  height: 18px;
}

.permission-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.admin-action-btn {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  border: 1px solid rgba(21, 26, 49, 0.15);
  background: #ffffff;
  color: #0f172a;
  cursor: pointer;
  transition: all 0.2s ease;
}

.admin-action-btn:hover:not(:disabled) {
  background: rgba(244, 149, 23, 0.1);
  border-color: var(--primary);
  color: var(--primary);
}

.admin-action-btn--danger:hover:not(:disabled) {
  background: rgba(220, 38, 38, 0.1);
  border-color: #dc2626;
  color: #dc2626;
}

.admin-action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.admin-action-btn svg {
  width: 18px;
  height: 18px;
}

.btn-group {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-top: 1rem;
}

.inline-error {
  color: var(--danger);
  margin-top: 0.75rem;
  font-weight: 500;
}
</style>
