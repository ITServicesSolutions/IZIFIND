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

        <div v-else class="map-layout">
          <!-- Sidebar -->
          <aside class="map-sidebar">
            <div class="sidebar-header">
              <h3>Annuaire ({{ filteredCommissariats.length }})</h3>
            </div>
            
            <div class="search-wrapper">
              <div class="input-with-icon">
                <svg viewBox="0 0 24 24" class="field-icon"><circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="1.8" /><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="1.8" /></svg>
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  class="form-control" 
                  placeholder="Rechercher par nom ou adresse..." 
                />
              </div>
            </div>

            <div class="commissariat-list">
              <div v-if="filteredCommissariats.length === 0" class="empty-list">
                <p>Aucun commissariat trouvé.</p>
              </div>
              <div 
                v-for="commissariat in filteredCommissariats" 
                :key="commissariat.id"
                class="list-item"
                :class="{ 'selected': selectedStation?.id === commissariat.id }"
                @click="selectStation(commissariat)"
              >
                <div class="list-icon-circle" :class="{ 'selected-icon': selectedStation?.id === commissariat.id }">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                  </svg>
                </div>
                <div class="list-item-text">
                  <h4>{{ commissariat.name }}</h4>
                  <p v-if="commissariat.adresse" class="address" :title="commissariat.adresse">{{ commissariat.adresse }}</p>
                </div>
                <div class="list-item-chevron">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline v-if="selectedStation?.id === commissariat.id" points="20 6 9 17 4 12"/>
                    <polyline v-else points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </div>
            </div>
          </aside>

          <!-- Main Map -->
          <div class="map-main">
            <div id="map-container" class="leaflet-map-container"></div>
            
            <!-- Detail Card overlay when a station is selected -->
            <transition name="fade-slide">
              <div v-if="selectedStation" class="detail-card">
                <div class="detail-header">
                  <div class="detail-title-wrapper">
                    <div class="detail-icon-circle">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                    </div>
                    <div class="detail-title-text">
                      <h3 class="text-truncate" :title="selectedStation.name">{{ selectedStation.name }}</h3>
                      <p class="text-truncate" :title="selectedStation.adresse || 'Adresse non renseignée'">{{ selectedStation.adresse || 'Adresse non renseignée' }}</p>
                    </div>
                  </div>
                  <button class="btn-close" @click="selectedStation = null" aria-label="Fermer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                
                <div class="detail-content" v-if="selectedStation.phone">
                  <div class="detail-row">
                    <strong>Téléphone :</strong> 
                    <a :href="'tel:' + selectedStation.phone">{{ selectedStation.phone }}</a>
                  </div>
                </div>

                <div class="detail-actions">
                  <button class="btn-action btn-outline" @click="handleNavigate(selectedStation)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                    </svg>
                    Itinéraire
                  </button>
                  <button class="btn-action btn-outline" @click="handleShare(selectedStation)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                    Partager
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import * as L from 'leaflet'
import { getCommissariats } from '../services/commissariats'
import type { Commissariat } from '../services/types'

// Setup default marker icon for leaflet to avoid 404s
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
})

const commissariats = ref<Commissariat[]>([])
const loading = ref(true)
const error = ref('')
const searchQuery = ref('')
const selectedStation = ref<Commissariat | null>(null)

let map: L.Map | null = null
let markersGroup: L.FeatureGroup | null = null
const INITIAL_CENTER: [number, number] = [48.8566, 2.3522] // Paris
const INITIAL_ZOOM = 12

const filteredCommissariats = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return commissariats.value
  return commissariats.value.filter(c => 
    c.name.toLowerCase().includes(query) || 
    (c.adresse && c.adresse.toLowerCase().includes(query))
  )
})

onMounted(async () => {
  try {
    const data = await getCommissariats()
    commissariats.value = data
    if (data.length > 0) {
      selectedStation.value = data[0]
    }
  } catch (err) {
    console.error(err)
    error.value = 'Impossible de charger les commissariats.'
  } finally {
    loading.value = false
    nextTick(() => {
      initMap()
    })
  }
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})

const initMap = () => {
  if (!document.getElementById('map-container')) return

  const center = selectedStation.value 
    ? [selectedStation.value.latitude, selectedStation.value.longitude] as [number, number]
    : INITIAL_CENTER

  map = L.map('map-container').setView(center, INITIAL_ZOOM)
  
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map)

  markersGroup = L.featureGroup().addTo(map)
  updateMarkers()

  // Try to get user location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        if (map) {
          L.marker([latitude, longitude], {
            icon: L.divIcon({
              className: 'user-location-marker',
              html: `<div style="width:14px;height:14px;background-color:#3b82f6;border-radius:50%;border:2px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.3)"></div>`,
              iconSize: [18, 18],
              iconAnchor: [9, 9]
            })
          }).addTo(map)
        }
      },
      () => {
        // Silently fail if user denies location
      }
    )
  }
}

