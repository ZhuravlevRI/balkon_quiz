<p align="center">
  <h2 align="center"> BALKON - Backend</h2>
  <p align="center">
    FastAPI + SQLModel + PostgreSQL
  </p>
</p>

## Описание

Backend для платформы интерактивных квизов. Отвечает за:
- Управление пользователями и авторизацию (JWT)
- Создание и редактирование квизов
- Запуск мультиплеерных сессий квизов
- Отслеживание ответов и подсчёт баллов в реальном времени
- WebSocket для live лидербордов

## Стек

| Компонент | Версия |
|-----------|--------|
| **Framework** | FastAPI (≥0.114.2) |
| **ORM** | SQLModel (≥0.0.21) |
| **Database** | PostgreSQL 18 |
| **Auth** | JWT + Argon2 |
| **Async** | asyncio + uvicorn |
| **Validation** | Pydantic v2 |
| **Container** | Docker + Docker Compose |

## Старт

### Требования
- Python 3.12+
- Docker & Docker Compose
- PostgreSQL 18 (в контейнере)

### Установка

```bash
docker compose up --build
```

## Структура проекта

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── quiz.py
│   │   │   └── session.py
│   │   └── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── db.py
│   │   └── security.py
│   ├── models.py
│   └── schemas.py
├── main.py
├── requirements.txt
└── Dockerfile
```

## API Endpoints

### Auth (`/api/v1/auth`)
```
POST   /auth/register    Регистрация
POST   /auth/login       Вход
POST   /auth/refresh     Обновить токен
GET    /auth/me          Профиль
```

### Quiz (`/api/v1/quizzes`)
```
POST   /quizzes          Создать
GET    /quizzes          Список
GET    /quizzes/{id}     Получить
PUT    /quizzes/{id}     Обновить
DELETE /quizzes/{id}     Удалить
POST   /quizzes/{id}/publish    Опубликовать
```

### Sessions (`/api/v1/sessions`)
```
POST   /sessions         Создать сессию
POST   /sessions/join    Присоединиться
POST   /sessions/{id}/answer     Ответить
GET    /sessions/{id}/leaderboard    Лидерборд
POST   /sessions/{id}/finish     Завершить
```

## User Stories

**Создатель:**
- Создаёт квиз → Запускает сессию → Получает код
- Видит участников и баллы в реальном времени

**Участник:**
- Вводит код + имя → Присоединяется
- После каждого ответа: видит результат + текущий рейтинг
- В конце: финальная таблица

## Database

Модели: User, Quiz, QuizSession, SessionParticipant

TTL для сессий: 24 часа (автоудаление)

## Authentication

- **User Token**: для создателей (JWT)
- **Session Token**: для участников (Временный)

## Swagger UI

http://localhost:8000/docs

---

**Документация**: http://localhost:8000/docs | **ReDoc**: http://localhost:8000/redoc
