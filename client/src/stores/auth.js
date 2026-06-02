import { defineStore } from 'pinia'
import axios from 'axios'

const API = axios.create({
  baseURL: '/api'
})

// Добавить токен к каждому запросу
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role
  },

  actions: {
    async register(formData) {
      this.loading = true
      this.error = null
      try {
        const response = await API.post('/auth/register', formData)
        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem('token', this.token)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка регистрации'
        throw error
      } finally {
        this.loading = false
      }
    },

    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const response = await API.post('/auth/login', credentials)
        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem('token', this.token)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка входа'
        throw error
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
    },

    async getCurrentUser() {
      try {
        const response = await API.get('/auth/me')
        this.user = response.data.user
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка загрузки профиля'
        throw error
      }
    }
  }
})
