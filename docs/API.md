# API Документация - SNO FEM ECOS

## Базовая информация

**Base URL**: `http://localhost:5000/api`

**Аутентификация**: JWT токен в заголовке `Authorization: Bearer {token}`

---

## Аутентификация

### POST /auth/register
Регистрация нового пользователя

**Тело запроса:**
```json
{
  "firstName": "Иван",
  "lastName": "Иванов",
  "email": "ivan@example.com",
  "password": "password123"
}
```

**Ответ:** 
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "ivan@example.com",
    "firstName": "Иван",
    "lastName": "Иванов",
    "role": "user"
  }
}
```

### POST /auth/login
Вход в систему

**Тело запроса:**
```json
{
  "email": "ivan@example.com",
  "password": "password123"
}
```

**Ответ:** 
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "ivan@example.com",
    "totalPoints": 150
  }
}
```

### GET /auth/me
Получить текущего пользователя (требует аутентификацию)

**Ответ:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "ivan@example.com",
    "firstName": "Иван",
    "lastName": "Иванов",
    "role": "user",
    "totalPoints": 150
  }
}
```

---

## События

### GET /events
Получить все события

**Query параметры:**
- `page` (default: 1) - Номер страницы
- `limit` (default: 10) - Количество элементов на странице
- `category` - Фильтр по категории
- `status` - Фильтр по статусу

**Ответ:**
```json
{
  "success": true,
  "events": [
    {
      "_id": "event_id",
      "title": "Конференция по экономике",
      "description": "...",
      "startDate": "2024-01-20T10:00:00Z",
      "endDate": "2024-01-20T12:00:00Z",
      "location": "Аудитория 101",
      "capacity": 50,
      "category": "conference",
      "status": "published",
      "pointsPerAttendance": 10,
      "pointsPerSpeaker": 20,
      "registrations": []
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "total": 45
  }
}
```

### POST /events
Создать новое событие (требует роль organizer или admin)

**Тело запроса:**
```json
{
  "title": "Конференция по экономике",
  "description": "Описание конференции",
  "startDate": "2024-01-20T10:00:00Z",
  "endDate": "2024-01-20T12:00:00Z",
  "location": "Аудитория 101",
  "capacity": 50,
  "category": "conference",
  "tags": ["экономика", "менеджмент"],
  "pointsPerAttendance": 10,
  "pointsPerSpeaker": 20
}
```

### GET /events/:id
Получить событие по ID

### PUT /events/:id
Обновить событие

### DELETE /events/:id
Удалить событие

---

## Регистрация на события

### POST /registrations/register
Зарегистрироваться на событие

**Тело запроса:**
```json
{
  "eventId": "event_id"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Вы успешно зарегистрированы",
  "registration": {
    "_id": "registration_id",
    "user": "user_id",
    "event": "event_id",
    "status": "registered",
    "pointsAwarded": 0
  }
}
```

### DELETE /registrations/:eventId
Отменить регистрацию на событие

### POST /registrations/confirm
Подтвердить посещение (требует admin)

**Тело запроса:**
```json
{
  "registrationId": "registration_id",
  "pointsType": "attendance" // или "speaker"
}
```

### GET /registrations/my
Получить свои регистрации

---

## Баллы

### GET /points/leaderboard
Получить рейтинг пользователей

**Query параметры:**
- `limit` (default: 50) - Количество пользователей

**Ответ:**
```json
{
  "success": true,
  "leaderboard": [
    {
      "_id": "user_id",
      "firstName": "Иван",
      "lastName": "Иванов",
      "totalPoints": 250
    }
  ]
}
```

### GET /points/:userId
Получить баллы пользователя

**Ответ:**
```json
{
  "success": true,
  "totalPoints": 150,
  "history": [
    {
      "_id": "point_id",
      "amount": 10,
      "reason": "attendance",
      "event": { "title": "Конференция" },
      "createdAt": "2024-01-20T10:30:00Z"
    }
  ]
}
```

### POST /points/add
Добавить баллы (требует admin)

**Тело запроса:**
```json
{
  "userId": "user_id",
  "amount": 50,
  "reason": "manual_add",
  "description": "Дополнительные баллы за участие"
}
```

---

## Награды

### GET /rewards
Получить все доступные награды

**Ответ:**
```json
{
  "success": true,
  "rewards": [
    {
      "_id": "reward_id",
      "name": "Сертификат",
      "description": "Сертификат об участии",
      "pointsCost": 50,
      "rewardType": "certificate"
    }
  ]
}
```

### POST /rewards/redeem
Обменять баллы на награду

**Тело запроса:**
```json
{
  "rewardId": "reward_id"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Награда получена",
  "remainingPoints": 100
}
```

### GET /rewards/my
Получить мои награды

### POST /rewards
Создать новую награду (требует admin)

**Тело запроса:**
```json
{
  "name": "Сертификат",
  "description": "Сертификат об участии",
  "pointsCost": 50,
  "rewardType": "certificate"
}
```

---

## Комментарии

### POST /comments
Добавить комментарий к событию

**Тело запроса:**
```json
{
  "eventId": "event_id",
  "text": "Отличное событие!",
  "rating": 5
}
```

### GET /comments/event/:eventId
Получить комментарии события

### POST /comments/reply
Ответить на комментарий

**Тело запроса:**
```json
{
  "commentId": "comment_id",
  "text": "Спасибо за комментарий!"
}
```

### DELETE /comments/:commentId
Удалить комментарий

---

## Уведомления

### GET /notifications
Получить уведомления

**Query параметры:**
- `page` (default: 1)
- `limit` (default: 20)

### PUT /notifications/:notificationId/read
Отметить уведомление как прочитанное

### PUT /notifications/read-all
Отметить все уведомления как прочитанные

### DELETE /notifications/:notificationId
Удалить уведомление

---

## Пользователи

### GET /users/profile/:userId?
Получить профиль пользователя

### PUT /users/profile
Обновить профиль

**Тело запроса:**
```json
{
  "firstName": "Иван",
  "lastName": "Иванов",
  "bio": "Студент факультета экономики",
  "phone": "+7 (999) 123-45-67",
  "department": "ФЭМ"
}
```

### GET /users (требует admin)
Получить всех пользователей

### PUT /users/role (требует admin)
Изменить роль пользователя

**Тело запроса:**
```json
{
  "userId": "user_id",
  "role": "organizer" // "user" | "organizer" | "admin"
}
```

---

## Коды ошибок

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

