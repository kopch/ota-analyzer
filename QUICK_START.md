# ⚡ Быстрый старт - Render.com

## 🚀 Развертывание за 5 минут

### 1. Подготовка репозитория

```bash
# Клонируйте проект
git clone <your-repo-url>
cd ota-analyzer-saas

# Запустите скрипт настройки
chmod +x setup-render.sh
./setup-render.sh

# Добавьте все файлы в Git
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### 2. Настройка Render.com

1. **Создайте аккаунт:** [render.com](https://render.com)
2. **Создайте Static Site:**
   - New + → Static Site
   - Подключите GitHub репозиторий
   - Branch: `main`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

3. **Добавьте Environment Variables:**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/ota-analysis
   VITE_OPENAI_API_KEY=sk-your-openai-key
   VITE_APP_NAME=OTA Analyzer
   VITE_APP_URL=https://your-app-name.onrender.com
   ```

### 3. Настройка GitHub Secrets

Перейдите в ваш репозиторий → Settings → Secrets and variables → Actions

Добавьте:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/ota-analysis
VITE_OPENAI_API_KEY=sk-your-openai-key
RENDER_SERVICE_ID=your_render_service_id
RENDER_API_KEY=your_render_api_key
```

### 4. Первый деплой

```bash
# Внесите изменения
git add .
git commit -m "Initial deployment"
git push origin main
```

GitHub Actions автоматически соберет и задеплоит приложение!

## 🔧 Полная настройка

Для полной настройки всех сервисов (Supabase, n8n) смотрите:
- [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) - Подробное руководство
- [README.md](README.md) - Общая документация

## 🎯 Результат

После настройки:
- ✅ Приложение доступно по адресу: `https://your-app-name.onrender.com`
- ✅ Автоматический деплой при каждом push в main
- ✅ Интеграция с Supabase и n8n
- ✅ Полнофункциональное SaaS приложение

## 🆘 Проблемы?

1. **Build fails:** Проверьте логи в GitHub Actions
2. **Environment variables:** Убедитесь, что переменные начинаются с `VITE_`
3. **Authentication errors:** Проверьте URL в Supabase settings

Подробное устранение неполадок в [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) 