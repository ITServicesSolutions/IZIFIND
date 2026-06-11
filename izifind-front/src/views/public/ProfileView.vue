<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'
import AdminModal from '../../components/admin/AdminModal.vue'
import AdminSwal from '../../components/admin/AdminSwal.vue'

const authStore = useAuthStore()
const userRoles = computed(() => authStore.user?.roles?.map((role) => role.name).join(', ') || 'Aucun rôle')

// Edit Profile
const isEditModalOpen = ref(false)
const editingProfile = ref({
  username: '',
  email: '',
  commissariat_id: null as number | null
})
const savingProfile = ref(false)
const profileError = ref('')

// Change Password
const isPasswordModalOpen = ref(false)
const passwordForm = ref({
  old_password: '',
  new_password: ''
})
const savingPassword = ref(false)
const passwordError = ref('')

// Confirmation
const showSuccess = ref(false)

const openEditModal = () => {
  editingProfile.value = {
    username: authStore.user?.username || '',
    email: authStore.user?.email || '',
    commissariat_id: authStore.user?.commissariat?.id || null
  }
  profileError.value = ''
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
}

const saveProfile = async () => {
  profileError.value = ''
  savingProfile.value = true
  try {
    await api.put('/auth/me', editingProfile.value)
    await authStore.fetchUser()
    closeEditModal()
    showSuccess.value = true
  } catch (err: any) {
    profileError.value = err.response?.data?.detail || 'Erreur lors de la mise à jour du profil'
  } finally {
    savingProfile.value = false
  }
}

const openPasswordModal = () => {
  passwordForm.value = {
    old_password: '',
    new_password: ''
  }
  passwordError.value = ''
  isPasswordModalOpen.value = true
}

const closePasswordModal = () => {
  isPasswordModalOpen.value = false
}

const changePassword = async () => {
  passwordError.value = ''
  if (!passwordForm.value.old_password || !passwordForm.value.new_password) {
    passwordError.value = 'Veuillez remplir tous les champs'
    return
  }
  savingPassword.value = true
  try {
    await api.put('/auth/change-password', passwordForm.value)
    closePasswordModal()
    showSuccess.value = true
  } catch (err: any) {
    passwordError.value = err.response?.data?.detail || 'Erreur lors du changement de mot de passe'
  } finally {
    savingPassword.value = false
  }
}

onMounted(() => {
  if (authStore.user) {
    editingProfile.value = {
      username: authStore.user.username,
      email: authStore.user.email,
      commissariat_id: authStore.user.commissariat?.id || null
    }
  }
})
</script>

<template>
  <main class="page-container container">
    <div class="page-header">
      <h2>Profil</h2>
      <p class="page-subtitle">Retrouvez les informations liées à votre compte IZIFIND.</p>
    </div>

    <div class="admin-grid">
      <section class="glass-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h3>Informations du compte</h3>
          <button class="btn btn-primary" type="button" @click="openEditModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Modifier
          </button>
        </div>
        <ul class="data-list">
          <li>
            <strong>Nom d'utilisateur</strong>
            <span>{{ authStore.user?.username }}</span>
          </li>
          <li>
            <strong>Email</strong>
            <span>{{ authStore.user?.email }}</span>
          </li>
          <li v-if="authStore.user?.commissariat">
            <strong>Commissariat</strong>
            <span>{{ authStore.user?.commissariat?.name }}</span>
          </li>
          <li>
            <strong>Rôles</strong>
            <span>{{ userRoles }}</span>
          </li>
        </ul>
      </section>

      <section class="glass-card">
        <h3>Sécurité</h3>
        <button class="btn btn-secondary" type="button" style="width: 100%;" @click="openPasswordModal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Changer le mot de passe
        </button>
      </section>

      <section class="glass-card" style="grid-column: 1/-1;">
        <h3>Accès rapides</h3>
        <div class="chip-row">
          <RouterLink v-if="authStore.isAdmin" to="/admin/dashboard" class="admin-outline-btn">
            Administration
          </RouterLink>
          <RouterLink v-else to="/lost" class="admin-outline-btn">
            Déclarer un objet perdu
          </RouterLink>
          <RouterLink to="/catalog" class="admin-outline-btn">
            Consulter le catalogue
          </RouterLink>
        </div>
      </section>
    </div>

    <!-- Edit Profile Modal -->
    <AdminModal
      :open="isEditModalOpen"
      title="Modifier le profil"
      @close="closeEditModal"
    >
      <form @submit.prevent="saveProfile">
        <div class="form-group">
          <label class="form-label">Nom d'utilisateur</label>
          <input v-model="editingProfile.username" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input v-model="editingProfile.email" type="email" class="form-control" required />
        </div>
        <div class="btn-group" style="justify-content: flex-end;">
          <button class="btn btn-secondary" type="button" @click="closeEditModal">Annuler</button>
          <button class="btn btn-primary" type="submit" :disabled="savingProfile">
            {{ savingProfile ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
        <p v-if="profileError" class="inline-error">{{ profileError }}</p>
      </form>
    </AdminModal>

    <!-- Change Password Modal -->
    <AdminModal
      :open="isPasswordModalOpen"
      title="Changer le mot de passe"
      @close="closePasswordModal"
    >
      <form @submit.prevent="changePassword">
        <div class="form-group">
          <label class="form-label">Mot de passe actuel</label>
          <input v-model="passwordForm.old_password" type="password" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">Nouveau mot de passe</label>
          <input v-model="passwordForm.new_password" type="password" class="form-control" minlength="8" required />
        </div>
        <div class="btn-group" style="justify-content: flex-end;">
          <button class="btn btn-secondary" type="button" @click="closePasswordModal">Annuler</button>
          <button class="btn btn-primary" type="submit" :disabled="savingPassword">
            {{ savingPassword ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
        <p v-if="passwordError" class="inline-error">{{ passwordError }}</p>
      </form>
    </AdminModal>

    <AdminSwal
      :open="showSuccess"
      title="Succès !"
      message="Vos modifications ont été enregistrées."
      confirm-label="OK"
      @confirm="showSuccess = false"
    />
  </main>
</template>

<style scoped>
.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary svg, .btn-secondary svg {
  width: 18px;
  height: 18px;
}

.btn-group {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.inline-error {
  color: var(--danger);
  margin-top: 0.75rem;
  font-weight: 500;
}
</style>
