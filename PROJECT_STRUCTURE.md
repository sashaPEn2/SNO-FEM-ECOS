# SNO FEM ECOS - Полное описание проекта

## 📋 Содержание

1. [Обзор проекта](#обзор-проекта)
2. [Функциональность](#функциональность)
3. [Технологический стек](#технологический-стек)
4. [Установка](#установка)
5. [Структура проекта](#структура-проекта)
6. [Основные компоненты](#основные-компоненты)
7. [API примеры](#api-примеры)

---

## 🎯 Обзор проекта

**SNO FEM ECOS** - это полнофункциональная веб-экосистема для управления деятельностью студенческого научного общества факультета экономики и менеджмента.

### Основные возможности:
- 👥 Система регистрации и авторизации
- 📅 Управление мероприятиями
- 🎟️ Регистрация участников
- ⭐ Система баллов и рейтинга
- 🏆 Обмен баллов на награды
- 💬 Комментарии и обсуждения
- 📧 Система уведомлений
- 📄 Генерация сертификатов

---

## ✨ Функциональность

### Для студентов (User)
- ✅ Регистрация и авторизация
- ✅ Просмотр доступных мероприятий
- ✅ Регистрация на события
- ✅ Просмотр накопленных баллов
- ✅ Обмен баллов на награды
- ✅ Оставление комментариев и оценок
- ✅ Просмотр рейтинга
- ✅ Получение уведомлений

### Для организаторов (Organizer)
- ✅ Все возможности User
- ✅ Создание мероприятий
- ✅ Редактирование своих событий
- ✅ Просмотр регистраций
- ✅ Управление статусом события

### Для администраторов (Admin)
- ✅ Все возможности Organizer
- ✅ Управление всеми пользователями
- ✅ Изменение ролей пользователей
- ✅ Создание и управление наградами
- ✅ Ручное начисление баллов
- ✅ Подтверждение посещений
- ✅ Просмотр статистики

---

## 🛠️ Технологический стек

### Backend
```
Node.js 16+          - Runtime
Express.js 4.x       - Web Framework
MongoDB 5.x          - Database
Mongoose 7.x         - ODM
JWT                  - Authentication
Joi                  - Validation
Nodemailer           - Email
PDFKit               - PDF Generation
```

### Frontend
```
Vue.js 3             - Framework
Vue Router 4         - Routing
Pinia 2              - State Management
Vite 4               - Build Tool
Vuetify 3            - UI Components
Axios                - HTTP Client
Date-fns             - Date Utilities
```

### DevOps
```
Docker               - Containerization
Docker Compose       - Orchestration
GitHub              - Version Control
```

---

## 🚀 Установка

### Требования
- Node.js 16 или выше
- MongoDB (локально или Atlas)
- npm или yarn

### Быстрый старт

```bash
# 1. Клонирование
git clone <repo>
cd SNO-FEM-ECOS

# 2. Установка зависимостей
npm run install-all

# 3. Конфигурация .env
cp server/.env.example server/.env
# Отредактируйте server/.env

# 4. Запуск
npm run dev
```

### С Docker

```bash
docker-compose up
```

Подробно смотрите [QUICKSTART.md](QUICKSTART.md)

---

## 📁 Структура проекта

```
SNO-FEM-ECOS/
│
├── server/                          # Backend приложение
│   ├── models/                      # MongoDB модели
│   │   ├── User.js                  # Модель пользователя
│   │   ├── Event.js                 # Модель события
│   │   ├── Registration.js          # Регистрация на событие
│   │   ├── Point.js                 # История баллов
│   │   ├── Reward.js                # Награды
│   │   ├── UserReward.js            # Полученные награды
│   │   ├── Comment.js               # Комментарии
│   │   └── Notification.js          # Уведомления
│   │
│   ├── routes/                      # API маршруты
│   │   ├── auth.js                  # Аутентификация
│   │   ├── events.js                # События
│   │   ├── registrations.js         # Регистрации
│   │   ├── points.js                # Баллы и рейтинг
│   │   ├── rewards.js               # Награды
│   │   ├── comments.js              # Комментарии
│   │   ├── notifications.js         # Уведомления
│   │   └── users.js                 # Управление пользователями
│   │
│   ├── controllers/                 # Бизнес-логика
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── registrationController.js
│   │   ├── pointController.js
│   │   ├── rewardController.js
│   │   ├── commentController.js
│   │   ├── notificationController.js
│   │   └── userController.js
│   │
│   ├── middleware/                  # Express middleware
│   │   ├── auth.js                  # JWT аутентификация
│   │   └── validation.js            # Joi валидация
│   │
│   ├── utils/                       # Утилиты
│   │   ├── email.js                 # Отправка email
│   │   ├── jwt.js                   # JWT операции
│   │   └── pdf.js                   # Генерация PDF
│   │
│   ├── index.js                     # Точка входа
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
│
├── client/                          # Frontend приложение
│   ├── src/
│   │   ├── pages/                   # Vue страницы
│   │   │   ├── Home.vue             # Главная
│   │   │   ├── Login.vue            # Вход
│   │   │   ├── Register.vue         # Регистрация
│   │   │   ├── Events.vue           # Список событий
│   │   │   ├── EventDetail.vue      # Деталь события
│   │   │   ├── Profile.vue          # Профиль
│   │   │   ├── MyEvents.vue         # Мои события
│   │   │   ├── Rewards.vue          # Награды
│   │   │   └── Leaderboard.vue      # Рейтинг
│   │   │
│   │   ├── stores/                  # Pinia хранилища
│   │   │   ├── auth.js              # Аутентификация
│   │   │   ├── user.js              # Профиль и награды
│   │   │   └── events.js            # События
│   │   │
│   │   ├── router/
│   │   │   └── index.js             # Vue Router конфигурация
│   │   │
│   │   ├── components/              # Переиспользуемые компоненты
│   │   ├── utils/                   # Утилиты
│   │   ├── App.vue                  # Корневой компонент
│   │   └── main.js                  # Точка входа
│   │
│   ├── public/                      # Статические файлы
│   ├── index.html                   # HTML страница
│   ├── vite.config.js               # Конфигурация Vite
│   ├── package.json
│   └── Dockerfile
│
├── docs/                            # Документация
│   ├── API.md                       # API документация
│   ├── INSTALLATION.md              # Руководство установки
│   └── DEVELOPER.md                 # Руководство разработчика
│
├── package.json                     # Root package.json
├── docker-compose.yml               # Docker Compose конфигурация
├── QUICKSTART.md                    # Быстрый старт
├── README.md                        # Основной README
├── LICENSE                          # MIT лицензия
└── .gitignore
```

---

## 🔑 Основные компоненты

### Backend компоненты

#### 1. Модель User
```javascript
{
  firstName, lastName, email, password,
  role: 'user' | 'organizer' | 'admin',
  totalPoints: Number,
  department, phone, bio, avatar,
  eventsCreated: [Event],
  eventsAttended: [Event],
  isVerified: Boolean
}
```

#### 2. Модель Event
```javascript
{
  title, description,
  startDate, endDate,
  location, capacity,
  category: 'conference' | 'workshop' | 'seminar' | 'competition' | 'other',
  organizer: User,
  registrations: [Registration],
  pointsPerAttendance: 10,
  pointsPerSpeaker: 20,
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
}
```

#### 3. Система баллов
```
Attendance: 10 баллов
Speaker: 20 баллов  
Organizer: 30 баллов (автоматически)
```

#### 4. Система наград
```
50 баллов  → Сертификат
100 баллов → Грамота
200 баллов → Приоритет при отборе
```

### Frontend компоненты

#### 1. Pinia Stores
- `auth` - Аутентификация и авторизация
- `user` - Профиль и награды
- `events` - События и регистрации

#### 2. Страницы
- Home - Главная страница
- Login/Register - Аутентификация
- Events - Список событий
- EventDetail - Деталь события
- Profile - Профиль пользователя
- MyEvents - Мои события
- Rewards - Обмен баллов
- Leaderboard - Рейтинг

---

## 📡 API примеры

### Регистрация
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Иван",
  "lastName": "Иванов"
}
```

### Создание события
```bash
POST /api/events
Authorization: Bearer {token}
{
  "title": "Конференция",
  "description": "...",
  "startDate": "2024-01-20T10:00:00Z",
  "endDate": "2024-01-20T12:00:00Z",
  "location": "Ауд. 101",
  "capacity": 50,
  "category": "conference"
}
```

### Регистрация на событие
```bash
POST /api/registrations/register
Authorization: Bearer {token}
{
  "eventId": "event_id"
}
```

### Обмен на награду
```bash
POST /api/rewards/redeem
Authorization: Bearer {token}
{
  "rewardId": "reward_id"
}
```

Полная документация: [docs/API.md](docs/API.md)

---

## 🎓 Учебные материалы

- [Руководство установки](docs/INSTALLATION.md)
- [API Документация](docs/API.md)
- [Руководство разработчика](docs/DEVELOPER.md)
- [Быстрый старт](QUICKSTART.md)

---

## 📈 Статистика проекта

- **Backend endpoints**: 25+
- **Frontend pages**: 8
- **Database models**: 7
- **Lines of code**: 2000+

---

## 🤝 Вклад

Приветствуются pull requests. Для больших изменений сначала откройте issue.

---

## 📄 Лицензия

MIT License - смотрите [LICENSE](LICENSE)

---

## 📞 Поддержка

По вопросам:
1. Смотрите документацию в `/docs`
2. Создавайте Issues
3. Контактируйте администратора

---

**Готово!** Ваша экосистема SNO FEM ECOS готова к работе! 🎉
