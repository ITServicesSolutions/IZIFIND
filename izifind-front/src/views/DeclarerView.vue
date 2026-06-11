<template>
  <main class="declare-page">
    <section class="breadcrumbs">
      <div class="site-container">
        <ol class="breadcrumb-list">
          <li><RouterLink to="/">Accueil</RouterLink></li>
          <li class="active">Déclarer un objet</li>
        </ol>
      </div>
    </section>

    <section class="declaration-wizard-section">
      <div class="site-container wizard-container">
        <div class="wizard-header text-center mb-4">
          <h2>Signaler un objet</h2>
          <p>Suivez les étapes ci-dessous pour enregistrer votre déclaration.</p>
        </div>

        <!-- Progress Tracker -->
        <div class="stepper-progress">
          <div class="progress-bar-background">
            <div class="progress-bar-fill" :style="{ width: progressPercentage }"></div>
          </div>
          <ul class="steps-indicators">
            <li 
              v-for="step in steps" 
              :key="step.number" 
              :class="{ 
                'active': currentStep === step.number, 
                'completed': currentStep > step.number 
              }"
            >
              <button type="button" class="step-indicator-btn" :disabled="currentStep < step.number" @click="currentStep = step.number">
                <span class="step-num">{{ step.number }}</span>
                <span class="step-name">{{ step.label }}</span>
              </button>
            </li>
          </ul>
        </div>

        <div class="wizard-card card">
          <form @submit.prevent="submitForm">
            <!-- STEP 1: Lost or Found -->
            <section v-if="currentStep === 1" class="step-section">
              <h3 class="step-title text-center">De quel type de signalement s'agit-il ?</h3>
              <div class="type-selection-grid">
                <div 
                  :class="['selection-card lost-card', { 'selected': form.statut_id === LOST_STATUS_ID }]"
                  @click="selectStatus(LOST_STATUS_ID)"
                >
                  <div class="selection-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path d="M12 21s-6.5-4.35-6.5-9.5A6.5 6.5 0 0 1 12 5a6.5 6.5 0 0 1 6.5 6.5C18.5 16.65 12 21 12 21Z" />
                      <circle cx="12" cy="11" r="3" />
                    </svg>
                  </div>
                  <h4>J'ai perdu un objet</h4>
                  <p>Déclarez un effet personnel égaré pour lancer des recherches auprès de notre réseau.</p>
                </div>

                <div 
                  :class="['selection-card found-card', { 'selected': form.statut_id === FOUND_STATUS_ID }]"
                  @click="selectStatus(FOUND_STATUS_ID)"
                >
                  <div class="selection-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <h4>J'ai trouvé un objet</h4>
                  <p>Signalez un objet que vous avez récupéré afin d'aider son propriétaire à le localiser.</p>
                </div>
              </div>
            </section>

            <!-- STEP 2: Category + Description -->
            <section v-if="currentStep === 2" class="step-section">
              <h3 class="step-title">Catégorie et description de l'objet</h3>
              
              <div class="form-grid">
                <div class="form-group">
                  <label for="category-select">Catégorie principale <span class="text-danger">*</span></label>
                  <select 
                    id="category-select" 
                    v-model="form.categorie_id" 
                    class="form-control"
                    @change="handleCategoryChange"
                    required
                  >
                    <option :value="null">Sélectionnez la catégorie</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                      {{ cat.name }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="subcategory-select">Sous-catégorie</label>
                  <select 
                    id="subcategory-select" 
                    v-model="form.souscategorie_id" 
                    class="form-control"
                    :disabled="!form.categorie_id"
                  >
                    <option :value="null">Sélectionnez la sous-catégorie</option>
                    <option v-for="sub in subCategories" :key="sub.id" :value="sub.id">
                      {{ sub.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label for="color-select">Couleur de l'objet</label>
                  <select id="color-select" v-model="form.couleur_id" class="form-control">
                    <option :value="null">Sélectionnez la couleur</option>
                    <option v-for="color in colors" :key="color.id" :value="color.id">
                      {{ color.name }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Statut</label>
                  <input class="form-control" :value="form.statut_id === LOST_STATUS_ID ? 'Perdu' : 'Trouvé'" readonly />
                </div>
              </div>

              <div class="form-group">
                <label for="description">Description détaillée <span class="text-danger">*</span></label>
                <textarea 
                  id="description" 
                  v-model="form.description" 
                  class="form-control" 
                  rows="4" 
                  placeholder="Détaillez les signes distinctifs (marque, coque, numéro de série, etc.)"
                  required
                ></textarea>
              </div>
            </section>

            <!-- STEP 3: Location + Date + Photo -->
            <section v-if="currentStep === 3" class="step-section">
              <h3 class="step-title">Quand et où l'objet a-t-il été perdu / trouvé ?</h3>
              
              <div class="form-grid">
                <div class="form-group">
                  <label for="action-date">Date de l'évènement <span class="text-danger">*</span></label>
                  <input 
                    id="action-date" 
                    v-model="form.date_action" 
                    type="date" 
                    class="form-control" 
                    required 
                  />
                </div>

                <div class="form-group">
                  <label for="location">Lieu ou repère géographique <span class="text-danger">*</span></label>
                  <input 
                    id="location" 
                    v-model="form.lieu" 
                    type="text" 
                    class="form-control" 
                    placeholder="Adresse, arrêt de bus, parc..." 
                    required
                  />
                </div>
              </div>

              <div class="photo-upload-section">
                <h4>Photos de l'objet <span class="text-danger">*</span></h4>
                <p class="photo-hint">Veuillez fournir 3 photos (profil, face et arrière) pour aider à l'identification.</p>
                
                <div class="upload-grid">
                  <div class="upload-card">
                    <span class="upload-label">Photo Profil</span>
                    <input type="file" accept="image/*" @change="e => handlePhotoUpload(e, 'profil')" required />
                    <div v-if="previews.profil" class="preview-container">
                      <img :src="previews.profil" alt="Aperçu Profil" />
                    </div>
                  </div>

                  <div class="upload-card">
                    <span class="upload-label">Photo Face</span>
                    <input type="file" accept="image/*" @change="e => handlePhotoUpload(e, 'face')" required />
                    <div v-if="previews.face" class="preview-container">
                      <img :src="previews.face" alt="Aperçu Face" />
                    </div>
                  </div>

                  <div class="upload-card">
                    <span class="upload-label">Photo Arrière</span>
                    <input type="file" accept="image/*" @change="e => handlePhotoUpload(e, 'derriere')" required />
                    <div v-if="previews.derriere" class="preview-container">
                      <img :src="previews.derriere" alt="Aperçu Arrière" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- STEP 4: Contact & Reward -->
            <section v-if="currentStep === 4" class="step-section">
              <h3 class="step-title">Vos coordonnées de contact</h3>
              
              <div class="form-grid">
                <div class="form-group">
                  <label for="phone">Numéro de téléphone <span class="text-danger">*</span></label>
                  <input 
                    id="phone" 
                    v-model="form.contact_phone" 
                    type="tel" 
                    class="form-control" 
                    placeholder="Ex: 06 12 34 56 78" 
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="email">Adresse email</label>
                  <input 
                    id="email" 
                    v-model="form.contact_email" 
                    type="email" 
                    class="form-control" 
                    placeholder="Ex: jean.dupont@mail.com" 
                  />
                </div>
              </div>

              <!-- Reward Section (Only for Lost items) -->
              <div v-if="form.statut_id === LOST_STATUS_ID" class="reward-box">
                <h4>Récompense</h4>
                <div class="reward-question">
                  <p>Souhaitez-vous attribuer une récompense financière à la personne qui retrouvera votre objet ?</p>
                  <div class="choice-row">
                    <label class="choice-item">
                      <input v-model="rewardEnabled" type="radio" :value="true" />
                      <span>Oui</span>
                    </label>
                    <label class="choice-item">
                      <input v-model="rewardEnabled" type="radio" :value="false" />
                      <span>Non</span>
                    </label>
                  </div>
                </div>

                <div v-if="rewardEnabled" class="form-group mt-3">
                  <label for="reward-amount">Montant de la récompense (€)</label>
                  <input 
                    id="reward-amount" 
                    v-model.number="form.recompense" 
                    type="number" 
                    min="0" 
                    placeholder="Ex: 50" 
                    class="form-control"
                  />
                </div>
              </div>

              <!-- Recap summary -->
              <div class="wizard-summary mt-4">
                <h4>Récapitulatif</h4>
                <div class="summary-grid">
                  <div class="summary-item"><strong>Type :</strong> <span>{{ form.statut_id === LOST_STATUS_ID ? 'Objet perdu' : 'Objet trouvé' }}</span></div>
                  <div class="summary-item"><strong>Description :</strong> <span>{{ form.description }}</span></div>
                  <div class="summary-item"><strong>Lieu :</strong> <span>{{ form.lieu }}</span></div>
                  <div class="summary-item"><strong>Date :</strong> <span>{{ form.date_action }}</span></div>
                </div>
              </div>
            </section>

            <!-- Actions buttons -->
            <div class="wizard-actions d-flex justify-content-between mt-4">
              <button 
                type="button" 
                class="btn-primary btn-outline" 
                :disabled="currentStep === 1" 
                @click="currentStep--"
              >
                Précédent
              </button>
              
              <button 
                v-if="currentStep < 4" 
                type="button" 
                class="btn-primary" 
                @click="nextStep"
              >
                Suivant
              </button>
              
              <button 
                v-else 
                type="submit" 
                class="btn-primary btn-submit" 
                :disabled="loading"
              >
                {{ loading ? 'Soumission...' : 'Soumettre la déclaration' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { getCategories, getSousCategoriesByCategorie } from '../services/categories'
import { getCouleurs } from '../services/references'
import { createDeclarationPerdu, createDeclarationTrouve, LOST_STATUS_ID, FOUND_STATUS_ID } from '../services/objets'
import type { Category, SousCategorie, Couleur, ObjectPayload } from '../services/types'

const route = useRoute()
const router = useRouter()

const currentStep = ref(1)
const loading = ref(false)
const rewardEnabled = ref(false)

// Data lists
const categories = ref<Category[]>([])
const subCategories = ref<SousCategorie[]>([])
const colors = ref<Couleur[]>([])

// Upload files and previews
const files = ref<Record<'profil' | 'face' | 'derriere', File | null>>({
  profil: null,
  face: null,
  derriere: null
})

const previews = ref<Record<'profil' | 'face' | 'derriere', string | null>>({
  profil: null,
  face: null,
  derriere: null
})

// Geolocation coordinate fallback
const latitudeUser = ref<number | null>(null)
const longitudeUser = ref<number | null>(null)

// Form Payload
const form = ref<ObjectPayload>({
  categorie_id: null,
  souscategorie_id: null,
  couleur_id: null,
  statut_id: LOST_STATUS_ID,
  description: '',
  date_action: new Date().toISOString().split('T')[0],
  lieu: '',
  contact_phone: '',
  contact_email: '',
  recompense: '',
  is_public: true
})

const steps = [
  { number: 1, label: 'Type' },
  { number: 2, label: 'Détails' },
  { number: 3, label: 'Localisation' },
  { number: 4, label: 'Contact' }
]

const progressPercentage = computed(() => {
  return `${((currentStep.value - 1) / (steps.length - 1)) * 100}%`
})

onMounted(async () => {
  // Check parameters in route query to pre-select perdu/trouve
  if (route.query.type === 'found') {
    form.value.statut_id = FOUND_STATUS_ID
  } else {
    form.value.statut_id = LOST_STATUS_ID
  }

  // Load ref database tables
  try {
    const [catsData, colorsData] = await Promise.all([
      getCategories(),
      getCouleurs()
    ])
    categories.value = catsData
    colors.value = colorsData
  } catch (err) {
    console.error('Error loading reference tables:', err)
  }

  // Fetch coordinates for found objects (with fallback to Paris)
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        latitudeUser.value = pos.coords.latitude
        longitudeUser.value = pos.coords.longitude
      },
      (err) => {
        console.info('Geolocation not available (using fallback location):', err.message)
      }
    )
  }
})

const selectStatus = (statusId: number) => {
  form.value.statut_id = statusId
  // Auto advance to Step 2
  currentStep.value = 2
}

const handleCategoryChange = async () => {
  form.value.souscategorie_id = null
  subCategories.value = []
  if (form.value.categorie_id) {
    try {
      subCategories.value = await getSousCategoriesByCategorie(form.value.categorie_id)
    } catch (err) {
      console.error('Error loading subcategories:', err)
    }
  }
}

const handlePhotoUpload = (e: Event, key: 'profil' | 'face' | 'derriere') => {
  const file = (e.target as HTMLInputElement).files?.[0] || null
  files.value[key] = file
  
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      previews.value[key] = event.target?.result as string
    }
    reader.readAsDataURL(file)
  } else {
    previews.value[key] = null
  }
}

const nextStep = () => {
  // Simple check checks
  if (currentStep.value === 2) {
    if (!form.value.categorie_id) {
      alert('Veuillez sélectionner une catégorie.')
      return
    }
    if (!form.value.description.trim()) {
      alert('Veuillez renseigner une description.')
      return
    }
  }
  
  if (currentStep.value === 3) {
    if (!form.value.date_action) {
      alert('Veuillez sélectionner une date.')
      return
    }
    if (!form.value.lieu?.trim()) {
      alert('Veuillez indiquer un lieu.')
      return
    }
    if (!files.value.profil || !files.value.face || !files.value.derriere) {
      alert('Veuillez fournir les 3 photos obligatoires de l\'objet.')
      return
    }
  }

  currentStep.value++
}

const submitForm = async () => {
  if (!form.value.contact_phone?.trim()) {
    alert('Veuillez renseigner un numéro de téléphone.')
    return
  }

  loading.value = true
  try {
    const formData = new FormData()
    if (form.value.categorie_id) formData.append('categorie_id', String(form.value.categorie_id))
    if (form.value.souscategorie_id) formData.append('souscategorie_id', String(form.value.souscategorie_id))
    if (form.value.couleur_id) formData.append('couleur_id', String(form.value.couleur_id))
    formData.append('description', form.value.description)
    formData.append('date_action', form.value.date_action)
    if (form.value.lieu) formData.append('lieu', form.value.lieu)
    if (form.value.contact_phone) formData.append('contact_phone', form.value.contact_phone)
    if (form.value.contact_email) formData.append('contact_email', form.value.contact_email)

    // Add required photos
    if (files.value.profil) formData.append('photo_profil', files.value.profil)
    if (files.value.face) formData.append('photo_face', files.value.face)
    if (files.value.derriere) formData.append('photo_derriere', files.value.derriere)

    if (form.value.statut_id === LOST_STATUS_ID) {
      if (rewardEnabled.value && form.value.recompense) {
        formData.append('montant_promesse', String(form.value.recompense))
      }
      await createDeclarationPerdu(formData)
    } else {
      // Add default coordinate matching
      formData.append('latitude_user', String(latitudeUser.value ?? 48.8566))
      formData.append('longitude_user', String(longitudeUser.value ?? 2.3522))
      await createDeclarationTrouve(formData)
    }

    alert('Votre déclaration a bien été enregistrée.')
    router.push('/catalog')
  } catch (err) {
    console.error('Submit failure:', err)
    alert('Une erreur s\'est produite lors de l\'enregistrement de votre déclaration.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.declare-page {
  background-color: #FCFDFD;
  min-height: 100vh;
  padding-bottom: 5rem;
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

/* Wizard Section */
.declaration-wizard-section {
  padding-top: 3rem;
}

.wizard-container {
  max-width: 800px;
}

/* Progress Tracker */
.stepper-progress {
  position: relative;
  margin-bottom: 3.5rem;
}

.progress-bar-background {
  position: absolute;
  top: 18px;
  left: 0;
  right: 0;
  height: 4px;
  background-color: #E2E8F0;
  z-index: 1;
}

.progress-bar-fill {
  height: 100%;
  background-color: var(--color-primary);
  transition: width 0.3s ease;
}

.steps-indicators {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  list-style: none;
  padding: 0;
  margin: 0;
}

.step-indicator-btn {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.step-indicator-btn:disabled {
  cursor: not-allowed;
}

.step-num {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #FFFFFF;
  border: 2px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--color-text-muted);
  transition: var(--transition-smooth);
}

.step-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
  transition: var(--transition-smooth);
}

.steps-indicators li.active .step-num {
  border-color: var(--color-primary);
  background-color: var(--color-primary);
  color: #FFFFFF;
  box-shadow: 0 4px 10px rgba(92, 214, 192, 0.3);
}

.steps-indicators li.active .step-name {
  color: var(--color-primary);
}

.steps-indicators li.completed .step-num {
  border-color: var(--color-primary);
  background-color: #FFFFFF;
  color: var(--color-primary);
}

/* Wizard card styling */
.wizard-card {
  padding: 2.5rem;
  box-shadow: 0 8px 30px rgba(26, 26, 46, 0.04);
}

.step-title {
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--color-dark);
}

/* Selector buttons for Step 1 */
.type-selection-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 575px) {
  .type-selection-grid {
    grid-template-columns: 1fr;
  }
}

.selection-card {
  border: 2px solid #E2E8F0;
  border-radius: var(--border-radius-card);
  padding: 2.5rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.selection-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  background-color: #F8FAFC;
  color: var(--color-text-muted);
  transition: var(--transition-smooth);
}

.selection-icon svg {
  width: 26px;
  height: 26px;
}

.selection-card h4 {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  transition: var(--transition-smooth);
}

.selection-card p {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.selection-card:hover {
  transform: translateY(-2px);
}

.lost-card:hover, .lost-card.selected {
  border-color: var(--color-lost);
}

.lost-card:hover .selection-icon, .lost-card.selected .selection-icon {
  background-color: #FFF0F0;
  color: var(--color-lost);
}

.lost-card:hover h4, .lost-card.selected h4 {
  color: var(--color-lost);
}

.found-card:hover, .found-card.selected {
  border-color: var(--color-primary);
}

.found-card:hover .selection-icon, .found-card.selected .selection-icon {
  background-color: #E6FAF6;
  color: var(--color-primary);
}

.found-card:hover h4, .found-card.selected h4 {
  color: var(--color-primary);
}

/* Upload cards grid */
.photo-upload-section {
  border-top: 1px solid #E2E8F0;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.photo-upload-section h4 {
  font-size: 1.05rem;
  margin-bottom: 0.25rem;
}

.photo-hint {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

@media (max-width: 575px) {
  .upload-grid {
    grid-template-columns: 1fr;
  }
}

.upload-card {
  border: 1px dashed #CBD5E0;
  border-radius: var(--border-radius-card);
  padding: 1.5rem;
  text-align: center;
  position: relative;
  background-color: var(--color-bg-alt);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow: hidden;
  height: 160px;
  justify-content: center;
}

.upload-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-dark);
}

.upload-card input[type="file"] {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  cursor: pointer;
  z-index: 10;
}

.preview-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  background-color: #FFFFFF;
}

.preview-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Reward component */
.reward-box {
  background-color: rgba(245, 166, 35, 0.05);
  border: 1px solid rgba(245, 166, 35, 0.15);
  border-radius: var(--border-radius-card);
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.reward-box h4 {
  color: var(--color-reward);
  margin-bottom: 0.5rem;
}

.reward-question p {
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.choice-row {
  display: flex;
  gap: 1.5rem;
}

.choice-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin: 0;
}

.choice-item span {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Summary container */
.wizard-summary {
  background-color: var(--color-bg-alt);
  border-radius: var(--border-radius-card);
  padding: 1.5rem;
  border: 1px solid rgba(26, 26, 46, 0.04);
}

.wizard-summary h4 {
  margin-bottom: 1rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

@media (max-width: 575px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}

.summary-item {
  font-size: 0.9rem;
}

.summary-item strong {
  margin-right: 0.5rem;
}

/* Actions buttons styling overrides */
.btn-submit {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.btn-submit:hover {
  background-color: var(--color-primary-hover);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 575px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
