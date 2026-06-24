<template>
  <main class="map-page">
    <section class="breadcrumbs">
      <div class="site-container">
        <ol class="breadcrumb-list">
          <li><RouterLink to="/">Accueil</RouterLink></li>
          <li class="active">Carte</li>
        </ol>
      </div>
    </section>

    <section class="map-section">
      <div class="site-container">
        <div class="page-header--left mb-4">
          <h2>Carte des commissariats partenaires</h2>
          <p class="page-subtitle">Trouvez le point de dépôt le plus proche de vous.</p>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Chargement des commissariats...</p>
        </div>

        <div v-else-if="error" class="alert-error">{{ error }}</div>

        <div v-else class="commissariats-grid">
          <div v-for="commissariat in commissariats" :key="commissariat.id" class="commissariat-card">
            <div class="commissariat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
              </svg>
            </div>
            <h3>{{ commissariat.name }}</h3>
            <p v-if="commissariat.address" class="commissariat-address">{{ commissariat.address }}</p>
            <p v-if="commissariat.phone" class="commissariat-phone">
              <a :href="'tel:' + commissariat.phone">{{ commissariat.phone }}</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getCommissariats } from '../services/commissariats'
import type { Commissariat } from '../services/types'

const commissariats = ref<Commissariat[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const data = await getCommissariats()
    commissariats.value = data
  } catch (err) {
    console.error(err)
    error.value = 'Impossible de charger les commissariats.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.map-page {
  background-color: #FCFDFD;
  min-height: 100vh;
  padding-bottom: 4rem;
}

.breadcrumbs {
  background-color: var(--color-bg-alt);
  padding: 0.75rem 0;
  font-size: 0.85rem;
  border-bottom: 1px solid rgba(26, 26, 46, 0.03);
}

.breadcrumb-list {
  display: flex;
  list-style: none;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  color: var(--color-text-muted);
}

.breadcrumb-list li a {
  color: var(--color-text-muted);
}

.breadcrumb-list li.active {
  color: var(--color-primary);
  font-weight: 500;
}

.breadcrumb-list li + li:before {
  content: "/";
  padding-right: 0.5rem;
  color: #CBD5E0;
}

.map-section {
  padding: 3rem 0;
}

.commissariats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.commissariat-card {
  background-color: #FFFFFF;
  border-radius: var(--border-radius-card);
  padding: 2rem;
  border: 1px solid rgba(26, 26, 46, 0.05);
  box-shadow: 0 4px 15px rgba(26, 26, 46, 0.02);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
  text-align: center;
}

.commissariat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: rgba(92, 214, 192, 0.1);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.commissariat-icon svg {
  width: 28px;
  height: 28px;
}

.commissariat-card h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-dark);
}

.commissariat-address {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.commissariat-phone {
  margin: 0;
  font-weight: 500;
}

.commissariat-phone a {
  color: var(--color-primary);
  text-decoration: none;
}

.commissariat-phone a:hover {
  text-decoration: underline;
}

.loading-state {
  text-align: center;
  padding: 5rem 0;
  color: var(--color-text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(92, 214, 192, 0.1);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.alert-error {
  background-color: #FFF0F0;
  color: var(--color-lost);
  border: 1px solid rgba(255, 107, 107, 0.2);
  padding: 1rem;
  border-radius: var(--border-radius-card);
  margin-bottom: 1.5rem;
  text-align: center;
}
</style>
