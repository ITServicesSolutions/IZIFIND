<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AdminIcon from '../admin/AdminIcon.vue'
import { ADMIN_MENU_RESOURCES } from '../../services/adminResources'
import logoUrl from '../../assets/legacy/img/logo.png'
</script>

<template>
  <aside id="layout-menu" class="layout-menu menu-vertical menu bg-menu-theme">
    <div class="app-brand demo admin-brand">
      <RouterLink to="/admin/dashboard" class="app-brand-link admin-brand-link" aria-label="Administration IZIFIND">
        <img :src="logoUrl" alt="IZIFIND" class="admin-brand-logo" style="width: 150px; height: auto;">
      </RouterLink>
    </div>

    <div class="menu-inner-shadow"></div>

    <ul class="menu-inner py-1">
      <li class="menu-item">
        <RouterLink to="/admin/dashboard" class="menu-link">
          <AdminIcon name="dashboard" />
          <div>Tableau de bord</div>
        </RouterLink>
      </li>
      <li v-for="resource in ADMIN_MENU_RESOURCES" :key="resource.key" class="menu-item">
        <RouterLink :to="resource.path" class="menu-link">
          <AdminIcon :name="resource.icon" />
          <div>
            <span>{{ resource.label }}</span>
            <small>{{ resource.subtitle }}</small>
          </div>
        </RouterLink>
      </li>
      <li class="menu-item">
        <RouterLink to="/" class="menu-link">
          <AdminIcon name="table" />
          <div>Site public</div>
        </RouterLink>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.layout-menu {
  max-height: 100vh;
  overflow-y: auto;
}
</style>
