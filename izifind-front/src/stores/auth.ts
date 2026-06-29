import { defineStore } from 'pinia';
import api from '../services/api';
import type { User } from '../services/types';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token') || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => Boolean(state.user?.is_superuser || state.user?.roles?.some((role) => role.name === 'admin')),
  },
  actions: {
    async login(username: string, password: string) {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      this.token = response.data.access_token;
      if (this.token) {
        localStorage.setItem('token', this.token);
      }
      await this.fetchUser();
    },
    async register(user: { username: string; email: string; password: string }) {
      await api.post('/auth/register', user);
    },
    async googleLogin(idToken: string) {
      const response = await api.post('/auth/google', { id_token: idToken });
      this.token = response.data.access_token;
      if (this.token) {
        localStorage.setItem('token', this.token);
      }
      await this.fetchUser();
    },
    async fetchUser() {
      if (!this.token) return;
      try {
        const response = await api.get('/auth/me');
        this.user = response.data;
      } catch (error) {
        this.logout();
      }
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
    }
  }
});
