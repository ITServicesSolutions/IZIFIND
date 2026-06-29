<template>
  <main class="home-view">
    <!-- Premium Hero Section -->
    <section class="hero-section">
      <!-- Background Abstract Shapes -->
      <div class="hero-bg-shape shape-1 animate-float"></div>
      <div class="hero-bg-shape shape-2 animate-float delay-200"></div>
      
      <div class="site-container hero-container">
        <div class="hero-content animate-fade-in-up">
          <h1 class="hero-title">Retrouvez ce que vous avez <span class="highlight-text">perdu</span></h1>
          <p class="hero-subtitle">
            IziFind vous connecte instantanément avec les personnes ayant retrouvé vos objets précieux. Déclarez, recherchez et restituez en toute simplicité.
          </p>
          <div class="hero-ctas">
            <RouterLink to="/declare?type=lost" class="btn-lost btn-hero">
              <svg viewBox="0 0 24 24" class="btn-icon-svg" fill="currentColor">
                <path d="M12 21s-6.5-4.35-6.5-9.5A6.5 6.5 0 0 1 12 5a6.5 6.5 0 0 1 6.5 6.5C18.5 16.65 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.8" />
                <path d="M12 8.2v4.1" fill="none" stroke="currentColor" stroke-width="1.8" />
                <circle cx="12" cy="15.6" r="1" />
              </svg>
              J'ai perdu un objet
            </RouterLink>
            <RouterLink to="/declare?type=found" class="btn-found btn-hero">
              <svg viewBox="0 0 24 24" class="btn-icon-svg" fill="currentColor">
                <path d="M6.5 12.4 10 16l7.5-7.5" fill="none" stroke="currentColor" stroke-width="1.9" />
                <path d="M12 21a9 9 0 1 0-9-9" fill="none" stroke="currentColor" stroke-width="1.8" />
              </svg>
              J'ai trouvé un objet
            </RouterLink>
          </div>
        </div>
        
        <!-- Interactive Search Bar integrated in Hero with Glassmorphism -->
        <div class="search-bar-container glass-panel animate-fade-in-up delay-200">
          <form class="search-form" @submit.prevent="handleSearch">
            <div class="search-field">
              <label for="search-input">Recherche</label>
              <div class="input-with-icon">
                <svg viewBox="0 0 24 24" class="field-icon"><circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="1.8" /><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="1.8" /></svg>
                <input id="search-input" v-model="searchQuery" type="text" placeholder="Ex: Clés, téléphone..." class="form-control" />
                <button type="button" class="btn-voice" @click="toggleVoiceSearch" :class="{ listening: isListening }">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="search-field">
              <label for="category-select">Catégorie</label>
              <div class="input-with-icon">
                <svg viewBox="0 0 24 24" class="field-icon"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
                <select id="category-select" v-model="selectedCategory" class="form-control">
                  <option :value="null">Toutes les catégories</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
            </div>

            <div class="search-field">
              <label for="location-input">Où ?</label>
              <div class="input-with-icon">
                <svg viewBox="0 0 24 24" class="field-icon"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" fill="none" stroke="currentColor" stroke-width="1.8" /></svg>
                <input id="location-input" v-model="locationQuery" type="text" placeholder="Ville, lieu..." class="form-control" />
              </div>
            </div>

            <button type="submit" class="btn-primary btn-search">Rechercher</button>
          </form>
        </div>
      </div>
    </section>

    <!-- Comment ça marche Section -->
    <section id="how-it-works" class="steps-section">
      <div class="site-container">
        <div class="section-header">
          <h2>Comment ça marche ?</h2>
          <p>Retrouver ses affaires n'a jamais été aussi simple</p>
        </div>
        
        <div class="steps-grid">
          <div class="step-card animate-fade-in-up">
            <div class="step-number">1</div>
            <div class="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
              </svg>
            </div>
            <h3>Déclarez l'objet</h3>
            <p>Renseignez les détails, la date et le lieu où l'objet a été perdu ou trouvé en quelques clics.</p>
          </div>

          <div class="step-card animate-fade-in-up delay-100">
            <div class="step-number">2</div>
            <div class="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3>Prouvez la propriété</h3>
            <p>Notre système de matching compare les signalements et vous aide à valider l'appartenance.</p>
          </div>

          <div class="step-card animate-fade-in-up delay-200">
            <div class="step-number">3</div>
            <div class="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="12" cy="12" r="10" />
                <path d="m8 12 3 3 5-5" />
              </svg>
            </div>
            <h3>Récupérez l'objet</h3>
            <p>Une fois validé, organisez la remise en main propre ou déposez-le dans l'un de nos points partenaires.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Statistiques Section -->
    <section class="stats-section">
      <div class="site-container">
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-number">{{ dynamicStats.declared }}</span>
            <span class="stat-label">Objets signalés</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ dynamicStats.returnRate }}%</span>
            <span class="stat-label">Taux de restitution</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ dynamicStats.partners }}</span>
            <span class="stat-label">Partenaires officiels</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Dernières Annonces Section -->
    <section class="latest-annonces">
      <div class="site-container">
        <div class="section-header d-flex justify-content-between align-items-center">
          <div>
            <h2>Derniers signalements</h2>
            <p>Consultez les objets récemment déclarés dans votre région</p>
          </div>
          <RouterLink to="/catalog" class="btn-primary btn-outline">Voir tout</RouterLink>
        </div>

        <div v-if="loading" class="loading-grid">
          <div v-for="n in 6" :key="n" class="skeleton-card skeleton-loader"></div>
        </div>
        <div v-else-if="latestObjects.length === 0" class="empty-state">
          <p>Aucun objet disponible pour le moment.</p>
        </div>
        <div v-else class="annonces-grid">
          <div v-for="obj in latestObjects" :key="obj.id" class="grid-item">
            <AnnonceCard :object="obj" @click="openDetailModal" />
          </div>
        </div>
      </div>
    </section>

    <!-- Partenaires Strip -->
    <section class="partners-section">
      <div class="site-container">
        <h4 class="partners-title">Ils nous font confiance</h4>
        <div class="partners-strip">
          <img :src="client1" alt="Partenaire" />
          <img :src="client2" alt="Partenaire" />
          <img :src="client3" alt="Partenaire" />
          <img :src="client4" alt="Partenaire" />
          <img :src="client5" alt="Partenaire" />
          <img :src="client6" alt="Partenaire" />
        </div>
      </div>
    </section>

    <!-- Premium Detail Modal -->
    <div v-if="selectedObject" class="modal-backdrop" @click.self="closeDetailModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Détail de l'objet</h3>
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
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { getObjects } from '../services/objets'
import { getCategories } from '../services/categories'
import { getStatistics } from '../services/statistics'
import type { ObjectRecord, Category, Statistics } from '../services/types'
import AnnonceCard from '../components/AnnonceCard.vue'
import Swal from 'sweetalert2'

