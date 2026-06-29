<template>
  <div class="auth-page">
    <!-- Decorative left panel -->
    <div class="auth-panel-left">
      <div class="panel-overlay"></div>
      <div class="panel-content">
        <RouterLink to="/" class="panel-logo">
          <img :src="logoUrl" alt="IZIFIND" />
        </RouterLink>
        <h1>Rejoignez IZIFIND</h1>
        <p>Créez votre compte gratuitement et rejoignez une communauté solidaire dédiée à la restitution d'objets perdus.</p>
        <div class="panel-features">
          <div class="feature-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
            <span>Déclarez en un clic</span>
          </div>
          <div class="feature-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>Recherche intelligente</span>
          </div>
          <div class="feature-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Données protégées</span>
          </div>
        </div>
      </div>
      <!-- Animated shapes -->
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
    </div>

    <!-- Right panel with form -->
    <div class="auth-panel-right">
      <div class="auth-card">
        <div class="auth-card-header">
          <RouterLink to="/" class="mobile-logo">
            <img :src="logoUrl" alt="IZIFIND" />
          </RouterLink>
          <h2>Créer un compte</h2>
          <p class="auth-subtitle">Remplissez les informations ci-dessous pour commencer</p>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label class="form-label" for="register-username">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Nom d'utilisateur
            </label>
            <input
              id="register-username"
              type="text"
              v-model="form.username"
              class="form-control"
              placeholder="Choisissez un nom d'utilisateur"
              required
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="register-email">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Adresse email
            </label>
            <input
              id="register-email"
              type="email"
              v-model="form.email"
              class="form-control"
              placeholder="votre@email.com"
              required
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="register-password">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Mot de passe
            </label>
            <div class="input-wrapper">
              <input
                id="register-password"
                :type="showPassword ? 'text' : 'password'"
                v-model="form.password"
                class="form-control"
                placeholder="Minimum 6 caractères"
                required
                autocomplete="new-password"
              />
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
            <!-- Password strength indicator -->
            <div class="password-strength" v-if="form.password.length > 0">
              <div class="strength-bars">
                <div class="strength-bar" :class="{ active: passwordStrength >= 1 }"></div>
                <div class="strength-bar" :class="{ active: passwordStrength >= 2 }"></div>
                <div class="strength-bar" :class="{ active: passwordStrength >= 3 }"></div>
                <div class="strength-bar" :class="{ active: passwordStrength >= 4 }"></div>
              </div>
              <span class="strength-label">{{ strengthLabel }}</span>
            </div>
          </div>

          <transition name="shake">
            <div v-if="error" class="auth-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {{ error }}
            </div>
          </transition>

          <button type="submit" class="btn-submit" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>Créer mon compte</span>
          </button>
        </form>

        <div class="auth-divider">
          <span>ou</span>
        </div>

        <div id="google-button-register"></div>

        <div class="auth-switch">
          <span>Déjà un compte ?</span>
          <RouterLink to="/login" class="switch-link">Se connecter</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import logoUrl from '../../assets/images/logo.png'
import { useAuthStore } from '../../stores/auth'

const form = ref({
  username: '',
  email: '',
  password: '',
})
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)


const authStore = useAuthStore()
const router = useRouter()

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (element: HTMLElement, config: any) => void
          prompt: () => void
        }
      }
    }
  }
}


const passwordStrength = computed(() => {
  const p = form.value.password
  let score = 0
  if (p.length >= 6) score++
  if (p.length >= 10) score++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++
  if (/[0-9]/.test(p) || /[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthLabel = computed(() => {
  const labels = ['Faible', 'Moyen', 'Bon', 'Fort']
  return labels[passwordStrength.value - 1] || 'Faible'
})

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

const handleGoogleSignIn = async (response: any) => {
  try {
    loading.value = true
    await authStore.googleLogin(response.credential)
    router.push(authStore.isAdmin ? '/admin/dashboard' : '/profile')
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Erreur lors de la connexion Google'
  } finally {
    loading.value = false
  }
}

let googleCheckInterval: any

onMounted(() => {
  const initGoogle = () => {
    const clientId = import.meta.env.EXPO_GOOGLE_CLIENT_ID || import.meta.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (window.google && clientId) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleSignIn,
      })
      const buttonElement = document.getElementById('google-button-register')
      if (buttonElement) {
        window.google.accounts.id.renderButton(buttonElement, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          locale: 'fr',
        })
      }
      return true
    }
    return false
  }

  if (!initGoogle()) {
    googleCheckInterval = setInterval(() => {
      if (initGoogle()) {
        clearInterval(googleCheckInterval)
      }
    }, 100)
    
    // Safety clear after 5s
    setTimeout(() => {
      if (googleCheckInterval) clearInterval(googleCheckInterval)
    }, 5000)
  }
})

