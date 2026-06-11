<template>
  <div class="auth-page">
    <div class="auth-panel-left">
      <div class="panel-overlay"></div>
      <div class="panel-content">
        <RouterLink to="/" class="panel-logo">
          <img :src="logoUrl" alt="IZIFIND" />
        </RouterLink>
        <h1>Récupérez votre compte</h1>
        <p>Entrez votre email pour recevoir un lien de réinitialisation de mot de passe.</p>
      </div>
    </div>

    <div class="auth-panel-right">
      <div class="auth-card">
        <div class="auth-card-header">
          <RouterLink to="/" class="mobile-logo">
            <img :src="logoUrl" alt="IZIFIND" />
          </RouterLink>
          <h2>Mot de passe oublié</h2>
          <p class="auth-subtitle">Entrez votre email pour recevoir un lien de réinitialisation</p>
        </div>

        <form @submit.prevent="handleForgotPassword" class="auth-form">
          <div class="form-group">
            <label class="form-label" for="forgot-email">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              v-model="email"
              class="form-control"
              placeholder="Entrez votre email"
              required
              autocomplete="email"
            />
          </div>

          <transition name="shake">
            <div v-if="error" class="auth-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {{ error }}
            </div>
          </transition>

          <div v-if="success" class="auth-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {{ success }}
          </div>

          <button type="submit" class="btn-submit" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>Envoyer le lien de réinitialisation</span>
          </button>
        </form>

        <div class="auth-divider">
          <span>ou</span>
        </div>

        <div class="auth-switch">
          <span>Vous vous souvenez de votre mot de passe ?</span>
          <RouterLink to="/login" class="switch-link">Se connecter</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import logoUrl from '../../assets/images/logo.png'
import api from '../../services/api'

const email = ref('')
const error = ref('')
const loading = ref(false)
const success = ref('')

const handleForgotPassword = async () => {
  error.value = ''
  success.value = ''
  loading.value = true

  try {
    const params = new URLSearchParams()
    params.append('email', email.value)
    await api.post('/auth/forgot-password?' + params.toString())
    success.value = 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.'
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Erreur lors de l\'envoi du lien de réinitialisation'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  min-height: 100vh;
  background-color: #faf9f6;
}

.auth-panel-left {
  flex: 0 0 46%;
  position: relative;
  background: linear-gradient(160deg, #151a31 0%, #1e254a 40%, #f49517 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.panel-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(244, 149, 23, 0.25) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.06) 0%, transparent 40%);
  pointer-events: none;
}

.panel-content {
  position: relative;
  z-index: 2;
  color: #ffffff;
  max-width: 420px;
}

.panel-logo img {
  height: 52px;
  filter: brightness(0) invert(1);
  margin-bottom: 2.5rem;
}

.panel-content h1 {
  font-family: 'Poppins', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
  color: #ffffff;
}

.panel-content > p {
  font-size: 1.05rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.8);
}

.auth-panel-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
}

.auth-card {
  width: 100%;
  max-width: 440px;
  animation: fadeSlideUp 0.5s ease;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-card-header {
  margin-bottom: 2rem;
}

.mobile-logo {
  display: none;
}

.mobile-logo img {
  height: 44px;
  margin-bottom: 1.5rem;
}

.auth-card-header h2 {
  font-family: 'Poppins', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #151a31;
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  margin-bottom: 0;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: #151a31;
  margin-bottom: 0.6rem;
}

.form-label svg {
  width: 16px;
  height: 16px;
  color: #f49517;
}

.auth-form .form-control {
  width: 100%;
  padding: 0.9rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: 'Inter', sans-serif;
  background: #ffffff;
  color: #151a31;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

.auth-form .form-control::placeholder {
  color: #9ca3af;
}

.auth-form .form-control:focus {
  outline: none;
  border-color: #f49517;
  box-shadow: 0 0 0 4px rgba(244, 149, 23, 0.1);
  background: #ffffff;
}

.auth-error,
.auth-success {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  font-weight: 500;
  font-size: 0.9rem;
  animation: slideDown 0.3s ease;
}

.auth-error {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.06);
  border: 1px solid rgba(220, 38, 38, 0.15);
}

.auth-success {
  color: #16a34a;
  background: rgba(22, 163, 74, 0.06);
  border: 1px solid rgba(22, 163, 74, 0.15);
}

.auth-error svg,
.auth-success svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.btn-submit {
  width: 100%;
  padding: 1rem;
  margin-top: 0.5rem;
  background: linear-gradient(135deg, #f49517 0%, #e08310 100%);
  color: #ffffff;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(244, 149, 23, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(244, 149, 23, 0.4);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(244, 149, 23, 0.3);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 22px;
  height: 22px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.auth-divider {
  display: flex;
  align-items: center;
  margin: 1.75rem 0;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
}

.auth-divider span {
  padding: 0 1rem;
  color: #9ca3af;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.auth-switch {
  text-align: center;
  color: #6b7280;
  font-size: 0.95rem;
}

.switch-link {
  color: #f49517;
  font-weight: 700;
  text-decoration: none;
  margin-left: 0.25rem;
  position: relative;
  transition: color 0.2s ease;
}

.switch-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #f49517, #ffa500);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s ease;
}

.switch-link:hover {
  color: #e08310;
}

.switch-link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

@media (max-width: 991px) {
  .auth-panel-left {
    flex: 0 0 40%;
  }

  .panel-content h1 {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .auth-page {
    flex-direction: column;
  }

  .auth-panel-left {
    display: none;
  }

  .auth-panel-right {
    padding: 2rem 1.5rem;
    min-height: 100vh;
    background: linear-gradient(180deg, #faf9f6 0%, #ffffff 100%);
  }

  .mobile-logo {
    display: block;
  }

  .auth-card-header h2 {
    font-size: 1.75rem;
  }
}
</style>
