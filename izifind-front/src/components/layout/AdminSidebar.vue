<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <aside id="layout-menu" class="layout-menu menu-vertical menu bg-menu-theme">
    <div class="app-brand demo">
      <RouterLink to="/dashboard" class="app-brand-link">
        <span class="app-brand-text demo menu-text fw-bolder ms-2 text-warning text-uppercase">IZIFIND</span>
      </RouterLink>
    </div>

    <div class="menu-inner-shadow"></div>

    <ul class="menu-inner py-1">
      <li class="menu-item">
        <RouterLink to="/dashboard" class="menu-link">
          <span class="menu-icon">H</span>
          <div>Tableau de bord</div>
        </RouterLink>
      </li>
      <li class="menu-item">
        <RouterLink to="/catalog" class="menu-link">
          <span class="menu-icon">O</span>
          <div>Objets retrouves</div>
        </RouterLink>
      </li>
      <li class="menu-item">
        <RouterLink to="/catalog" class="menu-link">
          <span class="menu-icon">O</span>
          <div>Objets perdus</div>
        </RouterLink>
      </li>
      <li class="menu-item">
        <RouterLink to="/admin/categories" class="menu-link">
          <span class="menu-icon">C</span>
          <div>Categories</div>
        </RouterLink>
      </li>
      <li class="menu-item">
        <RouterLink to="/admin/roles" class="menu-link">
          <span class="menu-icon">R</span>
          <div>Roles</div>
        </RouterLink>
      </li>
    </ul>
  </aside>
</template>
