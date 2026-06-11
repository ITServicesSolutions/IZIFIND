<template>
  <main class="admin-content">
    <div class="page-header page-header--left">
      <p class="page-subtitle">Administration / Référentiels</p>
      <h2>Categories</h2>
      <p class="page-subtitle">Structurez les objets pour faciliter les recherches et les declarations.</p>
    </div>

    <section class="glass-card admin-table-shell">
      <div class="admin-table-toolbar">
        <div class="chip-row">
          <span class="table-chip">{{ categories.length }} categories</span>
        </div>
        <button class="btn btn-primary" type="button" @click="openModal()">Nouvelle categorie</button>
      </div>

      <div v-if="loading" class="notice compact">Chargement...</div>
      <div v-else-if="categories.length === 0" class="notice compact">Aucune categorie.</div>
      <div v-else class="admin-table-wrap" style="max-height: 60vh; overflow-y: auto;">
        <table class="admin-table">
          <thead style="position: sticky; top: 0; background-color: var(--color-surface); z-index: 1;">
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in categories" :key="category.id">
              <td>{{ category.id }}</td>
              <td><strong>{{ category.name }}</strong></td>
              <td>{{ category.description || '—' }}</td>
              <td>
                <div class="admin-table-actions">
                  <button class="pagination-btn" type="button" @click="openModal(category)">Modifier</button>
                  <button class="pagination-btn" type="button" @click="askDelete(category)">Supprimer</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Modal for Create/Edit -->
    <AdminModal
      :open="isModalOpen"
      :title="editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'"
      @close="closeModal"
    >
      <form @submit.prevent="editingCategory ? updateCategory() : submitCategory()">
        <div class="form-group">
          <label class="form-label">Nom</label>
          <input v-model="form.name" class="form-control" required />
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea v-model="form.description" class="form-control" rows="4"></textarea>
        </div>
        <div class="btn-group" style="margin-top: 1rem; justify-content: flex-end; display: flex; gap: 0.5rem;">
          <button class="btn btn-secondary" type="button" @click="closeModal">Annuler</button>
          <button class="btn btn-primary" type="submit" :disabled="saving">
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
        <p v-if="error" class="inline-error mt-2">{{ error }}</p>
      </form>
    </AdminModal>

    <!-- Delete Confirmation Swal -->
    <AdminSwal
      :open="!!deleteTarget"
      title="Supprimer cette catégorie ?"
      :message="`Êtes-vous sûr de vouloir supprimer la catégorie '${deleteTarget?.name}' ?`"
      confirm-label="Supprimer"
      @cancel="deleteTarget = null"
      @confirm="confirmDelete"
    />
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { createCategory, getCategories } from '../../services/categories'
import api from '../../services/api'
import type { Category } from '../../services/types'
import AdminModal from '../../components/admin/AdminModal.vue'
import AdminSwal from '../../components/admin/AdminSwal.vue'

const categories = ref<Category[]>([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')

const isModalOpen = ref(false)
const editingCategory = ref<Category | null>(null)
const form = ref({ name: '', description: '' })
const deleteTarget = ref<Category | null>(null)

const loadCategories = async () => {
  loading.value = true
  try {
    categories.value = await getCategories()
  } finally {
    loading.value = false
  }
}

const openModal = (category?: Category) => {
  if (category) {
    editingCategory.value = category
    form.value = { name: category.name, description: category.description || '' }
  } else {
    editingCategory.value = null
    form.value = { name: '', description: '' }
  }
  error.value = ''
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const submitCategory = async () => {
  error.value = ''
  saving.value = true
  try {
    const category = await createCategory(form.value)
    categories.value = [category, ...categories.value]
    closeModal()
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Creation impossible.'
  } finally {
    saving.value = false
  }
}

const updateCategory = async () => {
  if (!editingCategory.value) return
  error.value = ''
  saving.value = true
  try {
    const { data } = await api.put(`/categories/${editingCategory.value.id}`, form.value)
    categories.value = categories.value.map(c => c.id === data.id ? data : c)
    closeModal()
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Mise à jour impossible.'
  } finally {
    saving.value = false
  }
}

const askDelete = (category: Category) => {
  deleteTarget.value = category
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  try {
    await api.delete(`/categories/${deleteTarget.value.id}`)
    categories.value = categories.value.filter(c => c.id !== deleteTarget.value!.id)
    deleteTarget.value = null
  } catch (err: any) {
    alert(err.response?.data?.detail || 'Suppression impossible.')
  }
}

onMounted(loadCategories)
</script>
