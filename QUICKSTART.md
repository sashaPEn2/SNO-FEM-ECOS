# Быстрый старт

## Быстрый запуск (для разработки)

### Требования
- Node.js 16+
- MongoDB (локально или MongoDB Atlas)

### 1. Установка

```bash
npm run install-all
```

### 2. Конфигурация

Создайте `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sno-fem-ecos
JWT_SECRET=dev_secret_key_change_in_production
JWT_EXPIRE=7d
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@sno-fem-ecos.com
FRONTEND_URL=http://localhost:5173
```

### 3. Запуск

```bash
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

---

## Запуск с Docker

```bash
docker-compose up
```

Доступно на:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- MongoDB: localhost:27017

---

## Демо аккаунты

После первого запуска создайте:

### Admin аккаунт
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@test.com",
    "password": "admin123"
  }'
```

Затем через MongoDB измените роль:
```javascript
db.users.updateOne(
  { email: "admin@test.com" },
  { $set: { role: "admin" } }
)
```

### Organizer аккаунт
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Organizer",
    "lastName": "User",
    "email": "organizer@test.com",
    "password": "org123"
  }'
```

Затем через MongoDB:
```javascript
db.users.updateOne(
  { email: "organizer@test.com" },
  { $set: { role: "organizer" } }
)
```

---

## Основные функции

✅ Регистрация и авторизация через JWT
✅ Создание и управление мероприятиями
✅ Регистрация на события
✅ Система баллов
✅ Обмен баллов на награды
✅ Рейтинг участников
✅ Комментарии к событиям
✅ Уведомления
✅ Экспорт сертификатов (PDF)
✅ Интеграция с календарем

---

## Структура БД

### User
- firstName, lastName, email, password
- role (user/organizer/admin)
- totalPoints, department, phone, bio
- eventsCreated, eventsAttended

### Event
- title, description, startDate, endDate
- location, capacity, category
- organizer, registrations
- pointsPerAttendance, pointsPerSpeaker
- status (draft/published/ongoing/completed)

### Registration
- user, event, status (registered/attended/speaker)
- pointsAwarded, attendanceConfirmed

### Point
- user, amount, reason (attendance/speaker/organizer/reward_redeemed)
- event, description, addedBy

### Reward
- name, description, pointsCost, rewardType
- isActive

### UserReward
- user, reward, earnedAt, certificateNumber

### Comment
- author, event, text, rating
- replies with nested structure

### Notification
- recipient, sender, type, message, title
- link, isRead

---

## Система баллов

| Действие | Баллы |
|----------|-------|
| Посещение мероприятия | 10 |
| Выступление на мероприятии | 20 |
| Организация мероприятия | 30 |

### Награды (обмен баллов)

| Награда | Стоимость |
|---------|-----------|
| Сертификат | 50 баллов |
| Грамота | 100 баллов |
| Приоритет при отборе | 200 баллов |

---

## Документация

- [API Документация](docs/API.md)
- [Руководство установки](docs/INSTALLATION.md)
- [Руководство разработчика](docs/DEVELOPER.md)

---

## Поддержка

По вопросам создавайте Issues в репозитории или контактируйте администратора.