// Import legacy partner assets
import client1 from '../assets/legacy/img/clients/client-1.png'
import client2 from '../assets/legacy/img/clients/client-2.png'
import client3 from '../assets/legacy/img/clients/client-3.png'
import client4 from '../assets/legacy/img/clients/client-4.png'
import client5 from '../assets/legacy/img/clients/client-5.png'
import client6 from '../assets/legacy/img/clients/client-6.png'

const router = useRouter()

const objects = ref<ObjectRecord[]>([])
const categories = ref<Category[]>([])
const statistics = ref<Statistics | null>(null)
const loading = ref(true)

// Search fields
const searchQuery = ref('')
const selectedCategory = ref<number | null>(null)
const locationQuery = ref('')

// Voice search
const isListening = ref(false)
const recognition = ref<any>(null)

// Modal state
const selectedObject = ref<ObjectRecord | null>(null)

const latestObjects = computed(() => {
  // Return the 6 most recent public objects
  return [...objects.value].slice(0, 6)
})

const dynamicStats = computed(() => {
  return {
    declared: statistics.value ? statistics.value.perdus + statistics.value.trouves : 542,
    returnRate: 82, // Default value since we don't have exact restitution data yet
    partners: statistics.value?.postes || 20
  }
})

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
      searchQuery.value = transcript
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
    const [objsData, catsData, statsData] = await Promise.all([
      getObjects({ limit: 6 }),
      getCategories(),
      getStatistics()
    ])
    objects.value = objsData
    categories.value = catsData
    statistics.value = statsData
  } catch (err) {
    console.error('Error loading home data:', err)
  } finally {
    loading.value = false
  }
})

const toggleVoiceSearch = () => {
  if (!recognition.value) {
    Swal.fire({
      icon: 'info',
      title: 'Recherche vocale non supportée',
      text: 'Votre navigateur ne permet pas l\'utilisation de la recherche vocale. Veuillez utiliser la recherche textuelle.',
      confirmButtonColor: '#f49517'
    })
    return
  }

  if (isListening.value) {
    recognition.value.stop()
    isListening.value = false
  } else {
    recognition.value.start()
    isListening.value = true
  }
}

const handleSearch = () => {
  router.push({
    path: '/catalog',
    query: {
      q: searchQuery.value || undefined,
      cat: selectedCategory.value || undefined,
      loc: locationQuery.value || undefined
    }
  })
}

const openDetailModal = (id: number) => {
  const obj = objects.value.find(o => o.id === id)
  if (obj) {
    selectedObject.value = obj
  }
}

const closeDetailModal = () => {
  selectedObject.value = null
}
</script>

