<template>
  <div class="public-layout">
    <PublicTopBar />
    <PublicHeader />
    <slot />
    <PublicFooter />
  </div>
</template>

<script setup lang="ts">
import PublicFooter from './PublicFooter.vue'
import PublicHeader from './PublicHeader.vue'
import PublicTopBar from './PublicTopBar.vue'
</script>
