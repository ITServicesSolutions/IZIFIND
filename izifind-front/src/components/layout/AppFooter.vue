<script setup lang="ts">
import { RouterLink } from 'vue-router'
import SocialIcon from './SocialIcon.vue'
import logoUrl from '../../assets/images/logo.png'

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
    <div class="site-container footer-inner">
      <div class="footer-grid">
        <div class="footer-brand">
          <RouterLink to="/" class="logo">
            <img :src="logoUrl" alt="IZIFIND" class="logo-img" />
          </RouterLink>
          <p class="brand-desc">Plateforme intelligente de déclaration et de recherche des objets perdus et trouvés au service de la communauté.</p>
          <div class="social-links">
            <a v-for="social in socialLinks" :key="social.name" href="#" :aria-label="social.label" :title="social.label" class="social-icon-link">
              <SocialIcon :name="social.name" />
            </a>
          </div>
        </div>
        
        <div class="footer-links">
          <h4>Liens Utiles</h4>
          <nav class="footer-nav">
            <RouterLink to="/">Accueil</RouterLink>
            <RouterLink to="/catalog">Annonces</RouterLink>
            <RouterLink to="/contact">Contact</RouterLink>
            <RouterLink to="/profile">Mon Espace</RouterLink>
          </nav>
        </div>
        
        <div class="footer-newsletter">
          <h4>Newsletter</h4>
          <p>Recevez les annonces importantes et les actualités sur les objets retrouvés.</p>
          <form class="newsletter-form" @submit.prevent>
            <input type="email" placeholder="Votre adresse email" class="form-control" />
            <button type="submit" class="btn-primary">S'abonner</button>
          </form>
        </div>
      </div>

      <div class="copyright">
        &copy; {{ currentYear }} <strong>IZIFIND</strong>. Tous droits réservés.
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background-color: var(--color-dark);
  color: #FFFFFF;
  padding: 4rem 0 2rem;
  margin-top: 4rem;
  font-size: 0.9rem;
}

.footer-inner {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  gap: 4rem;
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

/* Brand Section */
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-primary);
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
}

.logo-img {
  max-height: 40px;
  object-fit: contain;
}

.brand-desc {
  color: var(--color-text-muted);
  line-height: 1.6;
}

.social-links {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.social-icon-link {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  transition: var(--transition-smooth);
}

.social-icon-link:hover {
  background-color: var(--color-primary);
  color: var(--color-dark);
}

/* Links Section */
.footer-links h4, .footer-newsletter h4 {
  font-family: 'Poppins', sans-serif;
  color: #FFFFFF;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.footer-nav {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-nav a {
  color: var(--color-text-muted);
  transition: var(--transition-smooth);
}

.footer-nav a:hover {
  color: var(--color-primary);
  padding-left: 4px;
}

/* Newsletter Section */
.footer-newsletter p {
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}

.newsletter-form {
  display: flex;
  gap: 0.5rem;
}

.newsletter-form input {
  flex-grow: 1;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
}

.newsletter-form input::placeholder {
  color: var(--color-text-muted);
}

.newsletter-form button {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

/* Copyright Section */
.copyright {
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 2rem;
  color: var(--color-text-muted);
}
</style>
