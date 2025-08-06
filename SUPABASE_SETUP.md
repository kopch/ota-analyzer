# 🗄️ Настройка Supabase

## 📋 Что нужно сделать:

### 1. Создать проект Supabase
1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Запишите URL и API ключи

### 2. Настроить базу данных

#### Создать таблицу projects:
```sql
-- Создание таблицы проектов
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  ota_urls TEXT[],
  analysis_options TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  results JSONB,
  share_slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_share_slug ON projects(share_slug);

-- RLS (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Политики доступа
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Политика для публичного доступа к shared проектам
CREATE POLICY "Public can view shared projects" ON projects
  FOR SELECT USING (share_slug IS NOT NULL);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 3. Настроить аутентификацию

#### Включить провайдеры:
1. **Email/Password** - уже включен по умолчанию
2. **Google OAuth**:
   - Перейдите в Authentication → Providers
   - Включите Google
   - Добавьте Client ID и Client Secret от Google Cloud Console
3. **Apple OAuth** (опционально):
   - Включите Apple
   - Настройте Apple Developer Account

#### Настроить email templates:
1. Перейдите в Authentication → Email Templates
2. Настройте шаблоны для:
   - Email confirmation
   - Password reset
   - Magic link

### 4. Настроить Storage

#### Создать bucket для скриншотов:
```sql
-- Создание bucket для скриншотов
INSERT INTO storage.buckets (id, name, public) 
VALUES ('screenshots', 'screenshots', true);

-- Политики для storage
CREATE POLICY "Public can view screenshots" ON storage.objects
  FOR SELECT USING (bucket_id = 'screenshots');

CREATE POLICY "Authenticated users can upload screenshots" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'screenshots' 
    AND auth.role() = 'authenticated'
  );
```

### 5. Развернуть Edge Functions

#### Deploy trigger-analysis function:
```bash
# В корне проекта
supabase functions deploy trigger-analysis
```

#### Deploy update-project-status function:
```bash
supabase functions deploy update-project-status
```

### 6. Настроить Environment Variables

#### В Render Dashboard добавьте:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### В Supabase Dashboard добавьте:
```
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/ota-analysis
OPENAI_API_KEY=sk-your-openai-key
```

## 🔧 Проверка настройки:

### 1. Тест аутентификации:
- Попробуйте зарегистрироваться
- Проверьте email confirmation
- Попробуйте войти

### 2. Тест базы данных:
- Создайте тестовый проект
- Проверьте, что он сохраняется в базе

### 3. Тест RLS:
- Войдите под разными пользователями
- Убедитесь, что каждый видит только свои проекты

## 🚨 Важные моменты:

1. **Безопасность**: Никогда не коммитьте API ключи в Git
2. **RLS**: Всегда включайте Row Level Security
3. **Backup**: Настройте автоматические бэкапы
4. **Monitoring**: Включите логирование

## 📞 Поддержка:

Если возникнут проблемы:
1. Проверьте логи в Supabase Dashboard
2. Убедитесь, что все Environment Variables настроены
3. Проверьте RLS политики
4. Обратитесь к документации Supabase 