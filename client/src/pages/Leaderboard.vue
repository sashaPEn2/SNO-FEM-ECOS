<template>
  <v-container class="py-10">
    <h1 class="text-h3 mb-6">Рейтинг участников</h1>

    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>

    <v-table v-if="!loading" class="mt-6">
      <thead>
        <tr>
          <th class="text-left">Место</th>
          <th class="text-left">Имя</th>
          <th class="text-left">Баллы</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user, index) in leaderboard" :key="user._id">
          <td class="font-weight-bold">{{ index + 1 }}</td>
          <td>{{ user.firstName }} {{ user.lastName }}</td>
          <td>
            <v-chip color="primary">{{ user.totalPoints }}</v-chip>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-container>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Leaderboard',
  data() {
    return {
      leaderboard: [],
      loading: false
    }
  },
  methods: {
    async loadLeaderboard() {
      this.loading = true
      try {
        const response = await axios.get('/api/points/leaderboard')
        this.leaderboard = response.data.leaderboard
      } catch (error) {
        console.error('Error loading leaderboard:', error)
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    this.loadLeaderboard()
  }
}
</script>
