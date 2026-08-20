# 🍅 Pomodoro Clocker

**Pomodoro Clocker** — вебзастосунок для підвищення особистої продуктивності за допомогою техніки Pomodoro.

Застосунок дозволяє користувачам працювати за структурованими робочими сесіями, автоматично переходити між роботою та перервами, зберігати історію сесій, переглядати статистику продуктивності та налаштовувати тривалість таймера.

Проєкт розроблений як командний проєкт з використанням GitHub, Trello, Git Flow та REST API.

---

## 📌 Опис проєкту

Основна мета **Pomodoro Clocker** — створити зручний вебзастосунок, який допомагає користувачам організовувати робочий час за методикою Pomodoro.

Користувач може:

* запускати та призупиняти таймер;
* працювати з робочими сесіями;
* автоматично переходити до короткої та довгої перерви;
* налаштовувати тривалість робочих сесій і перерв;
* зберігати історію завершених сесій;
* переглядати статистику продуктивності;
* переглядати графік продуктивності за тиждень;
* створювати власний обліковий запис;
* входити до системи через JWT-аутентифікацію;
* зберігати персональні налаштування.

---

## ✨ Основний функціонал

### ⏱ Pomodoro Timer

* Робоча сесія.
* Коротка перерва.
* Довга перерва.
* Автоматичне перемикання між сесіями.
* Автоматичний запуск наступної сесії.
* Налаштування тривалості кожного типу сесії.
* Налаштування кількості робочих циклів до довгої перерви.
* Кнопки Start, Pause та Reset.
* Відображення поточного типу сесії.

Приклад роботи:

```text
🍅 Work
   ↓
☕ Short Break
   ↓
🍅 Work
   ↓
☕ Short Break
   ↓
🍅 Work
   ↓
🌙 Long Break
```

---

## 👤 Авторизація

Для роботи з персональними даними реалізована JWT-аутентифікація.

Можливості:

* реєстрація користувача;
* вхід у систему;
* хешування пароля;
* створення JWT-токена;
* захищені API endpoints;
* визначення поточного користувача через JWT;
* вихід із системи.

Схема авторизації:

```text
Login / Register
       ↓
Password Hashing
       ↓
User
       ↓
JWT Token
       ↓
localStorage
       ↓
Authorization: Bearer <token>
       ↓
ASP.NET Core API
```

---

## ⚙ Налаштування

Користувач може налаштувати:

* тривалість робочої сесії;
* тривалість короткої перерви;
* тривалість довгої перерви;
* кількість циклів до довгої перерви.

Налаштування зберігаються у SQLite та автоматично завантажуються під час відкриття застосунку.

---

## 📝 Історія сесій

Застосунок зберігає завершені Pomodoro-сесії.

Для кожної сесії відображаються:

* тип сесії;
* дата та час;
* тривалість.

Історія завантажується з backend та оновлюється автоматично після завершення сесії.

---

## 📊 Статистика

Застосунок відображає:

* загальну кількість Pomodoro;
* загальний час продуктивної роботи;
* статистику за поточний тиждень;
* графік кількості завершених Pomodoro по днях.

Статистика розраховується на основі завершених робочих сесій користувача.

---

## 🔄 Оновлення даних у реальному часі

Після завершення Pomodoro:

```text
Pomodoro завершено
        ↓
Збереження в SQLite
        ↓
Оновлення History
        ↓
Оновлення Statistics
        ↓
Оновлення графіка
```

Перезавантаження сторінки для оновлення даних не потрібне.

---

# 🛠 Технології

## Frontend

* HTML5
* CSS3
* JavaScript
* Chart.js

## Backend

* C#
* ASP.NET Core
* REST API
* JWT Authentication

## Database

* SQLite
* Entity Framework Core

## Інструменти

* Visual Studio
* Git
* GitHub
* Trello
* Swagger / OpenAPI

---

# 🏗 Архітектура

Проєкт побудований за принципом розділення frontend, API, роботи з даними та доменної частини.

```text
┌──────────────────────────────┐
│          Frontend            │
│     HTML / CSS / JS          │
└──────────────┬───────────────┘
               │
             HTTP
               │
               ▼
┌──────────────────────────────┐
│       PomodoroClocker.Api    │
│        ASP.NET Core          │
│                              │
│ Controllers / JWT / Services │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ PomodoroClocker.Infrastructure│
│                              │
│ EF Core / Repositories       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│            SQLite            │
└──────────────────────────────┘
```

---

# 📁 Структура проєкту

```text
PomodoroClocker
│
├── PomodoroClocker.Core
│   ├── DTOs
│   ├── Entities
│   ├── Enums
│   └── Interfaces
│
├── PomodoroClocker.Infrastructure
│   ├── Data
│   ├── Migrations
│   └── Repositories
│
├── PomodoroClocker.Api
│   ├── Controllers
│   ├── Services
│   ├── wwwroot
│   │   ├── css
│   │   ├── js
│   │   ├── index.html
│   │   ├── login.html
│   │   └── register.html
│   │
│   ├── Program.cs
│   └── appsettings.json
│
└── PomodoroClocker.Tests
```

---

# 🗄 База даних

Для зберігання даних використовується **SQLite**, доступ до якої здійснюється через **Entity Framework Core**.

## Основні сутності

### User

```text
User
----------------
Id
Username
PasswordHash
```

### UserSettings

```text
UserSettings
----------------
Id
WorkMinutes
ShortBreakMinutes
LongBreakMinutes
CyclesBeforeLongBreak
UserId
```

### PomodoroSession

```text
PomodoroSession
----------------
Id
SessionType
StartTime
EndTime
IsCompleted
UserId
```

### Зв'язки

```text
User
 │
 ├────────────── UserSettings
 │                  1 : 1
 │
 └────────────── PomodoroSessions
                    1 : N
```

---

# 🔐 JWT Authentication

Застосунок використовує JWT для захисту API.

Після успішного входу користувач отримує токен:

```json
{
  "token": "eyJhbGciOi..."
}
```

Frontend зберігає токен та додає його до захищених запитів:

```http
Authorization: Bearer <JWT_TOKEN>
```

Backend отримує ідентифікатор користувача з JWT, тому frontend не передає `userId` вручну.

---

# 🌐 API

## Authentication

### Реєстрація

```http
POST /api/Auth/register
```

Приклад:

```json
{
  "username": "testuser",
  "password": "123456"
}
```

### Вхід

```http
POST /api/Auth/login
```

Приклад:

```json
{
  "username": "testuser",
  "password": "123456"
}
```

---

## Sessions

### Створення сесії

```http
POST /api/Sessions
```

Потребує JWT.

### Отримання власної історії

```http
GET /api/Sessions/my
```

Потребує JWT.

---

## Statistics

### Отримання власної статистики

```http
GET /api/Statistics/my
```

Потребує JWT.

---

## Settings

### Отримання налаштувань

```http
GET /api/settings
```

Потребує JWT.

### Оновлення налаштувань

```http
PUT /api/settings
```

Приклад:

```json
{
  "workMinutes": 25,
  "shortBreakMinutes": 5,
  "longBreakMinutes": 15,
  "cyclesBeforeLongBreak": 4
}
```

Потребує JWT.

---
