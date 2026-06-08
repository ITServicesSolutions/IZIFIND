<template>
  <div class="auth-page">
    <div class="auth-card">
      <RouterLink to="/" class="auth-logo">
        <img :src="logoUrl" alt="IZIFIND" />
      </RouterLink>
      <h2>Connexion</h2>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">Nom d'utilisateur</label>
          <input type="text" v-model="username" class="form-control" required />
        </div>

        <div class="form-group">
          <label class="form-label">Mot de passe</label>
          <div class="password-wrapper">
            <input :type="showPassword ? 'text' : 'password'" v-model="password" class="form-control" required />
            <button type="button" class="password-toggle" @click="showPassword = !showPassword" aria-label="Afficher/Masquer le mot de passe">
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="error" class="auth-error">
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary auth-submit" :disabled="loading">
          {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
        </button>
      </form>

      <div class="auth-switch">
        <span>Pas encore de compte ? </span>
        <RouterLink to="/register">S'inscrire</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import logoUrl from '../../assets/images/logo.png'
import { useAuthStore } from '../../stores/auth'

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)

const authStore = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    await authStore.login(username.value, password.value)
    router.push(authStore.isAdmin ? '/admin/dashboard' : '/profile')
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Identifiants incorrects'
  } finally {
    loading.value = false
  }
}
</script>
