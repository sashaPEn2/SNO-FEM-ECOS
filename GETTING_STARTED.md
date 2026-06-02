# 🎉 Добро пожаловать в SNO FEM ECOS!

## ✅ Что было создано

Полнофункциональная экосистема студенческого научного общества с 2000+ строк кода, включающая:

### 📦 Backend (Node.js + Express + MongoDB)
- ✅ 7 MongoDB моделей (User, Event, Registration, Point, Reward, Comment, Notification)
- ✅ 25+ API эндпоинтов
- ✅ Система аутентификации (JWT)
- ✅ Система ролей (user, organizer, admin)
- ✅ Валидация данных (Joi)
- ✅ Отправка email (Nodemailer)
- ✅ Генерация сертификатов (PDFKit)
- ✅ Middleware для аутентификации и валидации

### 🎨 Frontend (Vue.js 3 + Vite + Vuetify)
- ✅ 8 основных страниц
- ✅ Система управления состоянием (Pinia)
- ✅ Маршрутизация (Vue Router)
- ✅ UI компоненты (Vuetify)
- ✅ HTTP клиент (Axios)

### 📚 Документация
- ✅ README.md - Общее описание
- ✅ QUICKSTART.md - Быстрый старт
- ✅ docs/INSTALLATION.md - Полное руководство установки
- ✅ docs/API.md - Полная API документация
- ✅ docs/DEVELOPER.md - Руководство разработчика
- ✅ docs/REWARDS_SYSTEM.md - Описание системы баллов

### 🚀 Инфраструктура
- ✅ docker-compose.yml
- ✅ Dockerfile для backend и frontend
- ✅ .gitignore
- ✅ Конфигурация для production

---

## 🚀 Быстрый старт (2 минуты)

### 1️⃣ Установка зависимостей
```bash
npm run install-all
```

### 2️⃣ Настройка MongoDB
Отредактируйте `server/.env`:
```bash
MONGODB_URI=mongodb://localhost:27017/sno-fem-ecos
JWT_SECRET=your_secret_key
```

### 3️⃣ Запуск приложения
```bash
npm run dev
```

**Готово!** 
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 📋 Основной функционал

### 🔐 Аутентификация
```
POST /api/auth/register    - Регистрация
POST /api/auth/login       - Вход
GET  /api/auth/me          - Текущий пользователь
```

### 📅 События
```
GET  /api/events           - Все события
POST /api/events           - Создать событие
GET  /api/events/:id       - Деталь события
PUT  /api/events/:id       - Обновить событие
DELETE /api/events/:id     - Удалить событие
```

### 🎟️ Регистрация
```
POST   /api/registrations/register      - Зарегистрироваться
DELETE /api/registrations/:eventId      - Отменить регистрацию
POST   /api/registrations/confirm       - Подтвердить посещение (admin)
GET    /api/registrations/my            - Мои регистрации
```

### ⭐ Баллы и рейтинг
```
GET /api/points/leaderboard     - Рейтинг
GET /api/points/:userId         - Баллы пользователя
POST /api/points/add            - Добавить баллы (admin)
```

### 🏆 Награды
```
GET  /api/rewards               - Доступные награды
POST /api/rewards/redeem        - Обменять на награду
GET  /api/rewards/my            - Мои награды
POST /api/rewards               - Создать награду (admin)
```

### 💬 Комментарии
```
POST /api/comments              - Добавить комментарий
GET  /api/comments/event/:id    - Комментарии события
POST /api/comments/reply        - Ответить на комментарий
```

### 📧 Уведомления
```
GET  /api/notifications             - Мои уведомления
PUT  /api/notifications/:id/read    - Отметить прочитанным
PUT  /api/notifications/read-all    - Отметить все
```

Полная документация: [docs/API.md](docs/API.md)

---

## 🏗️ Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Vue.js 3)                      │
│  Pages → Components → Stores (Pinia) → HTTP (Axios)        │
└────────────────────────────┬────────────────────────────────┘
                             │
                    HTTP REST API
                             │
┌────────────────────────────▼────────────────────────────────┐
│                   Backend (Express.js)                       │
│  Routes → Controllers → Business Logic → Middleware        │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                  MongoDB Database                            │
│  7 Collections: Users, Events, Registrations, ...          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎓 Структура данных

### User Model
```
{
  firstName, lastName, email, password,
  role: 'user' | 'organizer' | 'admin',
  totalPoints: 0-∞,
  department, phone, bio,
  eventsCreated: [], eventsAttended: [],
  isVerified: true|false
}
```

### Event Model
```
{
  title, description,
  startDate, endDate, location,
  capacity: 50,
  category: 'conference|workshop|seminar|competition|other',
  organizer: ObjectId,
  registrations: [],
  pointsPerAttendance: 10,
  pointsPerSpeaker: 20,
  status: 'draft|published|ongoing|completed|cancelled'
}
```

