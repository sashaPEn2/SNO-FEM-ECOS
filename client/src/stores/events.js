import { defineStore } from 'pinia'
import axios from 'axios'

const API = axios.create({
  baseURL: '/api'
})

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const useEventStore = defineStore('event', {
  state: () => ({
    events: [],
    myEvents: [],
    currentEvent: null,
    registrations: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1
    }
  }),

  getters: {
    getEvents: (state) => state.events,
    getMyEvents: (state) => state.myEvents,
    getCurrentEvent: (state) => state.currentEvent
  },

  actions: {
    async fetchEvents(page = 1, limit = 10) {
      this.loading = true
      try {
        const response = await API.get('/events', {
          params: { page, limit }
        })
        this.events = response.data.events
        this.pagination = response.data.pagination
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка загрузки событий'
        throw error
      } finally {
        this.loading = false
      }
    },

    async getEventById(id) {
      this.loading = true
      try {
        const response = await API.get(`/events/${id}`)
        this.currentEvent = response.data.event
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка загрузки события'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createEvent(eventData) {
      this.loading = true
      try {
        const response = await API.post('/events', eventData)
        this.myEvents.push(response.data.event)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка создания события'
        throw error
      } finally {
        this.loading = false
      }
    },

    async registerForEvent(eventId) {
      this.loading = true
      try {
        const response = await API.post('/registrations/register', { eventId })
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка регистрации'
        throw error
      } finally {
        this.loading = false
      }
    },

    async getMyRegistrations() {
      this.loading = true
      try {
        const response = await API.get('/registrations/my')
        this.registrations = response.data.registrations
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка загрузки регистраций'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
