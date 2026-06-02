<template>
  <v-container class="py-10">
    <v-row>
      <v-col cols="12" md="6">
        <h1 class="text-h3 font-weight-bold mb-4">Добро пожаловать в SNO FEM ECOS!</h1>
        <p class="text-lg mb-4">
          Экосистема студенческого научного общества факультета экономики и менеджмента
        </p>
        <v-btn large color="primary" to="/events">Смотреть мероприятия</v-btn>
        <v-btn v-if="!isAuthenticated" large outlined color="primary" to="/register" class="ml-3">
          Зарегистрироваться
        </v-btn>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="text-center pa-6">
          <v-icon size="100" color="primary" class="mb-4">$mdiStar</v-icon>
          <h2 class="text-h5 mb-3">Зарабатывайте баллы</h2>
          <p>Участвуйте в мероприятиях, зарабатывайте баллы и обменивайте их на награды!</p>
        </v-card>
      </v-col>
    </v-row>

    <v-divider class="my-8"></v-divider>

    <v-row class="mt-8">
      <v-col cols="12" md="4">
        <v-card class="text-center pa-6">
          <v-icon size="60" color="primary" class="mb-4">$mdiPlus</v-icon>
          <h3 class="text-h6 mb-2">Регистрация на события</h3>
          <p class="text-sm">Зарегистрируйтесь на мероприятия и начните получать баллы</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="text-center pa-6">
          <v-icon size="60" color="success" class="mb-4">$mdiPencil</v-icon>
          <h3 class="text-h6 mb-2">Создавайте события</h3>
          <p class="text-sm">Организуйте свои мероприятия и получайте бонусные баллы</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="text-center pa-6">
          <v-icon size="60" color="warning" class="mb-4">$mdiStar</v-icon>
          <h3 class="text-h6 mb-2">Обменивайте награды</h3>
          <p class="text-sm">Обменяйте накопленные баллы на сертификаты и другие награды</p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { mapGetters } from 'pinia'

export default {
  name: 'Home',
  computed: {
    ...mapGetters(useAuthStore, ['isAuthenticated'])
  }
}
</script>
