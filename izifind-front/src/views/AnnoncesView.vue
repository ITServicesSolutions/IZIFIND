<template>
  <main class="annonces-page">
    <section class="breadcrumbs">
      <div class="site-container">
        <ol class="breadcrumb-list">
          <li><RouterLink to="/">Accueil</RouterLink></li>
          <li class="active">Annonces</li>
        </ol>
      </div>
    </section>

    <section class="catalog-section">
      <div class="site-container">
        <div class="page-header--left mb-4">
          <h2>Rechercher un objet perdu ou trouvé</h2>
          <p class="page-subtitle">Parcourez les annonces publiées par notre communauté pour retrouver vos effets personnels.</p>
        </div>

        <div class="catalog-layout">
          <!-- Sidebar Filters -->
          <aside class="filters-sidebar">
            <div class="sidebar-header">
              <h3>Filtres</h3>
              <button class="btn-reset" @click="resetFilters">Réinitialiser</button>
            </div>

            <!-- Search Field -->
            <div class="filter-group">
              <label for="search">Recherche textuelle</label>
              <div class="input-with-icon">
                <svg viewBox="0 0 24 24" class="field-icon"><circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="1.8" /><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="1.8" /></svg>
                <input 
                  id="search"
                  v-model="filters.query" 
                  type="text" 
                  class="form-control" 
                  placeholder="Description, mots clés..." 
                />
                <button type="button" class="btn-voice" @click="toggleVoiceSearch" :class="{ listening: isListening }">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Status Filter -->
            <div class="filter-group">
              <label>Statut</label>
              <div class="radio-buttons">
                <label class="radio-btn">
                  <input v-model="filters.status" type="radio" value="all" />
                  <span>Tous</span>
                </label>
                <label class="radio-btn">
                  <input v-model="filters.status" type="radio" value="lost" />
                  <span class="lost-indicator">Perdus</span>
                </label>
                <label class="radio-btn">
                  <input v-model="filters.status" type="radio" value="found" />
                  <span class="found-indicator">Trouvés</span>
                </label>
              </div>
            </div>

            <!-- Category Filter -->
            <div class="filter-group">
              <label for="category">Catégorie</label>
              <select id="category" v-model="filters.category" class="form-control">
                <option :value="null">Toutes les catégories</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <!-- Location Filter -->
            <div class="filter-group">
              <label for="location">Lieu / Ville</label>
              <input 
                id="location"
                v-model="filters.location" 
                type="text" 
                class="form-control" 
                placeholder="Ex: Paris, Métro..." 
              />
            </div>

            <!-- Date Filter -->
            <div class="filter-group">
              <label for="date">Date de signalement</label>
              <input 
                id="date"
                v-model="filters.date" 
                type="date" 
                class="form-control" 
              />
            </div>
          </aside>

          <!-- Main Grid -->
          <div class="catalog-main">
            <!-- Loading and Error messages -->
            <div v-if="error" class="alert-error">{{ error }}</div>
            
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>Chargement des annonces...</p>
            </div>
            
            <div v-else-if="objets.length === 0" class="empty-state">
              <svg viewBox="0 0 24 24" class="empty-icon"><circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="1.8" /><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="1.8" /></svg>
              <h3>Aucun résultat</h3>
              <p>Aucune annonce ne correspond à vos critères de recherche. Essayez d'élargir vos filtres.</p>
              <button class="btn-primary" @click="resetFilters">Réinitialiser les filtres</button>
            </div>

            <div v-else>
              <p class="results-count"><strong>{{ objets.length }}</strong> annonces trouvées</p>
              <div class="annonces-grid">
                <div v-for="objet in objets" :key="objet.id" class="grid-item">
                  <AnnonceCard :object="objet" @click="openDetailModal" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Detail Modal -->
    <div v-if="selectedObject" class="modal-backdrop" @click.self="closeDetailModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Détail de l'annonce</h3>
          <button class="close-btn" @click="closeDetailModal" aria-label="Fermer le modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="modal-image-placeholder">
            <svg viewBox="0 0 24 24" class="modal-placeholder-icon">
              <path d="M12 21s-6.5-4.35-6.5-9.5A6.5 6.5 0 0 1 12 5a6.5 6.5 0 0 1 6.5 6.5C18.5 16.65 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.8" />
            </svg>
          </div>
          <div class="modal-details">
            <span :class="['status-badge', selectedObject.statut_id === 1 ? 'badge-lost' : 'badge-found']">
              {{ selectedObject.statut_id === 1 ? 'Perdu' : 'Trouvé' }}
            </span>
            <h4 class="modal-description">{{ selectedObject.description }}</h4>
            <div class="detail-row"><strong>Lieu :</strong> <span>{{ selectedObject.lieu || 'Non précisé' }}</span></div>
            <div class="detail-row"><strong>Date :</strong> <span>{{ new Date(selectedObject.date_action).toLocaleDateString() }}</span></div>
            <div v-if="selectedObject.recompense" class="detail-row highlight">
              <strong>Récompense :</strong> <span>{{ selectedObject.recompense }} €</span>
            </div>
            
            <div class="contact-section">
              <h5>Coordonnées de contact</h5>
              <div v-if="selectedObject.contact_phone" class="detail-row"><strong>Téléphone :</strong> <span>{{ selectedObject.contact_phone }}</span></div>
              <div v-if="selectedObject.contact_email" class="detail-row"><strong>Email :</strong> <span>{{ selectedObject.contact_email }}</span></div>
              <div v-if="!selectedObject.contact_phone && !selectedObject.contact_email" class="detail-row muted">
                Connectez-vous pour réclamer cet objet.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getObjects, LOST_STATUS_ID, FOUND_STATUS_ID, type GetObjectsParams } from '../services/objets'
