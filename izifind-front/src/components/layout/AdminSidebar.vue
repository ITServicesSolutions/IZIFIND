<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import AdminIcon from '../admin/AdminIcon.vue'
import { ADMIN_MENU_GROUPS } from '../../services/adminResources'
import logoUrl from '../../assets/legacy/img/logo.png'

const openGroups = ref<string[]>(['Tableau de bord', 'Gestion des comptes', 'Référentiels', 'Objets et déclarations'])

const toggleGroup = (label: string) => {
  const index = openGroups.value.indexOf(label)
  if (index > -1) {
    openGroups.value.splice(index, 1)
  } else {
    openGroups.value.push(label)
  }
}
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
      <li v-for="group in ADMIN_MENU_GROUPS" :key="group.label" class="menu-item">
        <button
          v-if="group.resources.length > 0"
          class="menu-link group-toggle"
          type="button"
          @click="toggleGroup(group.label)"
        >
          <AdminIcon :name="group.icon" />
          <div>{{ group.label }}</div>
          <svg
            :style="{ transform: openGroups.includes(group.label) ? 'rotate(90deg)' : 'rotate(0deg)' }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="group-toggle-icon"
          >
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <ul v-if="group.resources.length > 0 && openGroups.includes(group.label)" class="submenu">
          <li v-for="resource in group.resources" :key="resource.key" class="menu-item">
            <RouterLink :to="resource.path" class="menu-link">
              <AdminIcon :name="resource.icon" />
              <div>
                <span>{{ resource.label }}</span>
                <small>{{ resource.subtitle }}</small>
              </div>
            </RouterLink>
          </li>
        </ul>
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
  max-height: none;
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.layout-menu::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.group-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  font: inherit;
}

.group-toggle:hover {
  background-color: rgba(92, 214, 192, 0.1);
}

.group-toggle-icon {
  margin-left: auto;
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}

.submenu {
  padding-left: 0.75rem;
  margin-left: 0.75rem;
  border-left: 2px solid #E2E8F0;
}
</style>
