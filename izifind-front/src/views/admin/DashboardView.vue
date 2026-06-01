<template>
  <main class="admin-content">
    <div class="admin-grid-main">
      <section class="admin-card admin-welcome">
        <div>
          <h5>Congratulations {{ authStore.user?.username || 'John' }}!</h5>
          <p>Vous avez maintenant une interface moderne pour piloter IZIFIND depuis FastAPI.</p>
          <RouterLink to="/admin/categories" class="admin-outline-btn">Voir les categories</RouterLink>
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
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { FOUND_STATUS_ID, LOST_STATUS_ID, getObjects } from '../../services/objets'
import { getCategories } from '../../services/categories'
import { useAuthStore } from '../../stores/auth'
import laptopImage from '../../assets/legacy/admin/illustrations/man-with-laptop-light.png'
import chartIcon from '../../assets/legacy/admin/icons/chart-success.png'
import walletIcon from '../../assets/legacy/admin/icons/wallet-info.png'
import paypalIcon from '../../assets/legacy/admin/icons/paypal.png'
import cardIcon from '../../assets/legacy/admin/icons/cc-primary.png'

const authStore = useAuthStore()
const loading = ref(true)
const stats = ref({ total: 0, lost: 0, found: 0, categories: 0 })

onMounted(async () => {
  try {
    const [objects, categories] = await Promise.all([getObjects(), getCategories()])
    stats.value = {
      total: objects.length,
      lost: objects.filter((objet) => objet.statut_id === LOST_STATUS_ID).length,
      found: objects.filter((objet) => objet.statut_id === FOUND_STATUS_ID).length,
      categories: categories.length,
    }
  } finally {
    loading.value = false
  }
})
</script>
