<template>
  <v-app>
    <v-app-bar app dark color="primary">
      <v-app-bar-title>SNO FEM ECOS</v-app-bar-title>
      <v-spacer></v-spacer>
      
      <v-menu v-if="isAuthenticated" offset-y>
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon>
            <v-icon>$mdiAccount</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item link to="/profile">
            <v-list-item-title>Мой профиль</v-list-item-title>
          </v-list-item>
          <v-list-item link to="/my-events">
            <v-list-item-title>Мои мероприятия</v-list-item-title>
          </v-list-item>
          <v-list-item link to="/rewards">
            <v-list-item-title>Награды ({{ userPoints }} баллов)</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="logout">
            <v-list-item-title>Выход</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <template v-else>
        <v-btn text to="/login">Вход</v-btn>
        <v-btn text to="/register">Регистрация</v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { useAuthStore } from './stores/auth'
import { useUserStore } from './stores/user'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()
    const userStore = useUserStore()
    const router = useRouter()
    
    const { isAuthenticated } = storeToRefs(authStore)
    const { userPoints } = storeToRefs(userStore)
    
    const logout = () => {
      authStore.logout()
      router.push('/login')
    }
    
    return {
      isAuthenticated,
      userPoints,
      logout
    }
  }
}
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', sans-serif;
}
</style>
