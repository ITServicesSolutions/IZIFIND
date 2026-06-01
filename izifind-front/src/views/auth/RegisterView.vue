<template>
  <div class="auth-page">
    <div class="auth-card">
      <RouterLink to="/" class="auth-logo">
        <img :src="logoUrl" alt="IZIFIND" />
      </RouterLink>
      <h2>Inscription</h2>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label">Nom d'utilisateur</label>
          <input type="text" v-model="form.username" class="form-control" required />
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" v-model="form.email" class="form-control" required />
        </div>

        <div class="form-group">
          <label class="form-label">Mot de passe</label>
          <input type="password" v-model="form.password" class="form-control" required />
        </div>

        <div v-if="error" class="auth-error">
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary auth-submit" :disabled="loading">
          {{ loading ? 'Creation en cours...' : 'Creer un compte' }}
        </button>
      </form>

      <div class="auth-switch">
        <span>Deja un compte ? </span>
        <RouterLink to="/login">Se connecter</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import logoUrl from '../../assets/legacy/img/logo.png'
import { useAuthStore } from '../../stores/auth'

const form = ref({
  username: '',
  email: '',
  password: '',
})
const error = ref('')
const loading = ref(false)

const authStore = useAuthStore()
const router = useRouter()

const handleRegister = async () => {
  error.value = ''
  loading.value = true

  try {
    await authStore.register(form.value)
    await authStore.login(form.value.username, form.value.password)
    router.push(authStore.isAdmin ? '/admin/dashboard' : '/profile')
  } catch (err: any) {
    error.value = err.response?.data?.detail || "Erreur lors de l'inscription"
  } finally {
    loading.value = false
  }
}
</script>
