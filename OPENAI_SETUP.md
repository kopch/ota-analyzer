# 🤖 Настройка OpenAI

## 🎯 Что нужно сделать:

### 1. Получить API ключ
1. Перейдите на [platform.openai.com](https://platform.openai.com)
2. Создайте аккаунт или войдите
3. Перейдите в API Keys
4. Создайте новый API ключ
5. Скопируйте и сохраните ключ (начинается с `sk-`)

### 2. Настроить Environment Variables

#### В Render Dashboard:
```
VITE_OPENAI_API_KEY=sk-your-openai-key
```

#### В Supabase Dashboard:
```
OPENAI_API_KEY=sk-your-openai-key
```

#### В n8n Dashboard:
```
OPENAI_API_KEY=sk-your-openai-key
```

### 3. Проверить лимиты и тарифы
1. Перейдите в Billing → Usage
2. Проверьте текущий план (Free tier или платный)
3. Установите лимиты расходов

## 🔧 Интеграция в код:

### 1. В n8n Workflow:
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

### 2. В Supabase Edge Function:
```typescript
const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are an expert OTA listing analyst. Analyze the provided data and return structured JSON results.'
      },
      {
        role: 'user',
        content: `Analyze this OTA listing data: ${JSON.stringify(data)}`
      }
    ],
    temperature: 0.1,
    max_tokens: 4000
  })
});
```

## 📊 Типы анализа:

### 1. Анализ отзывов:
```json
{
  "role": "system",
  "content": "Analyze reviews and return: averageRating, totalReviews, positiveSentiment, reviewHighlights, guestFavorites"
}
```

### 2. Анализ изображений:
```json
{
  "role": "system", 
  "content": "Analyze images and return: heroShotQuality, imageUniqueness, top5Images, imageQuality, sleepingArrangements"
}
```

### 3. Анализ удобств:
```json
{
  "role": "system",
  "content": "Analyze amenities and return: locationHighlights, amenityList, accessibility, uniqueFeatures"
}
```

## 🧪 Тестирование:

### 1. Тест API ключа:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-your-openai-key"
```

### 2. Тест анализа:
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer sk-your-openai-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {
        "role": "system",
        "content": "You are an expert OTA listing analyst."
      },
      {
        "role": "user", 
        "content": "Analyze this listing: https://airbnb.com/listing/123"
      }
    ],
    "temperature": 0.1,
    "max_tokens": 1000
  }'
```

## 💰 Управление расходами:

### 1. Установить лимиты:
- Перейдите в Billing → Usage limits
- Установите месячный лимит расходов
- Настройте алерты

### 2. Мониторинг использования:
- Регулярно проверяйте Usage dashboard
- Анализируйте стоимость по запросам
- Оптимизируйте промпты для снижения токенов

### 3. Оптимизация:
- Используйте `max_tokens` для ограничения ответов
- Оптимизируйте промпты
- Кэшируйте результаты где возможно

## 🚨 Важные моменты:

1. **Безопасность**: Никогда не коммитьте API ключи
2. **Rate Limits**: Учитывайте лимиты запросов
3. **Cost Control**: Установите лимиты расходов
4. **Error Handling**: Обрабатывайте ошибки API

## 📞 Поддержка:

Если возникнут проблемы:
1. Проверьте API ключ
2. Убедитесь, что есть кредиты на счете
3. Проверьте rate limits
4. Обратитесь в OpenAI Support

## 🔗 Полезные ссылки:

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [GPT-4o Model](https://platform.openai.com/docs/models/gpt-4o)
- [Rate Limits](https://platform.openai.com/docs/guides/rate-limits)
- [Pricing](https://openai.com/pricing) 