<style scoped>
/* Hero section styling */
.hero-section {
  background: radial-gradient(circle at 10% 20%, rgba(244, 149, 23, 0.08) 0%, rgba(255, 255, 255, 0) 90%),
              radial-gradient(circle at 90% 80%, rgba(11, 184, 146, 0.08) 0%, rgba(255, 255, 255, 0) 90%);
  padding: 6rem 0 8rem;
  position: relative;
  overflow: hidden;
}

/* Background Abstract Shapes */
.hero-bg-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  z-index: 0;
  opacity: 0.6;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: rgba(244, 149, 23, 0.2);
  top: -100px;
  right: -100px;
}

.shape-2 {
  width: 300px;
  height: 300px;
  background: rgba(11, 184, 146, 0.2);
  bottom: -50px;
  left: -50px;
}

.hero-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 3.5rem;
  position: relative;
  z-index: 1;
}

.hero-content {
  max-width: 850px;
}

.hero-title {
  font-size: 4rem;
  line-height: 1.15;
  margin-bottom: 1.5rem;
  font-weight: 800;
  color: var(--color-dark);
  letter-spacing: -1px;
}

.highlight-text {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin-bottom: 3rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.hero-ctas {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

.btn-hero {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  gap: 0.75rem;
}

.btn-icon-svg {
  width: 22px;
  height: 22px;
}

/* Search bar inside Hero */
.search-bar-container {
  width: 100%;
  max-width: 1000px;
  border-radius: var(--border-radius-btn);
  padding: 0.75rem;
}

.search-form {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 0.8fr;
  gap: 0.5rem;
  align-items: center;
}

.search-field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0 1rem;
  border-right: 1px solid var(--color-border);
}

.search-field:nth-child(3) {
  border-right: none;
}

.search-field label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-dark);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.input-with-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.field-icon {
  width: 16px;
  height: 16px;
  color: var(--color-text-muted);
  flex-shrink: 0;
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

.search-field .form-control {
  border: none;
  padding: 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 500;
  background-color: transparent;
  color: var(--color-dark);
}

.search-field .form-control:focus {
  box-shadow: none;
}

.btn-search {
  height: 100%;
  width: 100%;
  border-radius: var(--border-radius-btn);
  padding: 0.75rem;
}

@media (max-width: 768px) {
  .search-form {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1rem;
  }
  
  .search-field {
    border-right: none;
    border-bottom: 1px solid #E2E8F0;
    padding: 0 0 1rem 0;
  }
}

/* Steps section styling */
.steps-section {
  padding: 5rem 0;
  background-color: var(--color-bg-alt);
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-header h2 {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 0.75rem;
}

.section-header p {
  font-size: 1.1rem;
  color: var(--color-text-muted);
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;
}

@media (max-width: 768px) {
  .steps-grid {
    grid-template-columns: 1fr;
  }
}

.step-card {
  background-color: #FFFFFF;
  border-radius: var(--border-radius-card);
  padding: 2.5rem 2rem;
  text-align: center;
  position: relative;
  box-shadow: 0 4px 15px rgba(26, 26, 46, 0.02);
  border: 1px solid rgba(26, 26, 46, 0.04);
}

.step-number {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  background-color: var(--color-primary);
  color: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 4px 10px rgba(92, 214, 192, 0.3);
}

.step-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 1.5rem;
  background-color: rgba(92, 214, 192, 0.08);
  color: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-icon svg {
  width: 28px;
  height: 28px;
}

.step-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.step-card p {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  line-height: 1.6;
}

/* Statistics section styling */
.stats-section {
  background-color: var(--color-dark);
  color: #FFFFFF;
  padding: 4rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  text-align: center;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-number {
  font-size: 3.5rem;
  font-weight: 700;
  color: var(--color-primary);
  font-family: 'Poppins', sans-serif;
  line-height: 1;
}

.stat-label {
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

/* Latest Annonces styling */
.latest-annonces {
  padding: 6rem 0;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary) !important;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
}

.btn-outline:hover {
  background-color: var(--color-primary);
  color: #FFFFFF !important;
}

.annonces-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 2.5rem;
}

@media (max-width: 991px) {
  .annonces-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 575px) {
  .annonces-grid {
    grid-template-columns: 1fr;
  }
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 2.5rem;
}

.skeleton-card {
  height: 320px;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: var(--color-text-muted);
}

/* Partners strip styling */
.partners-section {
  padding: 4rem 0;
  border-top: 1px solid #E2E8F0;
}

.partners-title {
  text-align: center;
  font-size: 0.95rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 2.5rem;
}

.partners-strip {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.partners-strip img {
  max-height: 40px;
  opacity: 0.6;
  filter: grayscale(100%);
  transition: var(--transition-smooth);
}

.partners-strip img:hover {
  opacity: 1;
  filter: none;
}

/* Modal styling */
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
