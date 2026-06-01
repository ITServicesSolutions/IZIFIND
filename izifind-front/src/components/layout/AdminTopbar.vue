<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
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
            <div class="avatar">{{ (authStore.user?.username || 'J').slice(0, 1).toUpperCase() }}</div>
            <span>{{ authStore.user?.username || 'John Doe' }}</span>
            <button class="dropdown-item logout-link" type="button" @click="handleLogout">Log Out</button>
          </div>
        </li>
      </ul>
    </div>
  </nav>
</template>
