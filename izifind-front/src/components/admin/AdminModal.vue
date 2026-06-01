<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
  subtitle?: string
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <Transition name="admin-fade">
    <div v-if="open" class="admin-modal-backdrop" @click.self="$emit('close')">
      <div class="admin-modal-card">
        <div class="admin-modal-header">
          <div>
            <p v-if="subtitle" class="admin-modal-kicker">{{ subtitle }}</p>
            <h3>{{ title }}</h3>
          </div>
          <button class="admin-icon-button" type="button" @click="$emit('close')">×</button>
        </div>
        <div class="admin-modal-body">
          <slot />
        </div>
      </div>
    </div>
  </Transition>
</template>
