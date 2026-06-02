<template>
  <v-container class="py-10">
    <h1 class="text-h3 mb-6">Мои мероприятия</h1>

    <v-btn color="primary" large class="mb-6" @click="showCreateDialog = true">
      Создать новое мероприятие
    </v-btn>

    <!-- Диалог создания события -->
    <v-dialog v-model="showCreateDialog" max-width="600px">
      <v-card class="pa-6">
        <h2 class="text-h5 mb-4">Создание нового мероприятия</h2>
        
        <v-form @submit.prevent="createEvent">
          <v-text-field
            v-model="newEvent.title"
            label="Название"
            outlined
            class="mb-4"
            required
          ></v-text-field>

          <v-textarea
            v-model="newEvent.description"
            label="Описание"
            outlined
            class="mb-4"
            required
          ></v-textarea>

          <v-text-field
            v-model="newEvent.location"
            label="Место проведения"
            outlined
            class="mb-4"
            required
          ></v-text-field>

          <v-text-field
            v-model.number="newEvent.capacity"
            label="Вместимость"
            type="number"
            outlined
            class="mb-4"
            required
          ></v-text-field>

          <v-text-field
            v-model="newEvent.startDate"
            label="Дата начала"
            type="datetime-local"
            outlined
            class="mb-4"
            required
          ></v-text-field>

          <v-text-field
            v-model="newEvent.endDate"
            label="Дата окончания"
            type="datetime-local"
            outlined
            class="mb-4"
            required
          ></v-text-field>

          <v-select
            v-model="newEvent.category"
            label="Категория"
            :items="categories"
            outlined
            class="mb-4"
          ></v-select>

          <div class="d-flex gap-2">
            <v-btn type="submit" color="primary" large>Создать</v-btn>
            <v-btn @click="showCreateDialog = false" large outlined>Отмена</v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Список событий -->
    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>

    <v-row v-if="!loading" class="mt-6">
      <v-col v-for="event in myEvents" :key="event._id" cols="12" md="6" lg="4">
        <v-card>
          <v-card-title>{{ event.title }}</v-card-title>
          <v-card-subtitle>{{ event.status }}</v-card-subtitle>
          <v-card-text>
            <p class="text-truncate">{{ event.description }}</p>
            <div class="mt-2">
              <v-chip small>{{ event.registrations.length }}/{{ event.capacity }}</v-chip>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn text color="primary" small @click="editEvent(event)">Редактировать</v-btn>
            <v-btn text color="error" small @click="deleteEvent(event._id)">Удалить</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useEventStore } from '../stores/events'

export default {
  name: 'MyEvents',
  data() {
    return {
      showCreateDialog: false,
      newEvent: {
        title: '',
        description: '',
        location: '',
        capacity: 50,
        startDate: '',
        endDate: '',
        category: 'seminar'
      },
      categories: ['conference', 'workshop', 'seminar', 'competition', 'other']
    }
  },
  computed: {
    myEvents() {
      return useEventStore().myEvents
    },
    loading() {
      return useEventStore().loading
    }
  },
  methods: {
    async createEvent() {
      const eventStore = useEventStore()
      try {
        await eventStore.createEvent(this.newEvent)
        alert('Событие создано успешно!')
        this.showCreateDialog = false
        this.newEvent = {
          title: '',
          description: '',
          location: '',
          capacity: 50,
          startDate: '',
          endDate: '',
          category: 'seminar'
        }
      } catch (error) {
        console.error('Error creating event:', error)
      }
    },
    editEvent(event) {
      console.log('Edit event:', event)
    },
    async deleteEvent(eventId) {
      if (confirm('Вы уверены?')) {
        console.log('Delete event:', eventId)
      }
    }
  }
}
</script>
