<template>
  <div class="page-container container">
    <div class="page-header">
      <h2>Categories</h2>
      <p class="page-subtitle">Structurez les objets pour faciliter les recherches et les declarations.</p>
    </div>

    <div class="admin-grid">
      <form class="glass-card" @submit.prevent="submitCategory">
        <h3>Nouvelle categorie</h3>
        <div class="form-group">
          <label class="form-label">Nom</label>
          <input v-model="form.name" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea v-model="form.description" class="form-control" rows="4"></textarea>
        </div>
        <button class="btn btn-primary" type="submit" :disabled="saving">
          {{ saving ? 'Creation...' : 'Creer la categorie' }}
        </button>
        <p v-if="error" class="inline-error">{{ error }}</p>
      </form>

      <div class="glass-card">
        <h3>Categories existantes</h3>
        <div v-if="loading" class="notice compact">Chargement...</div>
        <div v-else-if="categories.length === 0" class="notice compact">Aucune categorie.</div>
        <ul v-else class="data-list">
          <li v-for="category in categories" :key="category.id">
            <strong>{{ category.name }}</strong>
            <span>{{ category.description || 'Sans description' }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { createCategory, getCategories } from '../../services/categories'
import type { Category } from '../../services/types'

const categories = ref<Category[]>([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const form = ref({ name: '', description: '' })

const loadCategories = async () => {
  loading.value = true
  try {
    categories.value = await getCategories()
  } finally {
    loading.value = false
  }
}

const submitCategory = async () => {
  error.value = ''
  saving.value = true
  try {
    const category = await createCategory(form.value)
    categories.value = [category, ...categories.value]
    form.value = { name: '', description: '' }
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Creation impossible.'
  } finally {
    saving.value = false
  }
}

onMounted(loadCategories)
</script>
