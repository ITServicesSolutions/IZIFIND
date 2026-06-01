<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Transition name="admin-pop">
    <div v-if="open" class="admin-swal-backdrop" @click.self="emit('cancel')">
      <div class="admin-swal-card">
        <div class="admin-swal-badge">!</div>
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <div class="chip-row admin-swal-actions">
          <button class="btn btn-secondary" type="button" @click="emit('cancel')">
            {{ cancelLabel || 'Annuler' }}
          </button>
          <button class="btn btn-primary admin-danger-btn" type="button" @click="emit('confirm')">
            {{ confirmLabel || 'Confirmer' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
