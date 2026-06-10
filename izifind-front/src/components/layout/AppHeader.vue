<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import logoUrl from '../../assets/images/logo.png'

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

const handleCTA = () => {
  closeMenu()
  // Navigate to declaration page
  router.push('/declare')
}
</script>

<template>
  <header id="header" class="site-header">
    <div class="site-container header-inner">
      <!-- Logo IziFind -->
      <RouterLink to="/" class="logo" @click="closeMenu">
        <img :src="logoUrl" alt="IZIFIND" class="logo-img" />
      </RouterLink>

      <!-- Mobile Menu Toggle -->
      <button 
        class="mobile-nav-toggle" 
        type="button" 
        @click="mobileMenuOpen = !mobileMenuOpen"
        :aria-expanded="mobileMenuOpen"
        aria-label="Toggle menu de navigation"
      >
        <span class="toggle-bar"></span>
        <span class="toggle-bar"></span>
        <span class="toggle-bar"></span>
      </button>

      <!-- Center navigation -->
      <nav id="navbar" class="navbar" :class="{ 'navbar-mobile': mobileMenuOpen }">
        <ul>
          <li>
            <RouterLink to="/" class="nav-link" @click="closeMenu">Accueil</RouterLink>
          </li>
          <li>
            <RouterLink to="/catalog" class="nav-link" @click="closeMenu">Annonces</RouterLink>
          </li>
          <li>
            <a href="/#how-it-works" class="nav-link" @click="closeMenu">Comment ça marche</a>
          </li>
          
          <!-- Authentication links -->
          <li v-if="!authStore.isAuthenticated">
            <RouterLink to="/login" class="nav-link nav-auth-link" @click="closeMenu">Connexion</RouterLink>
          </li>
          <template v-else>
            <li v-if="authStore.isAdmin">
              <RouterLink to="/admin/dashboard" class="nav-link nav-auth-link" @click="closeMenu">Admin</RouterLink>
            </li>
            <li v-else>
              <RouterLink to="/profile" class="nav-link nav-auth-link" @click="closeMenu">Profil</RouterLink>
            </li>
            <li>
              <button type="button" class="btn-logout-link" @click="handleLogout">Déconnexion</button>
            </li>
          </template>
        </ul>
      </nav>

      <!-- Right CTA button -->
      <div class="header-cta">
        <button class="btn-primary btn-cta" @click="handleCTA">Déposer une annonce</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  background-color: #FFFFFF;
  border-bottom: 1px solid rgba(26, 26, 46, 0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
  height: 80px;
  display: flex;
  align-items: center;
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

/* Logo styling */
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

/* Navigation */
.navbar ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: var(--color-dark);
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  font-size: 0.95rem;
  transition: var(--transition-smooth);
}

.nav-link:hover, .nav-link.router-link-active {
  color: var(--color-primary);
}

.btn-logout-link {
  background: none;
  border: none;
  color: var(--color-lost);
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0;
  transition: var(--transition-smooth);
}

.btn-logout-link:hover {
  opacity: 0.8;
}

/* CTA */
.btn-cta {
  font-family: 'Poppins', sans-serif;
  padding: 0.6rem 1.5rem;
  font-size: 0.9rem;
}

/* Mobile Menu Toggle */
.mobile-nav-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.toggle-bar {
  width: 100%;
  height: 2px;
  background-color: var(--color-dark);
  transition: var(--transition-smooth);
}

/* Responsive Menu */
@media (max-width: 991px) {
  .header-cta {
    display: none;
  }
  
  .mobile-nav-toggle {
    display: flex;
  }

  .navbar {
    display: none;
    position: absolute;
    top: 80px;
    left: 0;
    right: 0;
    background-color: #FFFFFF;
    border-bottom: 1px solid rgba(26, 26, 46, 0.08);
    padding: 1.5rem;
    box-shadow: 0 10px 15px rgba(26, 26, 46, 0.05);
  }

  .navbar-mobile {
    display: block;
  }

  .navbar ul {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
  }
}
</style>