import { getCategories } from '../services/categories'
import type { ObjectRecord, Category } from '../services/types'
import AnnonceCard from '../components/AnnonceCard.vue'

const route = useRoute()

const objets = ref<ObjectRecord[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref('')
const selectedObject = ref<ObjectRecord | null>(null)

const filters = ref({
  query: '',
  status: 'all' as 'all' | 'lost' | 'found',
  category: null as number | null,
  location: '',
  date: ''
})

// Voice search
const isListening = ref(false)
const recognition = ref<any>(null)

onMounted(async () => {
  // Initialize speech recognition if available
  if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    recognition.value = new SpeechRecognition()
    recognition.value.continuous = false
    recognition.value.interimResults = false
    recognition.value.lang = 'fr-FR'

    recognition.value.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      filters.value.query = transcript
      isListening.value = false
    }

    recognition.value.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      isListening.value = false
    }

    recognition.value.onend = () => {
      isListening.value = false
    }
  }

  try {
    const catsData = await getCategories()
    categories.value = catsData
    parseQueryParams()
    await fetchObjects()
  } catch (err) {
    console.error(err)
    error.value = 'Impossible de charger le catalogue des objets.'
  }
})

const toggleVoiceSearch = () => {
  if (!recognition.value) return

  if (isListening.value) {
    recognition.value.stop()
    isListening.value = false
  } else {
    recognition.value.start()
    isListening.value = true
  }
}

// Read query params from route on load
const parseQueryParams = () => {
  if (route.query.q) filters.value.query = String(route.query.q)
  if (route.query.cat) filters.value.category = Number(route.query.cat)
  if (route.query.loc) filters.value.location = String(route.query.loc)
}

const fetchObjects = async () => {
  const params: GetObjectsParams = {}
  
  if (filters.value.query) {
    params.search = filters.value.query
  }
  if (filters.value.category) {
    params.categorie = filters.value.category
  }
  if (filters.value.status === 'lost') {
    params.statut = LOST_STATUS_ID
  } else if (filters.value.status === 'found') {
    params.statut = FOUND_STATUS_ID
  }
  
  try {
    loading.value = true
    error.value = ''
    const objsData = await getObjects(params)
    // For location and date, we still filter locally since backend doesn't support it yet
    let filtered = objsData
    const locNeedle = filters.value.location.trim().toLowerCase()
    if (locNeedle) {
      filtered = filtered.filter(objet => (objet.lieu ?? '').toLowerCase().includes(locNeedle))
    }
    if (filters.value.date) {
      filtered = filtered.filter(objet => objet.date_action.startsWith(filters.value.date))
    }
    objets.value = filtered
  } catch (err) {
    console.error(err)
    error.value = 'Impossible de charger le catalogue des objets.'
  } finally {
    loading.value = false
  }
}

// Watch route query parameters to update filters dynamically
watch(() => route.query, () => {
  parseQueryParams()
  fetchObjects()
}, { deep: true })

// Watch filter changes
watch(filters, () => {
  fetchObjects()
}, { deep: true })

const resetFilters = () => {
  filters.value = {
    query: '',
    status: 'all',
    category: null,
    location: '',
    date: ''
  }
}

const openDetailModal = (id: number) => {
  const obj = objets.value.find(o => o.id === id)
  if (obj) {
    selectedObject.value = obj
  }
}

const closeDetailModal = () => {
  selectedObject.value = null
}
</script>

<style scoped>
.annonces-page {
  background-color: #FCFDFD;
  min-height: 100vh;
  padding-bottom: 4rem;
}

