<template>
  <main>
    <section class="breadcrumbs">
      <div class="site-container">
        <ol>
          <li><RouterLink to="/">Accueil</RouterLink></li>
          <li>Objets</li>
        </ol>
      </div>
    </section>

    <section class="catalog-section">
      <div class="site-container">
        <div class="section-title">
          <h2>Objets publics</h2>
          <p>Parcourez les objets recemment perdus ou trouves signales publiquement.</p>
        </div>

        <div class="legacy-filter">
          <input v-model="query" class="form-control" type="search" placeholder="Rechercher par description ou lieu" />
          <select v-model="statusFilter" class="form-control">
            <option value="all">Tous les statuts</option>
            <option value="lost">Objets perdus</option>
            <option value="found">Objets trouves</option>
          </select>
        </div>

        <div v-if="error" class="legacy-alert">{{ error }}</div>
        <div v-if="loading" class="legacy-alert">Chargement des objets...</div>
        <div v-else-if="filteredObjects.length === 0" class="legacy-alert">Aucun objet public ne correspond a cette recherche.</div>

        <div v-else class="catalog-grid">
          <article v-for="objet in filteredObjects" :key="objet.id" class="object-card">
            <span class="object-status">{{ objet.statut_id === LOST_STATUS_ID ? 'Perdu' : 'Trouve' }}</span>
            <h4>{{ objet.description }}</h4>
            <p>Lieu: {{ objet.lieu || 'Non precise' }}</p>
            <p>Date: {{ new Date(objet.date_action).toLocaleDateString() }}</p>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { FOUND_STATUS_ID, LOST_STATUS_ID, getObjects } from '../../services/objets'
import type { ObjectRecord } from '../../services/types'

const objets = ref<ObjectRecord[]>([])
const loading = ref(true)
const error = ref('')
const query = ref('')
const statusFilter = ref<'all' | 'lost' | 'found'>('all')

const filteredObjects = computed(() => {
  const needle = query.value.trim().toLowerCase()

  return objets.value.filter((objet) => {
    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'lost' && objet.statut_id === LOST_STATUS_ID) ||
      (statusFilter.value === 'found' && objet.statut_id === FOUND_STATUS_ID)
    const haystack = `${objet.description} ${objet.lieu ?? ''}`.toLowerCase()
    return matchesStatus && (!needle || haystack.includes(needle))
  })
})

onMounted(async () => {
  try {
    objets.value = await getObjects()
  } catch (err) {
    console.error(err)
    error.value = 'Impossible de charger le catalogue pour le moment.'
  } finally {
    loading.value = false
  }
})
</script>
