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
const pageSize = ref(10)
const pageSizeOptions = [10, 15, 30]
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

const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / pageSize.value)))

const pagedItems = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredItems.value.slice(start, start + pageSize.value)
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

const goToPage = (p: number) => {
  if (p >= 1 && p <= totalPages.value) {
    page.value = p
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
          <select v-model="pageSize" class="form-control" style="max-width: 120px;">
            <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }} éléments</option>
          </select>
          <input v-model="query" class="form-control" type="search" placeholder="Rechercher..." />
          <button class="btn btn-secondary" type="button" @click="loadItems">Rafraîchir</button>
        </div>
      </div>

      <div v-if="feedback" class="notice danger">{{ feedback }}</div>
      <div v-if="loading" class="notice">Chargement...</div>
      <div v-else class="admin-table-wrap" style="max-height: 60vh; overflow-y: auto;">
        <table class="admin-table">
          <thead style="position: sticky; top: 0; background-color: var(--color-surface); z-index: 1;">
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
                  <button class="action-btn action-btn-view" type="button" @click="openDetails(item)" title="Voir">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                  <button
                    v-if="resource?.deletable"
                    class="action-btn action-btn-delete"
                    type="button"
                    @click="askDelete(item)"
                    title="Supprimer"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="admin-table-pagination">
        <div class="pagination-info">
          <p>
            Page {{ page }} / {{ totalPages }}
          </p>
        </div>
        <div class="pagination-actions">
          <button class="pagination-btn" type="button" :disabled="page === 1" @click="goToPage(page - 1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div class="pagination-numbers">
            <button
              v-for="p in (() => {
                const pages = []
                if (totalPages <= 5) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i)
                } else {
                  if (page <= 3) {
                    for (let i = 1; i <= 4; i++) pages.push(i)
                    pages.push('...')
                    pages.push(totalPages)
                  } else if (page >= totalPages - 2) {
                    pages.push(1)
                    pages.push('...')
                    for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
                  } else {
                    pages.push(1)
                    pages.push('...')
                    for (let i = page - 1; i <= page + 1; i++) pages.push(i)
                    pages.push('...')
                    pages.push(totalPages)
                  }
                }
                return pages
              })()"
              :key="p"
              :class="['page-number', { active: p === page, disabled: p === '...' }]"
              :disabled="p === '...'"
              @click="typeof p === 'number' && goToPage(p)"
            >
              {{ p }}
            </button>
          </div>
          <button class="pagination-btn" type="button" :disabled="page >= totalPages" @click="goToPage(page + 1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
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

<style scoped>
.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  background-color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.action-btn-view {
  color: var(--color-primary);
  border-color: rgba(92, 214, 192, 0.3);
}

.action-btn-view:hover {
  background-color: rgba(92, 214, 192, 0.1);
}

.action-btn-delete {
  color: var(--color-lost);
  border-color: rgba(255, 107, 107, 0.3);
}

.action-btn-delete:hover {
  background-color: rgba(255, 107, 107, 0.1);
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.pagination-numbers {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.page-number {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  background-color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--color-text-muted);
  transition: all 0.2s ease;
}

.page-number:hover:not(.active):not(.disabled) {
  background-color: var(--color-bg-alt);
}

.page-number.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.page-number.disabled {
  cursor: default;
  border: none;
  background: none;
}

.admin-table-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
}

.pagination-info {
  color: var(--color-text-muted);
}
</style>
