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

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null,
    points: 0,
    rewards: [],
    loading: false,
    error: null
  }),

  getters: {
    userPoints: (state) => state.points,
    userRewards: (state) => state.rewards
  },

  actions: {
    async getProfile() {
      this.loading = true
      try {
        const response = await API.get('/users/profile')
        this.profile = response.data.user
        this.points = response.data.user.totalPoints
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка загрузки профиля'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateProfile(data) {
      this.loading = true
      try {
        const response = await API.put('/users/profile', data)
        this.profile = response.data.user
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка обновления профиля'
        throw error
      } finally {
        this.loading = false
      }
    },

    async getRewards() {
      this.loading = true
      try {
        const response = await API.get('/rewards/my')
        this.rewards = response.data.rewards
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка загрузки наград'
        throw error
      } finally {
        this.loading = false
      }
    },

    async redeemReward(rewardId) {
      this.loading = true
      try {
        const response = await API.post('/rewards/redeem', { rewardId })
        this.points = response.data.remainingPoints
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка при обмене награды'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
