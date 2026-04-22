<p align="center">
  <h2 align="center"> BALKON - Frontend</h2>
  <p align="center">
    React + Vite + TanStack + Tailwind
  </p>
</p>

## Описание

Frontend для платформы интерактивных квизов. Включает:
- Аутентификацию и управление профилем
- Создание и редактирование квизов (для авторов)
- Live игровые сессии с лидербордом в реальном времени
- Присоединение к квизам по коду (для участников)
- Мобильный-friendly интерфейс

## Стек

| Компонент | Версия |
|-----------|--------|
| **Frontend Framework** | React 18 |
| **Build Tool** | Vite |
| **Routing** | TanStack Router |
| **HTTP Client** | Axios + TanStack Query |
| **Forms** | React Hook Form |
| **Styling** | Tailwind CSS |
| **Node** | 18+ |

## Быстрый старт

### Требования
- Node.js 18+
- npm или yarn

### Установка

```bash
cd frontend

# Установить зависимости
npm install

# Развернуть dev сервер
npm run dev

# Build для production
npm run build

# Preview production build
npm run preview
```

The app будет доступна на `http://localhost:5173`

## Структура проекта

```
frontend/
├── src/
│   ├── components/      
│   │   ├── Header.jsx
│   │   ├── Quiz/
│   │   └── Session/
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── CreateQuiz.jsx
│   │   ├── PlayQuiz.jsx
│   │   └── Results.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useSession.js
│   ├── api/
│   │   ├── client.js
│   │   ├── auth.js
│   │   └── session.js
│   ├── routes/
│   │   └── index.jsx
│   ├── styles/
│   └── main.jsx
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Pages

### Auth Flow
- **Login / Register** - Вход и регистрация пользователя (создателя)
- **Profile** - Редактирование профиля

### Creator Dashboard
- **My Quizzes** - Список созданных квизов
- **Create Quiz** - Создание нового квиза с вопросами
- **Edit Quiz** - Редактирование квиза
- **Quiz Settings** - Опубликовать/снять с публикации

### Player Flow
- **Join Game** - Ввод кода квиза + имя участника
- **Play Quiz** 
  - Показ вопроса с вариантами ответов
  - После ответа: правильно /  неправильно
  - Live таблица лидеров после каждого ответа
- **Results** - Финальный рейтинг и статистика



## Responsive Design

- Дизайн под мобильные устройства
- Tailwind breakpoints: sm, md, lg, xl
- Touch-friendly UI элементы
- Адаптивные формы и таблицы

##  UI Components

- **Button** - Primary, secondary, danger варианты
- **Input** - Text, password, number
- **Card** - Контейнер для контента
- **Modal** - Для диалогов и форм
- **Leaderboard** - Таблица рейтинга
- **ProgressBar** - Индикатор прогресса
- **Badge** - Метки и статусы


## Документация

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [TanStack Router](https://tanstack.com/router)
- [Tailwind CSS](https://tailwindcss.com)
- [React Hook Form](https://react-hook-form.com)

---

**Live App**: http://localhost:5173 | **Backend API**: http://localhost:8000/docs
