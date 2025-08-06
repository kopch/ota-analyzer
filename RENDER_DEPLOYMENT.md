# 🚀 Развертывание на Render.com с GitHub

Пошаговое руководство по развертыванию OTA Analyzer SaaS на Render.com с автоматическим обновлением через GitHub.

## 📋 Предварительные требования

1. **GitHub аккаунт** с репозиторием проекта
2. **Render.com аккаунт** (бесплатный)
3. **Supabase проект** (настроенный)
4. **n8n инстанс** (настроенный)
5. **OpenAI API ключ**

## 🔧 Настройка GitHub

### 1. Создание репозитория

```bash
# Клонируйте проект в новый репозиторий
git clone <your-repo-url>
cd ota-analyzer-saas

# Добавьте все файлы
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Настройка GitHub Secrets

Перейдите в ваш GitHub репозиторий → Settings → Secrets and variables → Actions

Добавьте следующие секреты:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/ota-analysis
VITE_OPENAI_API_KEY=sk-your-openai-key
RENDER_SERVICE_ID=your_render_service_id
RENDER_API_KEY=your_render_api_key
```

## 🎯 Настройка Render.com

### 1. Создание аккаунта

1. Перейдите на [render.com](https://render.com)
2. Зарегистрируйтесь через GitHub
3. Подтвердите email

### 2. Создание Static Site

1. **Нажмите "New +"** → **"Static Site"**
2. **Подключите GitHub репозиторий**
3. **Настройте параметры:**

```
Name: ota-analyzer-frontend
Branch: main
Build Command: npm install && npm run build
Publish Directory: dist
```

4. **Добавьте Environment Variables:**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/ota-analysis
VITE_OPENAI_API_KEY=sk-your-openai-key
VITE_APP_NAME=OTA Analyzer
VITE_APP_URL=https://your-app-name.onrender.com
```

5. **Нажмите "Create Static Site"**

### 3. Получение Service ID и API Key

1. **Service ID:** Перейдите в настройки вашего сервиса → скопируйте ID из URL
2. **API Key:** Перейдите в Account Settings → API Keys → Create API Key

## 🔄 Настройка автоматического деплоя

### 1. Обновите render.yaml

Убедитесь, что в `render.yaml` указан правильный URL вашего приложения:

```yaml
VITE_APP_URL: https://your-app-name.onrender.com
```

### 2. Настройте GitHub Actions

Файл `.github/workflows/deploy-render.yml` уже создан и настроен для автоматического деплоя.

### 3. Активируйте GitHub Actions

1. Перейдите в ваш репозиторий → Actions
2. Убедитесь, что Actions включены
3. При первом push в main ветку, деплой запустится автоматически

## 🛠️ Настройка Supabase

### 1. Создание проекта

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Запишите URL и anon key

### 2. Настройка базы данных

Выполните SQL скрипт в Supabase SQL Editor:

```sql
-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  ota_urls TEXT[],
  analysis_options TEXT[],
  results JSONB,
  share_token UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public can view shared projects" ON projects
  FOR SELECT USING (share_token IS NOT NULL);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('screenshots', 'screenshots', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', true);

-- Storage policies
CREATE POLICY "Users can upload screenshots" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view screenshots" ON storage.objects
  FOR SELECT USING (bucket_id = 'screenshots');

CREATE POLICY "Users can upload reports" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view reports" ON storage.objects
  FOR SELECT USING (bucket_id = 'reports');
```

### 3. Настройка аутентификации

1. **Authentication → Settings:**
   - Site URL: `https://your-app-name.onrender.com`
   - Redirect URLs: `https://your-app-name.onrender.com/dashboard`

2. **OAuth Providers:**
   - Настройте Google OAuth
   - Настройте Apple OAuth (если нужно)

3. **Email Templates:**
   - Настройте шаблоны для подтверждения email
   - Настройте шаблоны для сброса пароля

### 4. Деплой Edge Functions

```bash
# Установите Supabase CLI
npm install -g supabase

# Войдите в Supabase
supabase login

# Свяжите проект
supabase link --project-ref your-project-ref

# Деплой функций
supabase functions deploy trigger-analysis
supabase functions deploy update-project-status
```

## 🤖 Настройка n8n

### 1. Создание n8n инстанса

#### Вариант A: n8n Cloud (рекомендуется)
1. Перейдите на [n8n.cloud](https://n8n.cloud)
2. Создайте аккаунт и workspace
3. Импортируйте workflow из `n8n-workflow.json`

#### Вариант B: Self-hosted на Render
1. Создайте новый Web Service на Render
2. Используйте Docker image: `n8nio/n8n`
3. Настройте environment variables

### 2. Настройка Environment Variables в n8n

```
OPENAI_API_KEY=sk-your-openai-key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_URL=https://your-project.supabase.co
```

### 3. Активация Workflow

1. Импортируйте workflow из `n8n-workflow.json`
2. Активируйте workflow
3. Скопируйте webhook URL
4. Обновите `VITE_N8N_WEBHOOK_URL` в Render

## 🔄 Процесс обновления

### Автоматическое обновление

1. **Внесите изменения в код**
2. **Создайте коммит и push:**
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```
3. **GitHub Actions автоматически:**
   - Запустит тесты
   - Соберет приложение
   - Деплоит на Render

### Ручное обновление

1. Перейдите в Render Dashboard
2. Выберите ваш сервис
3. Нажмите "Manual Deploy"

## 📊 Мониторинг

### 1. Render Dashboard

- **Logs:** Просмотр логов деплоя и ошибок
- **Metrics:** Мониторинг производительности
- **Deployments:** История деплоев

### 2. GitHub Actions

- **Actions tab:** Просмотр статуса деплоев
- **Logs:** Детальные логи сборки и деплоя

### 3. Supabase Dashboard

- **Database:** Мониторинг запросов и производительности
- **Auth:** Статистика пользователей
- **Functions:** Логи Edge Functions

## 🛡️ Безопасность

### 1. Environment Variables

- Никогда не коммитьте секреты в код
- Используйте GitHub Secrets
- Регулярно ротируйте API ключи

### 2. CORS настройки

В Supabase Dashboard → Settings → API:

```
Allowed Origins: https://your-app-name.onrender.com
```

### 3. RLS Policies

Убедитесь, что все таблицы защищены RLS политиками.

## 🆘 Устранение неполадок

### Частые проблемы

1. **Build fails:**
   - Проверьте логи в GitHub Actions
   - Убедитесь, что все зависимости установлены

2. **Environment variables not working:**
   - Проверьте правильность переменных в Render
   - Убедитесь, что переменные начинаются с `VITE_`

3. **Authentication errors:**
   - Проверьте URL в Supabase settings
   - Убедитесь, что OAuth настроен правильно

4. **n8n workflow not triggering:**
   - Проверьте webhook URL
   - Убедитесь, что workflow активирован

### Полезные команды

```bash
# Локальная сборка для тестирования
npm run build

# Проверка переменных окружения
echo $VITE_SUPABASE_URL

# Логи Render (через Dashboard)
# Перейдите в ваш сервис → Logs
```

## 📈 Масштабирование

### Render Limits (Free Plan)

- **Build minutes:** 750/month
- **Bandwidth:** 100GB/month
- **Custom domains:** 1

### Обновление плана

При необходимости обновите план Render для:
- Больше build minutes
- Больше bandwidth
- Custom domains
- SSL certificates

## 🎉 Готово!

После выполнения всех шагов:

1. Ваше приложение будет доступно по адресу: `https://your-app-name.onrender.com`
2. Каждый push в main ветку будет автоматически деплоить изменения
3. Все сервисы (Supabase, n8n) будут интегрированы
4. Пользователи смогут регистрироваться и использовать приложение

### Следующие шаги

1. **Тестирование:** Протестируйте полный flow от регистрации до анализа
2. **Мониторинг:** Настройте алерты и мониторинг
3. **Оптимизация:** Оптимизируйте производительность
4. **Маркетинг:** Начните привлекать пользователей 