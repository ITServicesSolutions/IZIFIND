import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/public/HomeView.vue';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      };
    }

    return { top: 0 };
  },
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/catalog', name: 'catalog', component: () => import('../views/public/CatalogView.vue') },
    { path: '/contact', name: 'contact', component: () => import('../views/public/ContactView.vue') },
    { path: '/lost', name: 'lost', component: () => import('../views/public/LostView.vue'), meta: { requiresAuth: true } },
    { path: '/found', name: 'found', component: () => import('../views/public/FoundView.vue') },
    { path: '/login', name: 'login', component: () => import('../views/auth/LoginView.vue') },
    { path: '/register', name: 'register', component: () => import('../views/auth/RegisterView.vue') },
    { path: '/dashboard', name: 'dashboard', component: () => import('../views/admin/DashboardView.vue'), meta: { requiresAuth: true } },
    { path: '/admin/categories', name: 'admin-categories', component: () => import('../views/admin/CategoriesView.vue'), meta: { requiresAuth: true } },
    { path: '/admin/roles', name: 'admin-roles', component: () => import('../views/admin/RolesView.vue'), meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (authStore.token && !authStore.user) {
    await authStore.fetchUser();
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' };
  }

  return true;
});

export default router;
