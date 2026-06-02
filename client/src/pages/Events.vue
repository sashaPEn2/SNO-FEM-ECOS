<template>
  <v-container class="py-10">
    <h1 class="text-h3 mb-6">Мероприятия</h1>

    <v-row class="mb-6">
      <v-col cols="12" md="8">
        <v-text-field
          v-model="searchQuery"
          label="Поиск мероприятий"
          outlined
          prepend-icon="mdi-magnify"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <router-link to="/my-events">
          <v-btn color="primary" block>Создать мероприятие</v-btn>
        </router-link>
      </v-col>
    </v-row>

    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>

    <v-row v-if="!loading" class="mt-6">
      <v-col v-for="event in filteredEvents" :key="event._id" cols="12" md="6" lg="4">
        <v-card class="h-100">
          <v-card-title>{{ event.title }}</v-card-title>
          <v-card-subtitle>
            {{ formatDate(event.startDate) }}
          </v-card-subtitle>
          <v-card-text>
            <p class="text-truncate">{{ event.description }}</p>
            <div class="mt-2">
              <v-chip small color="primary" class="mr-2">
                {{ event.category }}
              </v-chip>
              <v-chip small>
                {{ event.registrations.length }}/{{ event.capacity }}
              </v-chip>
            </div>
          </v-card-text>
          <v-card-actions>
            <router-link :to="`/events/${event._id}`">
              <v-btn text color="primary">Подробнее</v-btn>
            </router-link>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-pagination
      v-if="pagination.totalPages > 1"
      v-model="currentPage"
      :length="pagination.totalPages"
      class="mt-6"
    ></v-pagination>
  </v-container>
</template>

<script>
import { useEventStore } from '../stores/events'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default {
  name: 'Events',
  data() {
    return {
      searchQuery: '',
      currentPage: 1
    }
  },
  computed: {
    events() {
      return useEventStore().events
    },
    loading() {
      return useEventStore().loading
    },
    pagination() {
      return useEventStore().pagination
    },
    filteredEvents() {
      if (!this.searchQuery) return this.events
      return this.events.filter(event =>
        event.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }
  },
  watch: {
    currentPage(newPage) {
      this.fetchEvents(newPage)
    }
  },
  methods: {
    async fetchEvents(page = 1) {
      const eventStore = useEventStore()
      try {
        await eventStore.fetchEvents(page, 10)
      } catch (error) {
        console.error('Error fetching events:', error)
      }
    },
    formatDate(date) {
      return format(new Date(date), 'PPP p', { locale: ru })
    }
  },
  mounted() {
    this.fetchEvents()
  }
}
</script>
