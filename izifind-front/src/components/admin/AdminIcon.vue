<script setup lang="ts">
const props = defineProps<{
  name: string
}>()

const iconClass = `admin-icon admin-icon--${props.name}`
</script>

<template>
  <span :class="iconClass" aria-hidden="true">
    <svg v-if="name === 'dashboard'" viewBox="0 0 24 24">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="10" width="8" height="11" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
    </svg>
    <svg v-else-if="name === 'grid'" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
    <svg v-else-if="name === 'layers'" viewBox="0 0 24 24">
      <path d="M12 3 2.5 8l9.5 5 9.5-5L12 3Zm0 8L2.5 16 12 21l9.5-5L12 11Z" />
    </svg>
    <svg v-else-if="name === 'tag'" viewBox="0 0 24 24">
      <path d="M20 13 12 21 3 12V3h9l8 10Z" />
      <circle cx="8.5" cy="8.5" r="1.8" />
    </svg>
    <svg v-else-if="name === 'palette'" viewBox="0 0 24 24">
      <path d="M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h2a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h-2Z" />
    </svg>
    <svg v-else-if="name === 'status'" viewBox="0 0 24 24">
      <path d="M12 2 3 6v6c0 5 3.5 8.9 9 10 5.5-1.1 9-5 9-10V6l-9-4Z" />
    </svg>
    <svg v-else-if="name === 'bookmark'" viewBox="0 0 24 24">
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
    </svg>
    <svg v-else-if="name === 'table'" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M3 14h18M8 4v16M16 4v16" />
    </svg>
    <svg v-else-if="name === 'image'" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m21 16-5-5-4 4-2-2-7 7" />
    </svg>
    <svg v-else-if="name === 'spark'" viewBox="0 0 24 24">
      <path d="M12 2 9 9l-7 3 7 3 3 7 3-7 7-3-7-3-3-7Z" />
    </svg>
    <svg v-else-if="name === 'coin'" viewBox="0 0 24 24">
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v8c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 10c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </svg>
    <svg v-else-if="name === 'message'" viewBox="0 0 24 24">
      <path d="M4 4h16v11H8l-4 4V4Z" />
    </svg>
    <svg v-else-if="name === 'map'" viewBox="0 0 24 24">
      <path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
    <svg v-else-if="name === 'shield'" viewBox="0 0 24 24">
      <path d="M12 2 4 5v6c0 5.5 3.8 9.8 8 11 4.2-1.2 8-5.5 8-11V5l-8-3Z" />
    </svg>
    <svg v-else-if="name === 'key'" viewBox="0 0 24 24">
      <circle cx="8" cy="11" r="4" />
      <path d="M12 11h9v3h-2v2h-2v2h-3v-3l-2-2" />
    </svg>
    <svg v-else-if="name === 'users'" viewBox="0 0 24 24">
      <circle cx="9" cy="8" r="3" />
      <circle cx="16" cy="10" r="2.5" />
      <path d="M4 20c0-3.3 2.8-6 6-6s6 2.7 6 6" />
      <path d="M13 20c0-2.5 2.1-4.5 4.5-4.5S22 17.5 22 20" />
    </svg>
    <svg v-else viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="4" />
    </svg>
  </span>
</template>
