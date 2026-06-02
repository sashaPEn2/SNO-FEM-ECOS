<template>
  <v-container class="py-10">
    <v-card class="pa-6">
      <h1 class="text-h4 mb-6">Вход</h1>
      
      <v-form @submit.prevent="handleLogin">
        <v-text-field
          v-model="credentials.email"
          label="Email"
          type="email"
          outlined
          class="mb-4"
          required
        ></v-text-field>

        <v-text-field
          v-model="credentials.password"
          label="Пароль"
          type="password"
          outlined
          class="mb-4"
          required
        ></v-text-field>

        <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>

        <v-btn
          type="submit"
          color="primary"
          large
          block
          :loading="loading"
        >
          Войти
        </v-btn>

        <p class="text-center mt-4">
          Нет аккаунта? <router-link to="/register">Зарегистрируйтесь</router-link>
        </p>
      </v-form>
    </v-card>
  </v-container>
</template>

<script>
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Login',
  data() {
    return {
      credentials: {
        email: '',
        password: ''
      }
    }
  },
  computed: {
    error() {
      return useAuthStore().error
    },
    loading() {
      return useAuthStore().loading
    }
  },
  methods: {
    async handleLogin() {
      const authStore = useAuthStore()
      try {
        await authStore.login(this.credentials)
        this.$router.push('/events')
      } catch (error) {
        console.error('Login error:', error)
      }
    }
  }
}
</script>
