<script setup lang="ts">
import { RouterView } from 'vue-router'
import AdminLayout from './components/layout/AdminLayout.vue'
import PublicLayout from './components/layout/PublicLayout.vue'

const isAdminPath = (path: string) => path.startsWith('/admin')
const getLayout = (path: string) => (isAdminPath(path) ? AdminLayout : PublicLayout)
const getLayoutKey = (path: string) => (isAdminPath(path) ? 'admin' : 'public')
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <component :is="getLayout(route.path)" :key="getLayoutKey(route.path)">
      <component :is="Component" :key="route.fullPath" />
    </component>
  </RouterView>
</template>
