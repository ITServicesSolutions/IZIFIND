<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import logoUrl from '../../assets/legacy/img/logo.png'

const mobileMenuOpen = ref(false)

const closeMenu = () => {
  mobileMenuOpen.value = false
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
          <li><RouterLink to="/login" class="getstarted scrollto" @click="closeMenu">Connexion</RouterLink></li>
        </ul>
      </nav>

      <button class="mobile-nav-toggle" type="button" @click="mobileMenuOpen = !mobileMenuOpen">
        {{ mobileMenuOpen ? 'x' : 'menu' }}
      </button>
    </div>
  </header>
</template>
