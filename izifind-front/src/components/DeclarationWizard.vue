<template>
  <div class="page-content">
    <div class="wizard-v4-content">
      <div class="wizard-form">
        <div class="wizard-header">
          <h3 class="heading">{{ title }}</h3>
          <p>{{ subtitle }}</p>
        </div>

        <form class="form-register" @submit.prevent="submitForm">
          <div class="steps">
            <ul>
              <li v-for="step in steps" :key="step.number" :class="{ current: currentStep === step.number, done: currentStep > step.number }">
                <button type="button" @click="currentStep = step.number">
                  <span class="title">
                    <span class="step-icon"><i>{{ step.number }}</i></span>
                    <span class="step-text">{{ step.label }}</span>
                  </span>
                </button>
              </li>
            </ul>
          </div>

          <div class="wizard-content">
            <section v-if="currentStep === 1">
              <h3>Categorisez votre objet</h3>
              <div class="form-grid">
                <div>
                  <label>Categorie de l'objet <span class="text-danger">*</span></label>
                  <select v-model="form.categorie_id" class="form-control">
                    <option :value="null">Selectionnez la categorie</option>
                    <option v-for="category in categories" :key="category.id" :value="category.id">
                      {{ category.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label>Statut de l'objet <span class="text-danger">*</span></label>
                  <input class="form-control" :value="statusLabel" readonly />
                </div>
              </div>
              <div class="form-grid">
                <div>
                  <label>Sous-categorie de l'objet</label>
                  <select class="form-control">
                    <option>Selectionnez la sous-categorie</option>
                  </select>
                </div>
                <div>
                  <label>Marque de l'objet</label>
                  <select class="form-control">
                    <option>Selectionnez la marque</option>
                  </select>
                </div>
              </div>
              <div class="form-grid">
                <div>
                  <label>Couleur de l'objet</label>
                  <select class="form-control">
                    <option>Selectionnez la couleur</option>
                  </select>
                </div>
              </div>
              <div class="form-grid">
                <div>
                  <label>Photo de profil <span class="text-danger">*</span></label>
                  <input class="form-control" type="file" accept="image/*" @change="e => photoProfil = (e.target as HTMLInputElement).files?.[0] || null" required />
                </div>
                <div>
                  <label>Photo de face <span class="text-danger">*</span></label>
                  <input class="form-control" type="file" accept="image/*" @change="e => photoFace = (e.target as HTMLInputElement).files?.[0] || null" required />
                </div>
              </div>
              <div class="form-grid">
                <div>
                  <label>Photo de derrière <span class="text-danger">*</span></label>
                  <input class="form-control" type="file" accept="image/*" @change="e => photoDerriere = (e.target as HTMLInputElement).files?.[0] || null" required />
                </div>
              </div>
              <label>Description <span class="text-danger">*</span></label>
              <textarea v-model="form.description" class="form-control" rows="5" placeholder="Tapez ici pour ecrire" required></textarea>
            </section>

            <section v-if="currentStep === 2">
              <h3>Ou et quand?</h3>
              <div class="form-grid">
                <div>
                  <label>Date <span class="text-danger">*</span></label>
                  <input v-model="form.date_action" type="date" class="form-control" required />
                </div>
                <div>
                  <label>Departement</label>
                  <select class="form-control">
                    <option>Selectionnez le departement</option>
                  </select>
                </div>
              </div>
              <div class="form-grid">
                <div>
                  <label>Arrondissement</label>
                  <select class="form-control">
                    <option>Selectionnez l'arrondissement</option>
                  </select>
                </div>
                <div>
                  <label>Quartier ou lieu</label>
                  <input v-model="form.lieu" class="form-control" placeholder="Precisez le lieu" />
                </div>
              </div>
            </section>

            <section v-if="currentStep === 3">
              <h3>Plus de details</h3>
              <div class="form-grid">
                <div>
                  <label>Numero <span class="text-danger">*</span></label>
                  <input v-model="form.contact_phone" class="form-control" placeholder="Entrez votre numero de telephone" />
                </div>
                <div>
                  <label>Email</label>
                  <input v-model="form.contact_email" type="email" class="form-control" placeholder="Entrez votre adresse mail" />
                </div>
              </div>

              <template v-if="withRewardQuestion">
                <h5>Desirez-vous offrir une recompense a celui qui va retrouver votre objet?</h5>
                <label class="radio-inline"><input v-model="rewardEnabled" type="radio" :value="true" /> Oui</label>
                <label class="radio-inline"><input v-model="rewardEnabled" type="radio" :value="false" /> Non</label>
              </template>
              <template v-else>
                <h5>Desirez-vous ajouter une recompense?</h5>
              </template>

              <div v-if="rewardEnabled || !withRewardQuestion">
                <label>Montant de la récompense (€)</label>
                <input
                  v-model.number="form.recompense"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  placeholder="Ex: 50"
                />
              </div>
            </section>

            <section v-if="currentStep === 4">
              <h3>Bilan des informations renseignees</h3>
              <div class="summary-table">
                <div><strong>Statut</strong><span>{{ statusLabel }}</span></div>
                <div><strong>Description</strong><span>{{ form.description || '-' }}</span></div>
                <div><strong>Date</strong><span>{{ form.date_action || '-' }}</span></div>
                <div><strong>Lieu</strong><span>{{ form.lieu || '-' }}</span></div>
                <div><strong>Contact</strong><span>{{ form.contact_phone || form.contact_email || '-' }}</span></div>
              </div>
            </section>
          </div>

          <div class="actions">
            <button type="button" :disabled="currentStep === 1" @click="currentStep--">Precedent</button>
            <button v-if="currentStep < 4" type="button" @click="currentStep++">Suivant</button>
            <button v-else type="submit" :disabled="loading">{{ loading ? 'Enregistrement...' : 'Soumettre' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createDeclarationPerdu, createDeclarationTrouve, LOST_STATUS_ID, FOUND_STATUS_ID } from '../services/objets'
import { getCategories } from '../services/categories'
import type { Category, ObjectPayload } from '../services/types'

const props = defineProps<{
  title: string
  subtitle: string
  statusLabel: string
  statusId: number
  withRewardQuestion: boolean
}>()

const router = useRouter()
const loading = ref(false)
const currentStep = ref(1)
const rewardEnabled = ref(false)
const categories = ref<Category[]>([])
const photoProfil = ref<File | null>(null)
const photoFace = ref<File | null>(null)
const photoDerriere = ref<File | null>(null)
const latitudeUser = ref<number | null>(null)
const longitudeUser = ref<number | null>(null)
const steps = [
  { number: 1, label: 'Details' },
  { number: 2, label: 'Localisation' },
  { number: 3, label: props.withRewardQuestion ? 'Plus de details' : 'Recompense' },
  { number: 4, label: 'Bilan' },
]

const form = ref<ObjectPayload>({
  categorie_id: null,
  statut_id: props.statusId,
  description: '',
  date_action: '',
  lieu: '',
  contact_phone: '',
  contact_email: '',
  recompense: '',
  is_public: true,
})

onMounted(async () => {
  try {
    categories.value = await getCategories()
  } catch (err) {
    console.error(err)
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        latitudeUser.value = pos.coords.latitude
        longitudeUser.value = pos.coords.longitude
      },
      (err) => {
        console.warn("Geolocation denied or error", err)
      }
    )
  }
})

const submitForm = async () => {
  if (!photoProfil.value || !photoFace.value || !photoDerriere.value) {
    alert("Veuillez fournir les 3 photos de l'objet.")
    return
  }

  loading.value = true
  try {
    const formData = new FormData()
    if (form.value.categorie_id) formData.append('categorie_id', String(form.value.categorie_id))
    if (form.value.description) formData.append('description', form.value.description)
    if (form.value.date_action) formData.append('date_action', form.value.date_action)
    if (form.value.lieu) formData.append('lieu', form.value.lieu)
    if (form.value.contact_phone) formData.append('contact_phone', form.value.contact_phone)
    if (form.value.contact_email) formData.append('contact_email', form.value.contact_email)
    
    formData.append('photo_profil', photoProfil.value)
    formData.append('photo_face', photoFace.value)
    formData.append('photo_derriere', photoDerriere.value)

    if (props.statusId === LOST_STATUS_ID) {
      if (rewardEnabled.value && form.value.recompense) {
        formData.append('montant_promesse', String(form.value.recompense))
      }
      await createDeclarationPerdu(formData)
    } else if (props.statusId === FOUND_STATUS_ID) {
      formData.append('latitude_user', String(latitudeUser.value ?? 48.8566))
      formData.append('longitude_user', String(longitudeUser.value ?? 2.3522))
      await createDeclarationTrouve(formData)
    }

    router.push('/catalog')
  } catch (err) {
    console.error(err)
    alert("Erreur lors de l'enregistrement.")
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-grid {
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.form-control {
  padding: 0.4rem 0.6rem;
  font-size: 0.9rem;
}
.wizard-form {
  padding: 1rem 1.5rem;
}
h3 {
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}
label {
  font-size: 0.85rem;
  margin-bottom: 0.1rem;
}
</style>