const updateMarkers = () => {
  if (!map || !markersGroup) return
  
  markersGroup.clearLayers()

  filteredCommissariats.value.forEach(station => {
    const isSelected = selectedStation.value?.id === station.id
    
    // Create a dynamic HTML string for the marker
    const markerHtml = `
      <div style="width: 32px; height: 32px; border-radius: 50%; background-color: ${isSelected ? '#ff6b6b' : 'rgba(244, 149, 23, 0.9)'}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2); border: 2px solid white; transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'}; transition: all 0.2s ease;">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="width: 16px; height: 16px;">
          <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
        </svg>
      </div>
    `

    const marker = L.marker([station.latitude, station.longitude], {
      icon: L.divIcon({
        className: 'custom-leaflet-marker',
        html: markerHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
      })
    })

    marker.on('click', () => {
      selectStation(station)
    })

    marker.addTo(markersGroup!)
  })
}

// Watch for changes in filtered results or selection to redraw markers
watch([filteredCommissariats, selectedStation], () => {
  updateMarkers()
})

const selectStation = (station: Commissariat) => {
  selectedStation.value = station
  if (map) {
    map.flyTo([station.latitude, station.longitude], 15, {
      animate: true,
      duration: 1
    })
  }
}

const handleNavigate = (station: Commissariat) => {
  const url = `https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`
  window.open(url, '_blank')
}

const handleShare = async (station: Commissariat) => {
  const shareData = {
    title: 'IZIFIND - Point de dépôt',
    text: `Retrouvez vos objets au ${station.name}\nAdresse: ${station.adresse || 'Non renseignée'}`,
    url: `https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`,
  }

  try {
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
      alert('Lien copié dans le presse-papiers !')
    }
  } catch (err) {
    console.error('Erreur lors du partage:', err)
  }
}
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
  padding: 2rem 0;
}

.page-subtitle {
  color: var(--color-text-muted);
  font-size: 1.05rem;
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

/* Map Layout */
.map-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1.5rem;
  height: 600px;
  margin-top: 1rem;
}

@media (max-width: 991px) {
  .map-layout {
    grid-template-columns: 1fr;
    height: auto;
    display: flex;
    flex-direction: column-reverse;
  }
}

/* Sidebar */
.map-sidebar {
  background-color: var(--color-surface);
  border-radius: var(--border-radius-card);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

@media (max-width: 991px) {
  .map-sidebar {
    height: 400px;
  }
}

.sidebar-header {
  padding: 1.25rem 1.25rem 0.5rem;
}

.sidebar-header h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-dark);
  margin: 0;
}

.search-wrapper {
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #E2E8F0;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 0.75rem;
  width: 16px;
  height: 16px;
  color: var(--color-text-muted);
}

.search-wrapper .form-control {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 0.9rem;
  background-color: var(--color-bg-alt);
  transition: all 0.2s;
}

.search-wrapper .form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  background-color: #FFF;
  box-shadow: 0 0 0 3px rgba(92, 214, 192, 0.1);
}

.commissariat-list {
  flex: 1;
  overflow-y: auto;
}

.empty-list {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #E2E8F0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.list-item:hover {
  background-color: rgba(26, 26, 46, 0.02);
}

.list-item.selected {
  background-color: rgba(255, 107, 107, 0.04);
}

.list-icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: rgba(244, 149, 23, 0.1);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.list-icon-circle.selected-icon {
  background-color: rgba(255, 107, 107, 0.1);
  color: var(--color-lost);
}

.list-icon-circle svg {
  width: 18px;
  height: 18px;
}

.list-item-text {
  flex: 1;
  min-width: 0;
}

.list-item-text h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-item.selected .list-item-text h4 {
  color: var(--color-lost);
}

.list-item-text .address {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-item-chevron {
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

.list-item.selected .list-item-chevron {
  color: var(--color-lost);
}

.list-item-chevron svg {
  width: 16px;
  height: 16px;
}

/* Map Main */
.map-main {
  position: relative;
  border-radius: var(--border-radius-card);
  overflow: hidden;
  border: 1px solid rgba(26, 26, 46, 0.08);
  box-shadow: 0 4px 20px rgba(26, 26, 46, 0.05);
}

@media (max-width: 991px) {
  .map-main {
    height: 400px;
  }
}

.leaflet-map-container {
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Detail Card Overlay */
.detail-card {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background-color: var(--color-surface);
  border-radius: var(--border-radius-card);
  padding: 1.25rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .detail-card {
    width: 380px;
    right: auto;
  }
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.detail-title-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.detail-icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: rgba(244, 149, 23, 0.15);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.detail-icon-circle svg {
  width: 20px;
  height: 20px;
}

.detail-title-text {
  flex: 1;
  min-width: 0;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-title-text h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-dark);
}

.detail-title-text p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.btn-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-close:hover {
  background-color: rgba(26, 26, 46, 0.05);
  color: var(--color-dark);
}

.btn-close svg {
  width: 20px;
  height: 20px;
}

.detail-content {
  font-size: 0.9rem;
  color: var(--color-dark);
}

.detail-row a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.detail-row a:hover {
  text-decoration: underline;
}

.detail-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid rgba(244, 149, 23, 0.3);
  color: var(--color-primary);
}

.btn-outline:hover {
  background-color: rgba(244, 149, 23, 0.05);
  border-color: var(--color-primary);
}

.btn-action svg {
  width: 16px;
  height: 16px;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
