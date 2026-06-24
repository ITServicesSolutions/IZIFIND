<template>
  <main class="admin-content">
    <div class="admin-grid-main">
      <section class="admin-card admin-welcome">
        <div>
          <p class="page-subtitle">Espace d'administration</p>
          <h5>Bonjour {{ authStore.user?.username || 'admin' }}.</h5>
          <p>
            Cette zone est réservée aux administrateurs. Elle regroupe les actions de gestion,
            les accès RBAC et les réglages métier qui ne doivent pas apparaître dans l'espace public.
          </p>
          <div class="chip-row" style="margin-bottom: 1rem;">
            <span class="status-pill found">Routes privées</span>
            <span class="status-pill lost">RBAC actif</span>
            <span class="status-pill">Admin only</span>
          </div>
          <div class="chip-row">
            <RouterLink to="/admin/categories" class="admin-outline-btn">Gérer les catégories</RouterLink>
            <RouterLink to="/admin/roles" class="admin-outline-btn">Gérer les rôles</RouterLink>
            <RouterLink to="/" class="admin-outline-btn">Voir le site public</RouterLink>
          </div>
        </div>
        <img :src="laptopImage" alt="Admin" />
      </section>

      <section class="admin-mini-card">
        <img :src="chartIcon" alt="" />
        <span>Objets publics</span>
        <h3>{{ loading ? '...' : stats.total }}</h3>
        <small class="success">+72.80%</small>
      </section>

      <section class="admin-mini-card">
        <img :src="walletIcon" alt="" />
        <span>Categories</span>
        <h3>{{ loading ? '...' : stats.categories }}</h3>
        <small class="success">+28.42%</small>
      </section>

      <section class="admin-mini-card">
        <img :src="paypalIcon" alt="" />
        <span>Objets perdus</span>
        <h3>{{ loading ? '...' : stats.lost }}</h3>
        <small class="danger">-14.82%</small>
      </section>

      <section class="admin-mini-card">
        <img :src="cardIcon" alt="" />
        <span>Objets trouves</span>
        <h3>{{ loading ? '...' : stats.found }}</h3>
        <small class="success">+28.14%</small>
      </section>

      <!-- Pie Chart -->
      <section class="admin-card chart-card" style="grid-column: span 2;">
        <h3 style="margin-bottom: 1.5rem;">Répartition des objets par statut</h3>
        <canvas ref="statusChartRef"></canvas>
      </section>

      <!-- Bar Chart -->
      <section class="admin-card chart-card" style="grid-column: span 2;">
        <h3 style="margin-bottom: 1.5rem;">Objets par catégorie</h3>
        <canvas ref="categoryChartRef"></canvas>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Chart, registerables } from 'chart.js'
import { FOUND_STATUS_ID, LOST_STATUS_ID, getObjects } from '../../services/objets'
import { getCategories } from '../../services/categories'
import { useAuthStore } from '../../stores/auth'
import laptopImage from '../../assets/legacy/admin/illustrations/man-with-laptop-light.png'
import chartIcon from '../../assets/legacy/admin/icons/chart-success.png'
import walletIcon from '../../assets/legacy/admin/icons/wallet-info.png'
import paypalIcon from '../../assets/legacy/admin/icons/paypal.png'
import cardIcon from '../../assets/legacy/admin/icons/cc-primary.png'
import type { ObjectRecord, Category } from '../../services/types'

// Register Chart.js components
Chart.register(...registerables)

const authStore = useAuthStore()
const loading = ref(true)
const objects = ref<ObjectRecord[]>([])
const categories = ref<Category[]>([])
const stats = ref({ total: 0, lost: 0, found: 0, categories: 0 })

const statusChartRef = ref<HTMLCanvasElement | null>(null)
const categoryChartRef = ref<HTMLCanvasElement | null>(null)

let statusChart: Chart | null = null
let categoryChart: Chart | null = null

const createStatusChart = () => {
  if (!statusChartRef.value) return
  
  const ctx = statusChartRef.value.getContext('2d')
  if (!ctx) return

  statusChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Objets perdus', 'Objets trouvés'],
      datasets: [
        {
          data: [stats.value.lost, stats.value.found],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(92, 184, 116, 0.8)',
          ],
          borderColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(92, 184, 116, 1)',
          ],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            font: {
              size: 14,
            },
          },
        },
      },
    },
  })
}

const createCategoryChart = () => {
  if (!categoryChartRef.value) return
  
  const ctx = categoryChartRef.value.getContext('2d')
  if (!ctx) return

  // Calculate category counts
  const categoryCounts: Record<string, number> = {}
  categories.value.forEach(cat => {
    categoryCounts[cat.name] = 0
  })
  
  objects.value.forEach(obj => {
    if (obj.categorie_id) {
      const cat = categories.value.find(c => c.id === obj.categorie_id)
      if (cat) {
        categoryCounts[cat.name] = (categoryCounts[cat.name] || 0) + 1
      }
    }
  })

  const labels = Object.keys(categoryCounts)
  const data = Object.values(categoryCounts)

  categoryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Nombre d\'objets',
          data,
          backgroundColor: 'rgba(244, 149, 23, 0.7)',
          borderColor: 'rgba(244, 149, 23, 1)',
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  })
}

onMounted(async () => {
  try {
    const [objectsData, categoriesData] = await Promise.all([getObjects(), getCategories()])
    objects.value = objectsData
    categories.value = categoriesData
    stats.value = {
      total: objectsData.length,
      lost: objectsData.filter((objet) => objet.statut_id === LOST_STATUS_ID).length,
      found: objectsData.filter((objet) => objet.statut_id === FOUND_STATUS_ID).length,
      categories: categoriesData.length,
    }
    
    // Create charts after data is loaded
    createStatusChart()
    createCategoryChart()
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  // Destroy charts to prevent memory leaks
  if (statusChart) {
    statusChart.destroy()
  }
  if (categoryChart) {
    categoryChart.destroy()
  }
})
</script>

<style scoped>
.chart-card {
  min-height: 400px;
}

.chart-card canvas {
  max-height: 350px;
}
</style>
