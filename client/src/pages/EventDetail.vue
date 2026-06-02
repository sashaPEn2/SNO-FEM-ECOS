<template>
  <v-container class="py-10">
    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>

    <v-card v-if="event && !loading" class="pa-6">
      <v-row>
        <v-col cols="12" md="8">
          <h1 class="text-h3 mb-4">{{ event.title }}</h1>
          
          <div class="mb-4">
            <v-chip class="mr-2" color="primary">{{ event.category }}</v-chip>
            <v-chip>Статус: {{ event.status }}</v-chip>
          </div>

          <div class="mb-6">
            <h3 class="text-h6 mb-2">Описание</h3>
            <p>{{ event.description }}</p>
          </div>

          <div class="mb-6">
            <h3 class="text-h6 mb-2">Информация</h3>
            <v-list>
              <v-list-item>
                <v-list-item-title>Дата начала:</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(event.startDate) }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Дата окончания:</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(event.endDate) }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Место:</v-list-item-title>
                <v-list-item-subtitle>{{ event.location }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Места:</v-list-item-title>
                <v-list-item-subtitle>{{ event.registrations.length }}/{{ event.capacity }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Баллы за участие:</v-list-item-title>
                <v-list-item-subtitle>{{ event.pointsPerAttendance }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="event.pointsPerSpeaker">
                <v-list-item-title>Баллы за выступление:</v-list-item-title>
                <v-list-item-subtitle>{{ event.pointsPerSpeaker }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>

          <v-btn
            v-if="isAuthenticated && !isRegistered"
            color="primary"
            large
            @click="registerForEvent"
          >
            Зарегистрироваться
          </v-btn>
          <v-btn v-if="isRegistered" color="success" large disabled>
            Вы зарегистрированы
          </v-btn>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="pa-4 mb-4">
            <v-card-title>Организатор</v-card-title>
            <v-card-text>
              {{ event.organizer.firstName }} {{ event.organizer.lastName }}<br>
              {{ event.organizer.email }}
            </v-card-text>
          </v-card>

          <v-card class="pa-4">
            <v-card-title>Теги</v-card-title>
            <v-card-text>
              <v-chip v-for="tag in event.tags" :key="tag" small class="mr-2 mb-2">
                {{ tag }}
              </v-chip>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-divider class="my-6"></v-divider>

      <h2 class="text-h5 mb-4">Комментарии</h2>
      <!-- Комментарии будут добавлены позже -->
    </v-card>
  </v-container>
</template>

<script>
import { useEventStore } from '../stores/events'
import { useAuthStore } from '../stores/auth'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default {
  name: 'EventDetail',
  data() {
    return {
      isRegistered: false
    }
  },
  computed: {
    event() {
      return useEventStore().currentEvent
    },
    loading() {
      return useEventStore().loading
    },
    isAuthenticated() {
      return useAuthStore().isAuthenticated
    }
  },
  methods: {
    async fetchEvent() {
      const eventStore = useEventStore()
      try {
        await eventStore.getEventById(this.$route.params.id)
        this.checkIfRegistered()
      } catch (error) {
        console.error('Error fetching event:', error)
      }
    },
    async registerForEvent() {
      const eventStore = useEventStore()
      try {
        await eventStore.registerForEvent(this.$route.params.id)
        alert('Вы успешно зарегистрированы!')
        this.isRegistered = true
      } catch (error) {
        console.error('Error registering:', error)
      }
    },
    formatDate(date) {
      return format(new Date(date), 'PPP p', { locale: ru })
    },
    checkIfRegistered() {
      const authStore = useAuthStore()
      if (this.event && authStore.user) {
        this.isRegistered = this.event.registrations.some(
          reg => reg.user === authStore.user.id
        )
      }
    }
  },
  mounted() {
    this.fetchEvent()
  }
}
</script>