/* Breadcrumbs */
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

/* Page Header */
.page-subtitle {
  color: var(--color-text-muted);
  font-size: 1.05rem;
  max-width: 700px;
}

/* Layout Grid and Sidebar */
.catalog-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2.5rem;
  margin-top: 2rem;
}

@media (max-width: 991px) {
  .catalog-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

/* Sidebar styling */
.filters-sidebar {
  background-color: #FFFFFF;
  border-radius: var(--border-radius-card);
  border: 1px solid rgba(26, 26, 46, 0.05);
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(26, 26, 46, 0.02);
  align-self: start;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #F1F5F9;
  padding-bottom: 0.75rem;
}

.sidebar-header h3 {
  font-size: 1.15rem;
  margin: 0;
}

.btn-reset {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-reset:hover {
  text-decoration: underline;
}

.filter-group {
  margin-bottom: 1.5rem;
}

.filter-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-dark);
  margin-bottom: 0.5rem;
}

.input-with-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  position: relative;
}

.field-icon {
  width: 16px;
  height: 16px;
  color: var(--color-text-muted);
  flex-shrink: 0;
  position: absolute;
  left: 0.75rem;
}

.input-with-icon .form-control {
  padding-left: 2.5rem;
}

.btn-voice {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  color: var(--color-text-muted);
  flex-shrink: 0;
  border-radius: 50%;
  transition: all 0.2s ease;
  position: absolute;
  right: 0.75rem;
}

.btn-voice:hover {
  background: rgba(92, 214, 192, 0.1);
  color: var(--color-primary);
}

.btn-voice.listening {
  color: var(--color-primary);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.btn-voice svg {
  width: 20px;
  height: 20px;
}

/* Radio button tabs */
.radio-buttons {
  display: flex;
  background-color: var(--color-bg-alt);
  border-radius: 8px;
  padding: 0.25rem;
  border: 1px solid #E2E8F0;
}

.radio-btn {
  flex: 1;
  text-align: center;
  cursor: pointer;
  margin: 0;
}

.radio-btn input {
  display: none;
}

.radio-btn span {
  display: block;
  padding: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 6px;
  transition: var(--transition-smooth);
  color: var(--color-text-muted);
}

.radio-btn input:checked + span {
  background-color: #FFFFFF;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  color: var(--color-dark);
}

.radio-btn input:checked + .lost-indicator {
  color: var(--color-lost);
}

.radio-btn input:checked + .found-indicator {
  color: var(--color-primary);
}

/* Results section */
.results-count {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
}

.annonces-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

@media (max-width: 1200px) {
  .annonces-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 575px) {
  .annonces-grid {
    grid-template-columns: 1fr;
  }
}

.alert-error {
  background-color: #FFF0F0;
  color: var(--color-lost);
  border: 1px solid rgba(255, 107, 107, 0.2);
  padding: 1rem;
  border-radius: var(--border-radius-card);
  margin-bottom: 1.5rem;
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

.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  background-color: #FFFFFF;
  border-radius: var(--border-radius-card);
  border: 1px solid rgba(26, 26, 46, 0.05);
  color: var(--color-text-muted);
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1.5rem;
  color: #CBD5E0;
}

.empty-state h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* Modal styling copy */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(26, 26, 46, 0.5);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-card {
  background-color: #FFFFFF;
  border-radius: var(--border-radius-card);
  max-width: 680px;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(26, 26, 46, 0.2);
  border: 1px solid rgba(26, 26, 46, 0.05);
  animation: modalPop 0.25s ease;
}

@keyframes modalPop {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
  color: var(--color-text-muted);
}

.modal-body {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 2rem;
  padding: 2rem;
}

@media (max-width: 575px) {
  .modal-body {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.modal-image-placeholder {
  background-color: var(--color-bg-alt);
  border-radius: var(--border-radius-card);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 220px;
}

.modal-placeholder-icon {
  width: 64px;
  height: 64px;
  color: var(--color-primary);
  opacity: 0.6;
}

.modal-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

.modal-description {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0.5rem 0 1rem 0;
  color: var(--color-dark);
}

.detail-row {
  font-size: 0.95rem;
  display: flex;
  gap: 0.5rem;
}

.detail-row.highlight {
  background-color: rgba(245, 166, 35, 0.08);
  padding: 0.4rem 0.8rem;
  border-radius: var(--border-radius-card);
  color: var(--color-reward);
  border: 1px solid rgba(245, 166, 35, 0.2);
}

.contact-section {
  margin-top: 1.5rem;
  border-top: 1px solid #E2E8F0;
  padding-top: 1rem;
  width: 100%;
}

.contact-section h5 {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}
</style>
