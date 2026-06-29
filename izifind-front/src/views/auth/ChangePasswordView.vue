<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'

const router = useRouter()

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const handleSubmit = async () => {
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    error.value = 'Veuillez remplir tous les champs.'
    success.value = ''
    return
  }

  if (newPassword.value.length < 6) {
    error.value = 'Le nouveau mot de passe doit contenir au moins 6 caractères.'
    success.value = ''
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Les nouveaux mots de passe ne correspondent pas.'
    success.value = ''
    return
  }

  if (oldPassword.value === newPassword.value) {
    error.value = 'Le nouveau mot de passe doit être différent de l\'ancien.'
    success.value = ''
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''
  try {
    await api.post('/auth/change-password', { old_password: oldPassword.value, new_password: newPassword.value })
    success.value = 'Votre mot de passe a été changé avec succès.'
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    setTimeout(() => router.push('/profile'), 1500)
  } catch (err: any) {
    error.value = err?.response?.data?.detail || 'Impossible de changer le mot de passe.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1>Sécurité du compte</h1>
          <p class="auth-subtitle">Choisissez un mot de passe fort et unique</p>
        </div>

        <div v-if="success" class="alert alert-success">{{ success }}</div>
        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label" for="old-password">Ancien mot de passe</label>
            <input
              id="old-password"
            type="password"
            class="form-control"
            v-model="oldPassword"
            placeholder="••••••••"
            required
          />
          </div>
          <div class="form-group">
            <label class="form-label" for="new-password">Nouveau mot de passe</label>
            <input
              id="new-password"
            type="password"
            class="form-control"
            v-model="newPassword"
            placeholder="••••••••"
            required
          />
          </div>
          <div class="form-group">
            <label class="form-label" for="confirm-password">Confirmer le nouveau mot de passe</label>
            <input
              id="confirm-password"
            type="password"
            class="form-control"
            v-model="confirmPassword"
            placeholder="••••••••"
            required
          />
          </div>

          <div class="btn-group">
            <button type="button" class="btn btn-secondary" @click="router.push('/profile')">
              Annuler
            </button>
            <button class="btn btn-primary" type="submit" :disabled="loading">
              {{ loading ? 'Changement en cours...' : 'Changer le mot de passe' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg);
  padding: 2rem;
}

.auth-wrapper {
  width: 100%;
  max-width: 420px;
}

.auth-card {
  background: var(--color-surface);
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 10px 40px rgba(21, 26, 49, 0.06);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(244, 149, 23, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: var(--color-primary);
}

.auth-icon-circle svg {
  width: 24px;
  height: 24px;
}

.auth-subtitle {
  color: var(--color-text-muted);
  margin: 0.5rem 0 0;
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-text);
  font-weight: 600;
}

.form-control {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
}

.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.alert-success {
  background-color: rgba(11, 184, 146, 0.1);
  color: var(--color-primary);
}

.alert-danger {
  background-color: rgba(255, 107, 107, 0.1);
  color: var(--color-lost);
}

.btn-group {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn {
  flex: 1;
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(244, 149, 23, 0.25);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-bg-alt);
  color: var(--color-text);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-border);
}
</style>