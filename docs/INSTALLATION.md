# Руководство по установке и запуску

## Требования

- Node.js 16+ ([скачать](https://nodejs.org/))
- MongoDB ([скачать](https://www.mongodb.com/try/download/community) или использовать [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- npm или yarn

## Шаги установки

### 1. Клонирование репозитория

```bash
git clone <repository_url>
cd SNO-FEM-ECOS
```

### 2. Установка зависимостей

```bash
npm run install-all
```

Это установит зависимости для:
- корневого проекта
- backend (`server/`)
- frontend (`client/`)

### 3. Настройка переменных окружения

#### Backend (.env)

Создайте файл `server/.env` на основе `server/.env.example`:

```bash
cp server/.env.example server/.env
```

Отредактируйте `server/.env`:

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/sno-fem-ecos
# Или для MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sno-fem-ecos

# JWT
JWT_SECRET=your_secure_secret_key_here
JWT_EXPIRE=7d

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@sno-fem-ecos.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

#### MongoDB локально

Если используете MongoDB локально:

```bash
# Linux/Mac
mongod

# Windows
# "C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe"
```

Или используйте [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) для облачной БД.

### 4. Запуск в режиме разработки

```bash
npm run dev
```

Это запустит одновременно:
- Backend на `http://localhost:5000`
- Frontend на `http://localhost:5173`

### 5. Запуск в режиме production

```bash
# Сборка frontend
npm run build

# Запуск backend
npm start
```

---

## Структура проекта

```
SNO-FEM-ECOS/
├── server/              # Backend
│   ├── models/         # MongoDB модели
│   ├── routes/         # API маршруты
│   ├── controllers/     # Бизнес-логика
│   ├── middleware/      # Middleware
│   ├── utils/          # Утилиты
│   ├── index.js        # Точка входа
│   ├── package.json
│   └── .env.example
├── client/              # Frontend
│   ├── src/
│   │   ├── pages/      # Vue страницы
│   │   ├── stores/     # Pinia хранилища
│   │   ├── router/     # Vue Router
│   │   ├── App.vue
│   │   └── main.js
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── docs/                # Документация
├── package.json         # Root package.json
└── README.md
```

---

## Первые шаги

### 1. Регистрация пользователя

Перейдите на `http://localhost:5173` и нажмите "Регистрация"

### 2. Создание мероприятия

Войдите в аккаунт → Перейдите в "Мои мероприятия" → Нажмите "Создать новое мероприятие"

### 3. Регистрация на мероприятие

Перейдите в "Мероприятия" → Выберите событие → Нажмите "Зарегистрироваться"

### 4. Просмотр баллов

Перейдите в профиль → Посмотрите количество баллов

### 5. Обмен на награды

Перейдите в "Награды" → Выберите награду → Нажмите "Обменять"

---

## Управление admin'ом

### Добавить пользователю роль admin

1. Подключитесь к MongoDB

```bash
mongo sno-fem-ecos
```

2. Найдите пользователя и обновите роль

```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

Или используйте API:

```bash
curl -X PUT http://localhost:5000/api/users/role \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id",
    "role": "admin"
  }'
```

---

## Решение проблем

### MongoDB не подключается

```bash
# Проверьте, запущена ли MongoDB
mongod

# Если используете Atlas, проверьте строку подключения
# Убедитесь, что IP-адрес в белом списке
```

### Ошибка CORS

Убедитесь, что `FRONTEND_URL` правильно установлен в `.env`

### Ошибка Email

Если используете Gmail:
1. Включите "Небезопасные приложения" или создайте [App Password](https://support.google.com/accounts/answer/185833)
2. Используйте App Password в переменной `EMAIL_PASSWORD`

### Порты уже заняты

Измените порты в `server/index.js` и `client/vite.config.js`

---

## Полезные команды

```bash
# Установить зависимости
npm run install-all

# Запуск в режиме разработки
npm run dev

# Запуск backend отдельно
npm run server

# Запуск frontend отдельно
npm run client

# Сборка frontend
npm run build

# Запуск production сервера
npm start

# Проверить eslint
npm run lint
```

---

## API документация

Полная документация API доступна в [docs/API.md](API.md)

---

## Контакты и поддержка

По вопросам обращайтесь к администратору или создавайте Issues в репозитории.
