# 🚀 Полное развертывание OTA Analyzer на Render

## 🎯 Обзор системы

Полная система состоит из:
- **Frontend** (Vue.js) - Пользовательский интерфейс
- **Backend** (Node.js) - API сервер
- **n8n** - Автоматизация и анализ
- **PostgreSQL** - База данных
- **Redis** - Кэширование

## 📋 Предварительные требования

### 1. Аккаунты и API ключи:
- [Render.com](https://render.com) - для хостинга
- [OpenAI](https://platform.openai.com) - API ключ
- [GitHub](https://github.com) - репозиторий

### 2. Подготовка репозитория:
```bash
# Клонировать репозиторий
git clone https://github.com/your-username/ota-analyzer
cd ota-analyzer

# Убедиться, что все файлы на месте
ls -la
```

## 🔧 Пошаговое развертывание

### Шаг 1: Подготовка Render Dashboard

1. **Войти в Render Dashboard**
2. **Создать новый Blueprint** (если используете render-complete.yaml)
3. **Или создать сервисы вручную**

### Шаг 2: Создание PostgreSQL Database

1. **New → PostgreSQL**
2. **Настройки:**
   - Name: `ota-analyzer-db`
   - Database: `ota_analyzer`
   - User: `ota_user`
   - Plan: `Free` (для начала)

3. **После создания скопировать:**
   - Internal Database URL
   - External Database URL
   - Database Password

### Шаг 3: Создание Redis

1. **New → Redis**
2. **Настройки:**
   - Name: `ota-analyzer-redis`
   - Plan: `Free`

### Шаг 4: Создание Backend API

1. **New → Web Service**
2. **Подключить GitHub репозиторий**
3. **Настройки:**
   - Name: `ota-analyzer-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm ci`
   - Start Command: `npm start`

4. **Environment Variables:**
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://ota_user:password@host:port/ota_analyzer
JWT_SECRET=your-super-secret-jwt-key-here
OPENAI_API_KEY=sk-your-openai-api-key
FRONTEND_URL=https://ota-analyzer-frontend.onrender.com
```

### Шаг 5: Создание n8n Service

1. **New → Web Service**
2. **Подключить GitHub репозиторий**
3. **Настройки:**
   - Name: `ota-analyzer-n8n`
   - Root Directory: `/` (корень)
   - Environment: `Docker`
   - Dockerfile Path: `Dockerfile.n8n.complete`

4. **Environment Variables:**
```env
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your-secure-password
N8N_ENCRYPTION_KEY=your-32-character-encryption-key
OPENAI_API_KEY=sk-your-openai-api-key
SUPABASE_SERVICE_ROLE_KEY=your-backend-service-role-key
SUPABASE_URL=https://ota-analyzer-backend.onrender.com
WEBHOOK_URL=https://ota-analyzer-n8n.onrender.com
```

### Шаг 6: Создание Frontend

1. **New → Static Site**
2. **Подключить GitHub репозиторий**
3. **Настройки:**
   - Name: `ota-analyzer-frontend`
   - Root Directory: `/` (корень)
   - Build Command: `npm ci && npm run build`
   - Publish Directory: `dist`

4. **Environment Variables:**
```env
VITE_BACKEND_URL=https://ota-analyzer-backend.onrender.com
VITE_N8N_WEBHOOK_URL=https://ota-analyzer-n8n.onrender.com/webhook/ota-analysis
VITE_OPENAI_API_KEY=sk-your-openai-api-key
VITE_APP_NAME=OTA Analyzer
VITE_APP_URL=https://ota-analyzer-frontend.onrender.com
```

## 🗄️ Инициализация базы данных

### Автоматическая инициализация:

Backend автоматически создаст таблицы при первом запуске, но можно инициализировать вручную:

```bash
# Подключиться к базе данных
psql postgresql://ota_user:password@host:port/ota_analyzer

# Выполнить SQL скрипт
\i backend/init-db.sql
```

## 🔗 Настройка интеграции

### 1. Обновить n8n workflow:

1. **Открыть n8n Dashboard:** `https://ota-analyzer-n8n.onrender.com`
2. **Логин:** admin / ваш-пароль
3. **Импортировать workflow:** `n8n-workflows/ota-analysis.json`
4. **Активировать workflow**

### 2. Проверить webhook URL:

В n8n workflow убедиться, что webhook URL правильный:
```
https://ota-analyzer-n8n.onrender.com/webhook/ota-analysis
```

## 🧪 Тестирование системы

### 1. Проверка сервисов:

```bash
# Frontend
curl https://ota-analyzer-frontend.onrender.com

# Backend health check
curl https://ota-analyzer-backend.onrender.com/health

# n8n
curl https://ota-analyzer-n8n.onrender.com
```

### 2. Тест полного цикла:

1. **Открыть frontend**
2. **Зарегистрироваться**
3. **Создать проект**
4. **Запустить анализ**
5. **Проверить результаты**

## 🔧 Автоматическое развертывание

### Использование Blueprint:

1. **Создать файл `render-complete.yaml`** (уже создан)
2. **В Render Dashboard:**
   - New → Blueprint
   - Подключить репозиторий
   - Выбрать `render-complete.yaml`
   - Настроить Environment Variables

### GitHub Actions:

```yaml
# .github/workflows/deploy-complete.yml
name: Deploy Complete System

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Render
      uses: johnbeynon/render-deploy-action@v1.0.0
      with:
        service-id: ${{ secrets.RENDER_SERVICE_ID }}
        api-key: ${{ secrets.RENDER_API_KEY }}
```

## 🔐 Безопасность

### Обязательные меры:

1. **Изменить все пароли по умолчанию**
2. **Использовать HTTPS везде**
3. **Настроить CORS правильно**
4. **Ограничить доступ к базе данных**

### Environment Variables безопасности:

```env
# JWT Secret (минимум 32 символа)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long

# n8n Encryption Key (32 символа)
N8N_ENCRYPTION_KEY=your-32-character-encryption-key

# Database Password (сложный)
DATABASE_URL=postgresql://user:complex-password@host:port/db
```

## 📊 Мониторинг

### Логи в Render:

1. **Frontend:** Статические файлы, логи в браузере
2. **Backend:** Логи в Render Dashboard
3. **n8n:** Логи в n8n Dashboard
4. **Database:** Логи в Render Dashboard

### Health Checks:

```bash
# Проверка всех сервисов
curl https://ota-analyzer-backend.onrender.com/health
curl https://ota-analyzer-n8n.onrender.com/healthz
```

## 🔄 Обновления

### Автоматические обновления:

1. **GitHub Actions** автоматически деплоит при push
2. **Render** автоматически пересобирает при изменениях
3. **n8n** обновляется через Docker image

### Ручные обновления:

```bash
# В Render Dashboard
# Backend → Manual Deploy
# n8n → Manual Deploy
# Frontend → Manual Deploy
```

## 🆘 Устранение неполадок

### Частые проблемы:

1. **Backend не подключается к базе:**
   - Проверить DATABASE_URL
   - Проверить SSL настройки

2. **n8n не получает webhook:**
   - Проверить webhook URL
   - Проверить CORS настройки

3. **Frontend не подключается к backend:**
   - Проверить VITE_BACKEND_URL
   - Проверить CORS настройки

### Полезные команды:

```bash
# Проверка статуса сервисов
curl -I https://ota-analyzer-backend.onrender.com/health
curl -I https://ota-analyzer-n8n.onrender.com

# Проверка базы данных
psql $DATABASE_URL -c "SELECT version();"

# Логи n8n
# В n8n Dashboard → Executions → View Logs
```

## 🎉 Результат

После успешного развертывания у вас будет:

- ✅ **Frontend:** https://ota-analyzer-frontend.onrender.com
- ✅ **Backend API:** https://ota-analyzer-backend.onrender.com
- ✅ **n8n Dashboard:** https://ota-analyzer-n8n.onrender.com
- ✅ **PostgreSQL:** Автоматически настроена
- ✅ **Redis:** Автоматически настроен
- ✅ **Полная интеграция** всех компонентов
- ✅ **Автоматические обновления** через GitHub
- ✅ **Мониторинг** и логирование

## 📞 Поддержка

### Если что-то не работает:

1. **Проверить логи** в Render Dashboard
2. **Проверить Environment Variables**
3. **Проверить статус сервисов**
4. **Проверить интеграцию между сервисами**

### Полезные ссылки:

- [Render Documentation](https://render.com/docs)
- [n8n Documentation](https://docs.n8n.io)
- [Vue.js Documentation](https://vuejs.org/guide/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) 