onUnmounted(() => {
  if (googleCheckInterval) clearInterval(googleCheckInterval)
})
</script>

<style scoped>
/* ─── Page Layout ─── */
.auth-page {
  display: flex;
  min-height: 100vh;
  background-color: #faf9f6;
}

/* ─── Left Decorative Panel ─── */
.auth-panel-left {
  flex: 0 0 46%;
  position: relative;
  background: linear-gradient(160deg, #151a31 0%, #1e254a 40%, #f49517 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  overflow: hidden;
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
  transition: transform 0.3s ease;
}

.panel-logo:hover img {
  transform: scale(1.05);
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
  margin-bottom: 2.5rem;
}

.panel-features {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.feature-item svg {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  color: #f49517;
}

/* Floating shapes */
.floating-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
  pointer-events: none;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: #f49517;
  top: -80px;
  right: -60px;
  animation: float-1 8s ease-in-out infinite;
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: #ffffff;
  bottom: 10%;
  left: -40px;
  animation: float-2 10s ease-in-out infinite;
}

.shape-3 {
  width: 120px;
  height: 120px;
  background: #f49517;
  bottom: -30px;
  right: 25%;
  animation: float-3 12s ease-in-out infinite;
}

@keyframes float-1 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(-20px, 30px) rotate(15deg); }
}

@keyframes float-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(15px, -25px) scale(1.1); }
}

@keyframes float-3 {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(20px, -15px); }
  66% { transform: translate(-10px, 10px); }
}

/* ─── Right Panel (Form) ─── */
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

/* ─── Card Header ─── */
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

/* ─── Form Styles ─── */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
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

/* Input wrapper */
.input-wrapper {
  position: relative;
}

.input-wrapper .form-control {
  padding-right: 3.5rem;
}

/* Password toggle */
.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.password-toggle:hover {
  color: #f49517;
  background: rgba(244, 149, 23, 0.08);
}



/* Password strength indicator */
.password-strength {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.6rem;
}

.strength-bars {
  display: flex;
  gap: 4px;
  flex: 1;
}

.strength-bar {
  height: 4px;
  flex: 1;
  border-radius: 2px;
  background: #e5e7eb;
  transition: background 0.3s ease;
}

.strength-bar.active:nth-child(1) { background: #ef4444; }
.strength-bar.active:nth-child(2) { background: #f59e0b; }
.strength-bar.active:nth-child(3) { background: #10b981; }
.strength-bar.active:nth-child(4) { background: #059669; }

.strength-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  min-width: 40px;
}

/* Error message */
.auth-error {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.875rem 1rem;
  color: #dc2626;
  background: rgba(220, 38, 38, 0.06);
  border: 1px solid rgba(220, 38, 38, 0.15);
  border-radius: 10px;
  font-weight: 500;
  font-size: 0.9rem;
  animation: slideDown 0.3s ease;
}

.auth-error svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Submit button */
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

/* Loading spinner */
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

/* Google button */
.btn-google {
  width: 100%;
  padding: 0.875rem 1rem;
  margin-bottom: 1.75rem;
  background: #ffffff;
  color: #333333;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.btn-google:hover {
  border-color: #d1d5db;
  background: #f9fafb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.btn-google:active {
  transform: translateY(0);
}

.google-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* ─── Divider ─── */
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

/* ─── Switch Link ─── */
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

/* ─── Responsive ─── */
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
