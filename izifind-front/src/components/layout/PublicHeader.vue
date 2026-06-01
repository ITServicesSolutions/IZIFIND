<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import logoUrl from '../../assets/legacy/img/logo.png'
import { useAuthStore } from '../../stores/auth'

const mobileMenuOpen = ref(false)
const authStore = useAuthStore()
const router = useRouter()

const closeMenu = () => {
  mobileMenuOpen.value = false
}

const handleLogout = () => {
  authStore.logout()
  closeMenu()
  router.push('/')
}
</script>

<template>
  <header id="header" class="site-header d-flex align-items-center">
    <div class="site-container d-flex align-items-center">
      <RouterLink to="/" class="logo me-auto" @click="closeMenu">
        <img :src="logoUrl" alt="IZIFIND" class="img-fluid" />
      </RouterLink>

      <nav id="navbar" class="navbar" :class="{ 'navbar-mobile': mobileMenuOpen }">
        <ul>
          <li><RouterLink to="/" class="nav-link scrollto" @click="closeMenu">Accueil</RouterLink></li>
          <li class="dropdown">
            <a href="#" @click.prevent><span>Objets</span></a>
            <ul>
              <li><RouterLink to="/catalog" @click="closeMenu">Objets perdus</RouterLink></li>
              <li><RouterLink to="/catalog" @click="closeMenu">Objets trouves</RouterLink></li>
            </ul>
          </li>
          <li><RouterLink to="/#services" class="nav-link scrollto" @click="closeMenu">Services</RouterLink></li>
          <li><RouterLink to="/#about" class="nav-link scrollto" @click="closeMenu">A Propos</RouterLink></li>
          <li><RouterLink to="/contact" class="nav-link scrollto" @click="closeMenu">Contact</RouterLink></li>
          <li v-if="!authStore.isAuthenticated">
            <RouterLink to="/login" class="btn-admin-action" @click="closeMenu">Connexion</RouterLink>
          </li>
          <template v-else>
            <li v-if="authStore.isAdmin">
              <RouterLink to="/admin/dashboard" class="btn-admin-action" @click="closeMenu">Administration</RouterLink>
            </li>
            <li v-else>
              <RouterLink to="/profile" class="btn-admin-action" @click="closeMenu">Profil</RouterLink>
            </li>
            <li>
              <button type="button" class="btn-logout-action" @click="handleLogout">Déconnexion</button>
            </li>
          </template>
        </ul>
      </nav>

      <button class="mobile-nav-toggle" type="button" @click="mobileMenuOpen = !mobileMenuOpen">
        {{ mobileMenuOpen ? 'x' : 'menu' }}
      </button>
    </div>
  </header>
</template>
