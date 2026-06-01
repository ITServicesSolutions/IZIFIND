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

      <section class="admin-card" style="grid-column: 1 / -1;">
        <div class="page-header" style="margin-bottom: 1rem;">
          <h2>Actions rapides</h2>
          <p class="page-subtitle">Acces direct aux operations les plus frequentes de l'administration.</p>
        </div>
        <div class="chip-row">
          <RouterLink to="/admin/categories" class="admin-outline-btn">Creer une categorie</RouterLink>
          <RouterLink to="/admin/roles" class="admin-outline-btn">Creer un role</RouterLink>
          <RouterLink to="/catalog" class="admin-outline-btn">Consulter le catalogue public</RouterLink>
        </div>
      </section>

      <section class="admin-card" style="grid-column: 1 / -1;">
        <div class="page-header page-header--left" style="margin-bottom: 1rem;">
          <h2>Menus des tables</h2>
          <p class="page-subtitle">Acces direct a toutes les tables administrables ou referencees par la plateforme.</p>
        </div>
        <div class="admin-nav-grid">
          <RouterLink
            v-for="item in adminMenus"
            :key="item.path"
            :to="item.path"
            class="admin-nav-card"
          >
            <AdminIcon :name="item.icon" />
            <h4>{{ item.label }}</h4>
            <p>{{ item.subtitle }}</p>
          </RouterLink>
          <div class="admin-nav-card admin-nav-card--disabled">
            <AdminIcon name="users" />
            <h4>Utilisateurs</h4>
            <p>Le backend n’expose pas encore de liste publique des comptes.</p>
          </div>
        </div>
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
import AdminIcon from '../../components/admin/AdminIcon.vue'
import { ADMIN_MENU_RESOURCES } from '../../services/adminResources'
import laptopImage from '../../assets/legacy/admin/illustrations/man-with-laptop-light.png'
import chartIcon from '../../assets/legacy/admin/icons/chart-success.png'
import walletIcon from '../../assets/legacy/admin/icons/wallet-info.png'
import paypalIcon from '../../assets/legacy/admin/icons/paypal.png'
import cardIcon from '../../assets/legacy/admin/icons/cc-primary.png'

const authStore = useAuthStore()
const loading = ref(true)
const stats = ref({ total: 0, lost: 0, found: 0, categories: 0 })
const adminMenus = ADMIN_MENU_RESOURCES

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
