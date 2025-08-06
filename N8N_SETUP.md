# ⚙️ Настройка n8n

## 🎯 Варианты развертывания:

### Вариант 1: n8n Cloud (Рекомендуется)
1. Перейдите на [n8n.cloud](https://n8n.cloud)
2. Создайте аккаунт
3. Создайте новый workspace
4. Получите webhook URL

### Вариант 2: Self-hosted на Render
1. Используйте `n8n-render.yaml` и `Dockerfile.n8n`
2. Разверните как web service на Render

## 🔧 Настройка Workflow:

### 1. Создать новый workflow
1. В n8n Dashboard нажмите "New Workflow"
2. Назовите его "OTA Analysis"

### 2. Добавить Webhook Trigger
1. Добавьте "Webhook" node
2. Настройте:
   - **HTTP Method**: POST
   - **Path**: ota-analysis
   - **Response Mode**: Respond to Webhook
3. Скопируйте webhook URL

### 3. Добавить HTTP Request для скриншотов
1. Добавьте "HTTP Request" node
2. Подключите к Webhook
3. Настройте для Playwright/Puppeteer:
   ```json
   {
     "method": "POST",
     "url": "https://api.browserless.io/screenshot",
     "headers": {
       "Cache-Control": "no-cache",
       "Content-Type": "application/json"
     },
     "body": {
       "url": "{{ $json.otaUrls[0] }}",
       "options": {
         "fullPage": true,
         "waitFor": 5000
       }
     }
   }
   ```

### 4. Добавить OpenAI Analysis
1. Добавьте "HTTP Request" node
2. Настройте для OpenAI API:
   ```json
   {
     "method": "POST",
     "url": "https://api.openai.com/v1/chat/completions",
     "headers": {
       "Authorization": "Bearer {{ $env.OPENAI_API_KEY }}",
       "Content-Type": "application/json"
     },
     "body": {
       "model": "gpt-4o",
       "messages": [
         {
           "role": "system",
           "content": "You are an expert OTA listing analyst. Analyze the provided data and return structured JSON results."
         },
         {
           "role": "user",
           "content": "Analyze this OTA listing data: {{ JSON.stringify($json) }}"
         }
       ],
       "temperature": 0.1,
       "max_tokens": 4000
     }
   }
   ```

### 5. Добавить Supabase Update
1. Добавьте "HTTP Request" node
2. Настройте для обновления статуса:
   ```json
   {
     "method": "POST",
     "url": "{{ $json.webhookUrl }}",
     "headers": {
       "Authorization": "Bearer {{ $env.SUPABASE_SERVICE_ROLE_KEY }}",
       "Content-Type": "application/json"
     },
     "body": {
       "projectId": "{{ $json.projectId }}",
       "status": "completed",
       "results": {
         "analysis": "{{ $json.choices[0].message.content }}",
         "screenshots": "{{ $json.screenshotUrls }}",
         "timestamp": "{{ new Date().toISOString() }}"
       }
     }
   }
   ```

### 6. Добавить Error Handling
1. Добавьте "IF" node для проверки ошибок
2. Если есть ошибка, отправьте статус "failed" в Supabase

## 🔑 Environment Variables в n8n:

### Добавьте в n8n Settings:
```
OPENAI_API_KEY=sk-your-openai-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_URL=https://your-project.supabase.co
BROWSERLESS_API_KEY=your-browserless-key (опционально)
```

## 📊 Расширенный Workflow:

### Для множественных URL:
1. Добавьте "Split In Batches" node
2. Обрабатывайте каждый URL отдельно
3. Объедините результаты в конце

### Для разных типов анализа:
1. Добавьте "Switch" node
2. Разные ветки для разных analysis_options
3. Объедините результаты

## 🧪 Тестирование:

### 1. Тест webhook:
```bash
curl -X POST https://your-n8n-instance.com/webhook/ota-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "test-123",
    "otaUrls": ["https://airbnb.com/listing/123"],
    "analysisOptions": ["reviews", "images"],
    "webhookUrl": "https://your-supabase-project.supabase.co/functions/v1/update-project-status"
  }'
```

### 2. Проверка результатов:
- Проверьте логи в n8n
- Проверьте обновления в Supabase
- Проверьте скриншоты в storage

## 🚨 Важные моменты:

1. **Rate Limits**: Учитывайте лимиты OpenAI API
2. **Error Handling**: Всегда обрабатывайте ошибки
3. **Monitoring**: Настройте алерты
4. **Backup**: Регулярно экспортируйте workflows

## 📞 Поддержка:

Если возникнут проблемы:
1. Проверьте логи в n8n
2. Убедитесь, что все API ключи настроены
3. Проверьте webhook URL
4. Обратитесь к документации n8n 