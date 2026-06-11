import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import { useAuthStore } from '../stores/auth';
import type { AdminResourceKey } from '../services/adminResources';

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
    { path: '/catalog', name: 'catalog', component: () => import('../views/AnnoncesView.vue') },
    { path: '/contact', name: 'contact', component: () => import('../views/public/ContactView.vue') },
    { path: '/declare', name: 'declare', component: () => import('../views/DeclarerView.vue') },
    { path: '/lost', redirect: '/declare?type=lost' },
    { path: '/found', redirect: '/declare?type=found' },
    { path: '/login', name: 'login', component: () => import('../views/auth/LoginView.vue') },
    { path: '/register', name: 'register', component: () => import('../views/auth/RegisterView.vue') },
    { path: '/forgot-password', name: 'forgot-password', component: () => import('../views/auth/ForgotPasswordView.vue') },
    { path: '/reset-password', name: 'reset-password', component: () => import('../views/auth/ResetPasswordView.vue') },
    { path: '/profile', name: 'profile', component: () => import('../views/public/ProfileView.vue'), meta: { requiresAuth: true } },
    { path: '/dashboard', redirect: '/admin/dashboard' },
    { path: '/admin', redirect: '/admin/dashboard' },
    { path: '/admin/dashboard', name: 'admin-dashboard', component: () => import('../views/admin/DashboardView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin/categories', name: 'admin-categories', component: () => import('../views/admin/CategoriesView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin/roles', name: 'admin-roles', component: () => import('../views/admin/RolesView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
    {
      path: '/admin/:resource(categories|sous-categories|marques|couleurs|statuts|titres|objets|images|modifications|permissions|roles)',
      name: 'admin-resource',
      component: () => import('../views/admin/TableResourceView.vue'),
      props: route => ({ resource: route.params.resource as AdminResourceKey }),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
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

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: 'home' };
  }

  return true;
});

export default router;
