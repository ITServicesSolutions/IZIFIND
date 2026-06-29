<template>
  <article class="annonce-card" @click="handleCardClick">
    <div class="card-image-wrapper">
      <!-- Status Badge -->
      <span :class="['status-badge', isLost ? 'badge-lost' : 'badge-found']">
        {{ isLost ? 'Perdu' : 'Trouvé' }}
      </span>

      <!-- Category Icon Centered as Placeholder -->
      <div class="category-icon-container" :style="{ backgroundColor: isLost ? 'rgba(255, 107, 107, 0.05)' : 'rgba(92, 214, 192, 0.05)' }">
        <svg v-if="categorieId === 1" viewBox="0 0 24 24" class="category-svg" :style="{ color: isLost ? 'var(--color-lost)' : 'var(--color-primary)' }">
          <!-- Electronic icon: Mobile phone and tablet outline -->
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="1.8" />
          <path d="M12 18h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <svg v-else-if="categorieId === 2" viewBox="0 0 24 24" class="category-svg" :style="{ color: isLost ? 'var(--color-lost)' : 'var(--color-primary)' }">
          <!-- Documents icon: Folder / File with lines -->
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" stroke-width="1.8" />
          <polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" stroke-width="1.8" />
          <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="1.8" />
          <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="1.8" />
          <polyline points="10 9 9 9 8 9" stroke="currentColor" stroke-width="1.8" />
        </svg>
        <svg v-else viewBox="0 0 24 24" class="category-svg" :style="{ color: isLost ? 'var(--color-lost)' : 'var(--color-primary)' }">
          <!-- Generic icon: Box outline -->
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" fill="none" stroke="currentColor" stroke-width="1.8" />
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" fill="none" stroke="currentColor" stroke-width="1.8" />
        </svg>
      </div>
    </div>

    <div class="card-content">
      <div class="card-meta-category">
        {{ categoryName }}
      </div>
      <h4 class="card-title">{{ object.description }}</h4>
      
      <div class="card-details">
        <div class="detail-item">
          <svg viewBox="0 0 24 24" class="detail-icon" aria-hidden="true">
            <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" fill="none" stroke="currentColor" stroke-width="1.8" />
            <circle cx="12" cy="10" r="3" fill="none" stroke="currentColor" stroke-width="1.8" />
          </svg>
          <span>{{ object.lieu || 'Non précisé' }}</span>
        </div>
        <div class="detail-item">
          <svg viewBox="0 0 24 24" class="detail-icon" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="1.8" />
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="1.8" />
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="1.8" />
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="1.8" />
          </svg>
          <span>{{ formattedDate }}</span>
        </div>
      </div>

      <div class="card-footer">
        <button class="btn-voir" aria-label="Voir le détail de l'annonce">Voir</button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LOST_STATUS_ID } from '../services/objets'
import type { ObjectRecord } from '../services/types'

const props = defineProps<{
  object: ObjectRecord
}>()

const emit = defineEmits<{
  (e: 'click', id: number): void
}>()

const isLost = computed(() => props.object.statut_id === LOST_STATUS_ID)
const categorieId = computed(() => props.object.categorie_id)

const categoryName = computed(() => {
  if (props.object.categorie_id === 1) return 'Électronique'
  if (props.object.categorie_id === 2) return 'Documents'
  return 'Autre objet'
})

const formattedDate = computed(() => {
  if (!props.object.date_action) return 'Date inconnue'
  try {
    return new Date(props.object.date_action).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return props.object.date_action
  }
})

const handleCardClick = () => {
  emit('click', props.object.id)
}
</script>

<style scoped>
.annonce-card {
  background-color: var(--color-bg);
  border-radius: var(--border-radius-card);
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(26, 26, 46, 0.04);
  border: 1px solid rgba(26, 26, 46, 0.06);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  height: 100%;
}

.annonce-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: rgba(244, 149, 23, 0.2);
}

.annonce-card:hover .btn-voir {
  background: var(--gradient-primary);
  color: #FFFFFF;
  border-color: transparent;
  box-shadow: var(--shadow-glow);
}

.card-image-wrapper {
  position: relative;
  height: 160px;
  background-color: var(--color-bg-alt);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
}

.category-icon-container {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.annonce-card:hover .category-icon-container {
  transform: scale(1.05);
}

.category-svg {
  width: 32px;
  height: 32px;
}

.card-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.card-meta-category {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.card-title {
  font-size: 1.05rem;
  color: var(--color-dark);
  font-weight: 600;
  margin-bottom: 1rem;
  line-height: 1.4;
  height: 2.8rem; /* Fix height for alignment */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-details {
  margin-bottom: 1.25rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.card-footer {
  margin-top: auto;
  border-top: 1px solid #F1F5F9;
  padding-top: 1rem;
}

.btn-voir {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid var(--color-primary);
  background-color: transparent;
  color: var(--color-primary);
  font-weight: 600;
  border-radius: var(--border-radius-btn);
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition-smooth);
}
</style>
