<template>
  <div class="layout-wrapper layout-content-navbar">
    <div class="layout-container">
      <AdminSidebar />
      <div class="layout-page">
        <AdminTopbar />
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminSidebar from './AdminSidebar.vue'
import AdminTopbar from './AdminTopbar.vue'
</script>