### Point Model
```
{
  user: ObjectId,
  amount: 10-30,
  reason: 'attendance|speaker|organizer|reward_redeemed',
  event: ObjectId,
  addedBy: ObjectId,
  createdAt: Date
}
```

---

## 🔑 Роли и права

| Функция | User | Organizer | Admin |
|---------|------|-----------|-------|
| Профиль | ✅ | ✅ | ✅ |
| Регистрация на события | ✅ | ✅ | ✅ |
| Просмотр событий | ✅ | ✅ | ✅ |
| Создание событий | ❌ | ✅ | ✅ |
| Редактирование своих событий | ❌ | ✅ | ✅ |
| Удаление событий | ❌ | ❌ | ✅ |
| Подтверждение посещения | ❌ | ❌ | ✅ |
| Начисление баллов | ❌ | ❌ | ✅ |
| Управление пользователями | ❌ | ❌ | ✅ |
| Управление наградами | ❌ | ❌ | ✅ |

---

## 🎯 Система баллов

### Начисление
- 🎫 Посещение события: **10 баллов**
- 🎤 Выступление: **20 баллов**
- 📌 Организация события: **30 баллов**

### Награды
- **Сертификат** (50 баллов) - PDF документ
- **Грамота** (100 баллов) - Печатный формат
- **Приоритет** (200 баллов) - При отборе в проекты

Подробнее: [docs/REWARDS_SYSTEM.md](docs/REWARDS_SYSTEM.md)

---

## 🛠️ Команды для разработки

```bash
# Установка всех зависимостей
npm run install-all

# Запуск в режиме разработки (frontend + backend)
npm run dev

# Запуск только backend
npm run server

# Запуск только frontend  
npm run client

# Сборка frontend
npm run build

# Запуск в production
npm start

# Проверка линтера
npm run lint

# С Docker
docker-compose up
```

---

## 📁 Где находятся ключевые файлы

| Что нужно | Где находится |
|----------|--------------|
| Главная страница | `client/src/pages/Home.vue` |
| Вход | `client/src/pages/Login.vue` |
| События | `client/src/pages/Events.vue` |
| API маршруты | `server/routes/` |
| Модели БД | `server/models/` |
| Бизнес-логика | `server/controllers/` |
| Документация | `docs/` |
| Конфигурация | `.env` файлы |

---

## 🐛 Решение проблем

### MongoDB не подключается
```bash
# Убедитесь, что MongoDB запущена
mongod

# Или используйте MongoDB Atlas (облако)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
```

### Порты заняты
```bash
# Измените порты в server/index.js и client/vite.config.js
PORT=5001  # для backend
PORT=5174  # для frontend
```

### CORS ошибка
```bash
# Проверьте FRONTEND_URL в server/.env
FRONTEND_URL=http://localhost:5173
```

---

## 🚀 Следующие шаги

### 1. Базовое использование
- [ ] Запустить приложение
- [ ] Создать admin аккаунт
- [ ] Создать первое событие
- [ ] Зарегистрироваться на событие

### 2. Администрирование
- [ ] Подтвердить посещение
- [ ] Начислить баллы
- [ ] Создать награды
- [ ] Проверить рейтинг

### 3. Расширение функционала
- [ ] Добавить новые типы наград
- [ ] Кастомизировать дизайн
- [ ] Подключить реальную email-рассылку
- [ ] Настроить уведомления

---

## 📚 Полная документация

- [README.md](README.md) - Общее описание
- [QUICKSTART.md](QUICKSTART.md) - Быстрый старт
- [docs/INSTALLATION.md](docs/INSTALLATION.md) - Установка
- [docs/API.md](docs/API.md) - API документация
- [docs/DEVELOPER.md](docs/DEVELOPER.md) - Для разработчиков
- [docs/REWARDS_SYSTEM.md](docs/REWARDS_SYSTEM.md) - Система наград

---

## 🎉 Готово к запуску!

```bash
# 1. Установите зависимости
npm run install-all

# 2. Установите MongoDB (если локально)
# или используйте MongoDB Atlas

# 3. Отредактируйте server/.env

# 4. Запустите
npm run dev

# 5. Откройте http://localhost:5173 в браузере
```

---

## 💡 Полезные советы

✅ Начните с создания нескольких событий
✅ Пригласите друзей зарегистрироваться
✅ Протестируйте систему баллов
✅ Проверьте рейтинг и награды
✅ Оставляйте feedback

---

## 📞 Поддержка

- 📖 Документация: смотрите папку `/docs`
- 🐛 Ошибки: создавайте Issues
- 💬 Вопросы: смотрите DEVELOPER.md

---

**Спасибо за использование SNO FEM ECOS!** 🌟

Надеемся, что эта система поможет вашему научному обществу стать еще более успешным и активным!

---

*Версия: 1.0.0*
*Последнее обновление: 2024*
*Лицензия: MIT*
