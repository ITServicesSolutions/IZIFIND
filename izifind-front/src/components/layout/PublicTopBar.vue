<script setup lang="ts">
import SocialIcon from './SocialIcon.vue'

const socialLinks = [
  { label: 'Twitter', name: 'twitter' },
  { label: 'Facebook', name: 'facebook' },
  { label: 'Instagram', name: 'instagram' },
  { label: 'LinkedIn', name: 'linkedin' },
  { label: 'WhatsApp', name: 'whatsapp' },
] as const
</script>

<template>
  <section id="topbar" class="topbar d-flex align-items-center">
    <div class="site-container d-flex justify-content-center justify-content-md-between">
      <div class="contact-info d-flex align-items-center">
        <span class="icon-label">contact@it-servicegroup.com</span>
        <span class="icon-label">+229 01 52 52 52 31</span>
      </div>
      <div class="social-links d-none d-md-block">
        <a v-for="social in socialLinks" :key="social.name" href="#" :aria-label="social.label" :title="social.label">
          <SocialIcon :name="social.name" />
        </a>
      </div>
    </div>
  </section>
</template>
