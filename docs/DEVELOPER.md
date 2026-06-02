# Руководство разработчика

## Архитектура приложения

### Backend (Node.js + Express)

```
server/
├── models/              # MongoDB модели (Mongoose schemas)
├── routes/              # Express маршруты
├── controllers/          # Бизнес-логика обработчики
├── middleware/           # Express middleware
│   ├── auth.js         # JWT аутентификация
│   └── validation.js    # Joi валидация
├── utils/               # Утилиты
│   ├── email.js        # Отправка email
│   ├── jwt.js          # JWT операции
│   └── pdf.js          # Генерация PDF
└── index.js            # Точка входа
```

### Frontend (Vue.js 3 + Vite)

```
client/
├── src/
│   ├── pages/          # Vue компоненты страниц
│   ├── stores/          # Pinia хранилища (состояние)
│   ├── router/          # Vue Router конфигурация
│   ├── components/      # Переиспользуемые компоненты
│   ├── utils/          # Утилиты
│   ├── App.vue         # Корневой компонент
│   └── main.js         # Точка входа
├── public/              # Статические файлы
├── index.html          # HTML страница
└── vite.config.js      # Конфигурация Vite
```

---

## Стандарты кодирования

### JavaScript/Node.js

- Используйте `const` вместо `let` (если возможно)
- Используйте arrow functions
- Используйте async/await вместо callbacks
- Комментируйте сложный код
- Используйте camelCase для переменных

Пример:

```javascript
// ✅ Хорошо
const getUserData = async (userId) => {
  try {
    const user = await User.findById(userId)
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

// ❌ Плохо
function get_user_data(userId) {
  let user = User.findById(userId)
  return user
}
```

### Vue.js

- Используйте composition API или setup функции
- Используйте kebab-case для имен компонентов в templates
- Документируйте props
- Используйте v-for с key

Пример:

```vue
<template>
  <div class="event-card">
    <h2>{{ event.title }}</h2>
    <p>{{ event.description }}</p>
    <button @click="handleClick">Нажать</button>
  </div>
</template>

<script>
export default {
  name: 'EventCard',
  props: {
    event: {
      type: Object,
      required: true
    }
  },
  methods: {
    handleClick() {
      this.$emit('click', this.event)
    }
  }
}
</script>
```

---

## Добавление новой функции

### Пример: Добавление системы рейтинговки

#### 1. Backend

**Шаг 1: Модель (models/Rating.js)**
```javascript
const ratingSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now }
})
```

**Шаг 2: Контроллер (controllers/ratingController.js)**
```javascript
exports.createRating = async (req, res) => {
  // Логика создания рейтинга
}

exports.getRating = async (req, res) => {
  // Логика получения рейтинга
}
```

**Шаг 3: Маршрут (routes/ratings.js)**
```javascript
router.post('/', authMiddleware, ratingController.createRating)
router.get('/:eventId', ratingController.getRating)
```

**Шаг 4: Добавить маршрут в index.js**
```javascript
app.use('/api/ratings', require('./routes/ratings'))
```

#### 2. Frontend

**Шаг 1: Store (stores/ratings.js)**
```javascript
export const useRatingStore = defineStore('rating', {
  // Состояние и действия
})
```

**Шаг 2: Компонент (components/RatingWidget.vue)**
```vue
<template>
  <div class="rating-widget">
    <!-- UI для рейтинга -->
  </div>
</template>
```

**Шаг 3: Использовать компонент в странице**

---

## Тестирование API с помощью cURL

### Регистрация

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Иван",
    "lastName": "Иванов"
  }'
```

### Вход

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Получить событие с токеном

```bash
curl -X GET http://localhost:5000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Debugging

### Backend

Используйте console.log() или debugger:

```javascript
// Точка останова
debugger

// Логирование
console.log('Event data:', event)
console.error('Error:', error)
```

Запустите с инспектором:
```bash
node --inspect server/index.js
```

Откройте `chrome://inspect` в Chrome

### Frontend

Используйте Vue DevTools:
1. Установите расширение Vue DevTools для Chrome
2. Используйте браузерную консоль (F12)
3. Инспектируйте компоненты в DevTools

---

## Развертывание

### Heroku

1. Создайте приложение на Heroku
2. Добавьте переменные окружения
3. Подключите репозиторий
4. Включите автоматические развертывания

### Docker

Создайте `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Backend
COPY server/package.json server/package-lock.json server/
RUN cd server && npm install

# Frontend
COPY client/package.json client/package-lock.json client/
RUN cd client && npm install && npm run build

COPY server/ server/
COPY client/dist/ server/public/

EXPOSE 5000

CMD ["node", "server/index.js"]
```

---

## Полезные ссылки

- [Vue.js 3 документация](https://vuejs.org)
- [Express.js документация](https://expressjs.com)
- [MongoDB документация](https://docs.mongodb.com)
- [Pinia документация](https://pinia.vuejs.org)
- [Vuetify документация](https://vuetifyjs.com)

