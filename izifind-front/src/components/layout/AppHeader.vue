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
            <RouterLink to="/map" class="nav-link" @click="closeMenu">Carte</RouterLink>
          </li>
          <li>
            <RouterLink to="/contact" class="nav-link" @click="closeMenu">Contact</RouterLink>
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
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 1000;
  height: 85px;
  display: flex;
  align-items: center;
  transition: var(--transition-smooth);
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
  color: var(--color-dark);
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 800;
  text-decoration: none;
  letter-spacing: -0.5px;
}

.logo-img {
  max-height: 44px;
  object-fit: contain;
}

/* Navigation */
.navbar ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
  gap: 2.5rem;
}

.nav-link {
  color: var(--color-text);
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  position: relative;
  transition: var(--transition-smooth);
  padding: 0.5rem 0;
}

.nav-link::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: var(--color-primary);
  transition: var(--transition-smooth);
  border-radius: 2px;
}

.nav-link:hover, .nav-link.router-link-active {
  color: var(--color-primary);
}

.nav-link:hover::after, .nav-link.router-link-active::after {
  width: 100%;
}

.nav-auth-link {
  color: var(--color-dark);
}

.btn-logout-link {
  background: rgba(255, 82, 82, 0.1);
  border: none;
  border-radius: var(--border-radius-btn);
  color: var(--color-lost);
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem 1.2rem;
  transition: var(--transition-smooth);
}

.btn-logout-link:hover {
  background: var(--color-lost);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow-lost);
}

/* CTA */
.btn-cta {
  font-size: 0.95rem;
  padding: 0.75rem 1.8rem;
}

/* Mobile Menu Toggle */
.mobile-nav-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 28px;
  height: 20px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.toggle-bar {
  width: 100%;
  height: 2px;
  background-color: var(--color-dark);
  border-radius: 2px;
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
    top: 85px;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--color-border);
    padding: 2rem;
    box-shadow: var(--shadow-lg);
  }

  .navbar-mobile {
    display: block;
    animation: fadeInDown 0.3s ease;
  }

  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .navbar ul {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }
}
</style>
