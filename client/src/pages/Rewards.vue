<template>
  <v-container class="py-10">
    <h1 class="text-h3 mb-6">Доступные награды</h1>

    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>

    <v-row v-if="!loading" class="mt-6">
      <v-col v-for="reward in rewards" :key="reward._id" cols="12" md="6" lg="4">
        <v-card :class="{ 'opacity-50': userPoints < reward.pointsCost }">
          <v-card-title>{{ reward.name }}</v-card-title>
          <v-card-subtitle>
            <v-chip small color="primary">{{ reward.pointsCost }} баллов</v-chip>
          </v-card-subtitle>
          <v-card-text>
            <p>{{ reward.description }}</p>
            <div class="mt-4">
              <span class="text-sm">Тип: {{ reward.rewardType }}</span>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="success"
              @click="redeemReward(reward._id)"
              :disabled="userPoints < reward.pointsCost || loading"
            >
              Обменять
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-divider class="my-8"></v-divider>

    <h2 class="text-h5 mb-4">Мои награды</h2>
    <v-row class="mt-4">
      <v-col v-for="userReward in userRewards" :key="userReward._id" cols="12" md="6" lg="4">
        <v-card class="green lighten-5">
          <v-card-title>{{ userReward.reward.name }}</v-card-title>
          <v-card-subtitle>
            Получена: {{ formatDate(userReward.earnedAt) }}
          </v-card-subtitle>
          <v-card-text>
            <p v-if="userReward.certificateNumber">
              Номер: {{ userReward.certificateNumber }}
            </p>
          </v-card-text>
          <v-card-actions v-if="userReward.certificateFile">
            <v-btn text color="primary" @click="downloadCertificate(userReward)">
              Скачать сертификат
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useUserStore } from '../stores/user'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import axios from 'axios'

export default {
  name: 'Rewards',
  data() {
    return {
      rewards: [],
      userRewards: []
    }
  },
  computed: {
    loading() {
      return useUserStore().loading
    },
    userPoints() {
      return useUserStore().userPoints
    }
  },
  methods: {
    async loadRewards() {
      const userStore = useUserStore()
      try {
        const response = await axios.get('/api/rewards')
        this.rewards = response.data.rewards
        await userStore.getRewards()
        this.userRewards = userStore.userRewards
      } catch (error) {
        console.error('Error loading rewards:', error)
      }
    },
    async redeemReward(rewardId) {
      const userStore = useUserStore()
      try {
        await userStore.redeemReward(rewardId)
        alert('Награда получена!')
        this.loadRewards()
      } catch (error) {
        console.error('Error redeeming reward:', error)
      }
    },
    formatDate(date) {
      return format(new Date(date), 'PPP', { locale: ru })
    },
    downloadCertificate(userReward) {
      // Реализовать загрузку сертификата
      console.log('Download certificate:', userReward)
    }
  },
  mounted() {
    this.loadRewards()
  }
}
</script>
