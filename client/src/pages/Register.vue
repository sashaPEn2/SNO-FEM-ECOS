<template>
  <v-container class="py-10">
    <v-card class="pa-6">
      <h1 class="text-h4 mb-6">Регистрация</h1>
      
      <v-form @submit.prevent="handleRegister">
        <v-text-field
          v-model="formData.firstName"
          label="Имя"
          outlined
          class="mb-4"
          required
        ></v-text-field>

        <v-text-field
          v-model="formData.lastName"
          label="Фамилия"
          outlined
          class="mb-4"
          required
        ></v-text-field>

        <v-text-field
          v-model="formData.email"
          label="Email"
          type="email"
          outlined
          class="mb-4"
          required
        ></v-text-field>

        <v-text-field
          v-model="formData.password"
          label="Пароль"
          type="password"
          outlined
          class="mb-4"
          required
        ></v-text-field>

        <v-text-field
          v-model="formData.confirmPassword"
          label="Подтвердите пароль"
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
          Зарегистрироваться
        </v-btn>

        <p class="text-center mt-4">
          Уже есть аккаунт? <router-link to="/login">Войдите</router-link>
        </p>
      </v-form>
    </v-card>
  </v-container>
</template>

<script>
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Register',
  data() {
    return {
      formData: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
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
    async handleRegister() {
      if (this.formData.password !== this.formData.confirmPassword) {
        alert('Пароли не совпадают')
        return
      }

      const authStore = useAuthStore()
      try {
        await authStore.register({
          firstName: this.formData.firstName,
          lastName: this.formData.lastName,
          email: this.formData.email,
          password: this.formData.password
        })
        this.$router.push('/events')
      } catch (error) {
        console.error('Register error:', error)
      }
    }
  }
}
</script>
