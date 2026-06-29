<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const handleLogout = () => {
  authStore.logout()
  menuOpen.value = false
  router.push('/login')
}

const goToProfile = () => {
  router.push('/profile')
  menuOpen.value = false
}

const goToPasswordChange = () => {
  router.push('/change-password')
  menuOpen.value = false
}
</script>

<template>
  <nav class="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme">
    <div class="navbar-nav-right d-flex align-items-center">
      <div class="navbar-nav align-items-center">
        <div class="nav-item d-flex align-items-center input-group">
          <button class="btn search-btn" type="button">Search</button>
          <input type="text" class="form-control border-0 shadow-none" placeholder="Search..." aria-label="Search" />
        </div>
      </div>

      <ul class="navbar-nav flex-row align-items-center ms-auto">
        <li class="nav-item navbar-dropdown dropdown-user dropdown">
          <div class="admin-user-chip">
            <button
              class="avatar"
              type="button"
              @click="toggleMenu"
              style="cursor: pointer;"
            >
              {{ (authStore.user?.username || 'J').slice(0, 1).toUpperCase() }}
            </button>
            <span>{{ authStore.user?.username || 'John Doe' }}</span>
            <div v-if="menuOpen" class="user-dropdown">
              <button class="dropdown-item" type="button" @click="goToProfile">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Mon profil
              </button>
              <button class="dropdown-item" type="button" @click="goToPasswordChange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Changer le mot de passe
              </button>
              <hr>
              <button class="dropdown-item danger" type="button" @click="handleLogout">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Déconnexion
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--color-primary);
  color: white;
  border-radius: 50%;
  font-weight: 700;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.12);
  min-width: 200px;
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font: inherit;
  text-align: left;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background-color: rgba(92, 214, 192, 0.1);
}

.dropdown-item.danger:hover {
  background-color: rgba(255, 107, 107, 0.1);
  color: var(--color-lost);
}

.dropdown-item svg {
  width: 18px;
  height: 18px;
}

hr {
  margin: 0.25rem 0;
  border: none;
  border-top: 1px solid #E2E8F0;
}
</style>
