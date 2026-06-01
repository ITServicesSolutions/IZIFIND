<script setup lang="ts">
import { RouterLink } from 'vue-router'
import logoUrl from '../../assets/legacy/img/logo.png'
import SocialIcon from './SocialIcon.vue'

const currentYear = new Date().getFullYear()

const socialLinks = [
  { label: 'Twitter', name: 'twitter' },
  { label: 'Facebook', name: 'facebook' },
  { label: 'Instagram', name: 'instagram' },
  { label: 'LinkedIn', name: 'linkedin' },
  { label: 'WhatsApp', name: 'whatsapp' },
] as const
</script>

<template>
  <footer id="footer" class="site-footer">
    <div class="site-container">
      <div class="row">
        <div class="col-lg-4">
          <h3><img :src="logoUrl" alt="IZIFIND" /></h3>
          <p>Plateforme de declaration et de recherche des objets perdus, trouves ou voles.</p>
          <div class="social-links">
            <a v-for="social in socialLinks" :key="social.name" href="#" :aria-label="social.label" :title="social.label">
              <SocialIcon :name="social.name" />
            </a>
          </div>
        </div>
        <div class="col-lg-4">
          <h4>Liens Utiles</h4>
          <RouterLink to="/">Accueil</RouterLink>
          <RouterLink to="/catalog">Objets</RouterLink>
          <RouterLink to="/contact">Contact</RouterLink>
        </div>
        <div class="col-lg-4">
          <h4>Souscription</h4>
          <p>Recevez les annonces importantes et les objets recemment declares.</p>
        </div>
      </div>

      <div class="copyright">
        &copy; Copyright <strong><span>IZIFIND</span></strong> {{ currentYear }}. Tout droits reserves
      </div>
    </div>
  </footer>
</template>
