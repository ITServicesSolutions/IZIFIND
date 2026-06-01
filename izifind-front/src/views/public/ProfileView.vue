<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

const userRoles = computed(() => authStore.user?.roles?.map((role) => role.name).join(', ') || 'Aucun rôle')
</script>

<template>
  <main class="page-container container">
    <div class="page-header">
      <h2>Profil</h2>
      <p class="page-subtitle">Retrouvez les informations liées à votre compte IZIFIND.</p>
    </div>

    <div class="admin-grid">
      <section class="glass-card">
        <h3>Informations du compte</h3>
        <ul class="data-list">
          <li>
            <strong>Nom d'utilisateur</strong>
            <span>{{ authStore.user?.username }}</span>
          </li>
          <li>
            <strong>Email</strong>
            <span>{{ authStore.user?.email }}</span>
          </li>
          <li>
            <strong>Rôles</strong>
            <span>{{ userRoles }}</span>
          </li>
        </ul>
      </section>

      <section class="glass-card">
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
  </main>
</template>
