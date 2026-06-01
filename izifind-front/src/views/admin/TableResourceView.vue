<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../services/api'
import AdminModal from '../../components/admin/AdminModal.vue'
import AdminSwal from '../../components/admin/AdminSwal.vue'
import AdminIcon from '../../components/admin/AdminIcon.vue'
import { getAdminResource, type AdminResourceKey } from '../../services/adminResources'

const props = defineProps<{
  resource: AdminResourceKey
}>()

const route = useRoute()
const resource = computed(() => getAdminResource(props.resource))
const loading = ref(true)
const items = ref<any[]>([])
const page = ref(1)
const pageSize = 6
const query = ref('')
const selectedItem = ref<any | null>(null)
const deleteTarget = ref<any | null>(null)
const feedback = ref('')

const filteredItems = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return items.value
  return items.value.filter((item) =>
    Object.values(item).some((value) => String(value ?? '').toLowerCase().includes(needle))
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / pageSize)))

const pagedItems = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredItems.value.slice(start, start + pageSize)
})

const columns = computed(() => resource.value?.fields || [])

const loadItems = async () => {
  if (!resource.value) return
  loading.value = true
  feedback.value = ''
  try {
    const { data } = await api.get(resource.value.endpoint)
    items.value = Array.isArray(data) ? data : []
    page.value = 1
  } catch (error: any) {
    feedback.value = error.response?.data?.detail || 'Chargement impossible.'
  } finally {
    loading.value = false
  }
}

const openDetails = (item: any) => {
  selectedItem.value = item
}

const askDelete = (item: any) => {
  deleteTarget.value = item
}

const closeDelete = () => {
  deleteTarget.value = null
}

const confirmDelete = async () => {
  if (!resource.value || !deleteTarget.value || !resource.value.deletable) return
  try {
    const endpoint = resource.value.deletePath?.(deleteTarget.value.id)
    if (!endpoint) return
    await api.delete(endpoint)
    deleteTarget.value = null
    await loadItems()
  } catch (error: any) {
    feedback.value = error.response?.data?.detail || 'Suppression impossible.'
  }
}

const formatValue = (value: any) => {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

watch(
  () => query.value,
  () => {
    page.value = 1
  }
)

watch(
  () => route.fullPath,
  () => {
    if (resource.value) loadItems()
  }
)

onMounted(loadItems)
</script>

<template>
  <main class="admin-content">
    <div class="page-header page-header--left">
      <p class="page-subtitle">Administration / tables</p>
      <h2>{{ resource?.label }}</h2>
      <p class="page-subtitle">{{ resource?.subtitle }}</p>
    </div>

    <section class="glass-card admin-table-shell">
      <div class="admin-table-toolbar">
        <div class="chip-row">
          <AdminIcon :name="resource?.icon || 'table'" />
          <span class="table-chip">{{ filteredItems.length }} enregistrements</span>
        </div>
        <div class="toolbar">
          <input v-model="query" class="form-control" type="search" placeholder="Rechercher..." />
          <button class="btn btn-secondary" type="button" @click="loadItems">Rafraîchir</button>
        </div>
      </div>

      <div v-if="feedback" class="notice danger">{{ feedback }}</div>
      <div v-if="loading" class="notice">Chargement...</div>
      <div v-else class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th v-for="column in columns" :key="column">{{ column }}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in pagedItems" :key="item.id">
              <td v-for="column in columns" :key="column">
                <span v-if="typeof item[column] === 'boolean'" class="table-chip">
                  {{ formatValue(item[column]) }}
                </span>
                <span v-else>{{ formatValue(item[column]) }}</span>
              </td>
              <td>
                <div class="admin-table-actions">
                  <button class="pagination-btn" type="button" @click="openDetails(item)">Voir</button>
                  <button
                    v-if="resource?.deletable"
                    class="pagination-btn"
                    type="button"
                    @click="askDelete(item)"
                  >
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="admin-table-pagination">
        <p>
          Page {{ page }} / {{ totalPages }}
        </p>
        <div class="pagination-actions">
          <button class="pagination-btn" type="button" :disabled="page === 1" @click="page--">Précédent</button>
          <button class="pagination-btn" type="button" :disabled="page >= totalPages" @click="page++">Suivant</button>
        </div>
      </div>
    </section>

    <AdminModal
      :open="!!selectedItem"
      :title="selectedItem ? `${resource?.label} #${selectedItem.id}` : ''"
      subtitle="Détails de l'enregistrement"
      @close="selectedItem = null"
    >
      <div v-if="selectedItem" class="data-list">
        <div v-for="(value, key) in selectedItem" :key="String(key)">
          <strong>{{ key }}</strong>
          <span>{{ formatValue(value) }}</span>
        </div>
      </div>
    </AdminModal>

    <AdminSwal
      :open="!!deleteTarget"
      title="Confirmer la suppression"
      :message="deleteTarget ? `Supprimer l'enregistrement #${deleteTarget.id} ?` : ''"
      confirm-label="Supprimer"
      cancel-label="Annuler"
      @cancel="closeDelete"
      @confirm="confirmDelete"
    />
  </main>
</template>
