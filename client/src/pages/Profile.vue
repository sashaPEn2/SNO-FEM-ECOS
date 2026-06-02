<template>
  <v-container class="py-10">
    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>

    <v-row v-if="!loading">
      <v-col cols="12" md="8">
        <v-card class="pa-6">
          <h1 class="text-h4 mb-6">Мой профиль</h1>

          <v-form @submit.prevent="updateProfile">
            <v-text-field
              v-model="profile.firstName"
              label="Имя"
              outlined
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="profile.lastName"
              label="Фамилия"
              outlined
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="profile.department"
              label="Кафедра/Факультет"
              outlined
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="profile.phone"
              label="Телефон"
              outlined
              class="mb-4"
            ></v-text-field>

            <v-textarea
              v-model="profile.bio"
              label="О себе"
              outlined
              class="mb-4"
            ></v-textarea>

            <v-btn color="primary" large type="submit">
              Сохранить
            </v-btn>
          </v-form>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-6 text-center">
          <h2 class="text-h5 mb-4">Мои баллы</h2>
          <div class="text-h1 font-weight-bold text-primary mb-4">
            {{ profile.totalPoints }}
          </div>
          <p class="mb-4">Осталось баллов</p>
          <router-link to="/rewards">
            <v-btn color="success" large block>Обменять на награды</v-btn>
          </router-link>
        </v-card>

        <v-card class="pa-6 mt-4">
          <h3 class="text-h6 mb-4">Статистика</h3>
          <v-list>
            <v-list-item>
              <v-list-item-title>События</v-list-item-title>
              <v-list-item-subtitle>{{ eventsAttended }} / {{ eventsCreated }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Роль</v-list-item-title>
              <v-list-item-subtitle>{{ profile.role }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useUserStore } from '../stores/user'

export default {
  name: 'Profile',
  data() {
    return {
      eventsAttended: 0,
      eventsCreated: 0
    }
  },
  computed: {
    profile() {
      return useUserStore().profile || {}
    },
    loading() {
      return useUserStore().loading
    }
  },
  methods: {
    async loadProfile() {
      const userStore = useUserStore()
      try {
        await userStore.getProfile()
      } catch (error) {
        console.error('Error loading profile:', error)
      }
    },
    async updateProfile() {
      const userStore = useUserStore()
      try {
        await userStore.updateProfile({
          firstName: this.profile.firstName,
          lastName: this.profile.lastName,
          department: this.profile.department,
          phone: this.profile.phone,
          bio: this.profile.bio
        })
        alert('Профиль обновлен')
      } catch (error) {
        console.error('Error updating profile:', error)
      }
    }
  },
  mounted() {
    this.loadProfile()
  }
}
</script>
