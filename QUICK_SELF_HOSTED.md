# 🚀 Быстрый старт: Self-hosted n8n + Supabase

## ⚡ Быстрое развертывание (15 минут)

### 1. Подготовка сервера
```bash
# Требования:
# - Ubuntu 20.04+ / CentOS 8+ / Debian 11+
# - 2GB RAM минимум
# - 10GB свободного места
# - Root доступ или sudo права
```

### 2. Запуск автоматического развертывания
```bash
# Скачать скрипт
wget https://raw.githubusercontent.com/your-repo/ota-analyzer/main/deploy-self-hosted.sh

# Сделать исполняемым
chmod +x deploy-self-hosted.sh

# Запустить
./deploy-self-hosted.sh
```

### 3. Настройка паролей
```bash
# Отредактировать .env файл
nano ~/ota-analyzer/.env

# Изменить все пароли:
POSTGRES_PASSWORD=your_secure_password
N8N_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
```

### 4. Перезапуск с новыми паролями
```bash
cd ~/ota-analyzer
./scripts/restart.sh
```

## 🔗 Доступ к сервисам

После развертывания:

- **n8n**: http://your-server-ip:5678
  - Логин: admin
  - Пароль: из .env файла

- **Supabase**: http://your-server-ip:54321
  - База данных PostgreSQL

- **PostgreSQL**: localhost:5432
  - Прямой доступ к базе

## 🔧 Управление сервисами

```bash
cd ~/ota-analyzer

# Запуск
./scripts/start.sh

# Остановка
./scripts/stop.sh

# Перезапуск
./scripts/restart.sh

# Обновление
./scripts/update.sh

# Бэкап
./scripts/backup.sh
```

## 🌐 Настройка домена

### 1. Настроить DNS
```
A    your-domain.com    -> your-server-ip
```

### 2. Обновить .env
```bash
WEBHOOK_URL=https://your-domain.com/n8n
```

### 3. Настроить SSL (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🔗 Интеграция с Render

### Обновить Environment Variables в Render:
```
VITE_SUPABASE_URL=https://your-domain.com/api
VITE_SUPABASE_ANON_KEY=your_anon_key_from_env
VITE_N8N_WEBHOOK_URL=https://your-domain.com/n8n/webhook/ota-analysis
```

## 📊 Мониторинг

### Проверка статуса:
```bash
cd ~/ota-analyzer
docker-compose ps
```

### Просмотр логов:
```bash
# n8n логи
docker-compose logs -f n8n

# Supabase логи
docker-compose logs -f supabase

# Все логи
docker-compose logs -f
```

## 🔄 Автоматические обновления

### Настроить cron:
```bash
# Открыть crontab
crontab -e

# Добавить автоматические обновления (каждое воскресенье в 2:00)
0 2 * * 0 cd ~/ota-analyzer && ./scripts/update.sh

# Добавить автоматические бэкапы (каждый день в 1:00)
0 1 * * * cd ~/ota-analyzer && ./scripts/backup.sh
```

## 🚨 Безопасность

### Обязательные меры:
1. ✅ Изменить все пароли в .env
2. ✅ Настроить firewall
3. ✅ Установить SSL сертификаты
4. ✅ Регулярные бэкапы
5. ✅ Обновления системы

### Настройка firewall:
```bash
# Ubuntu/Debian
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 🆘 Устранение неполадок

### Сервисы не запускаются:
```bash
# Проверить статус
docker-compose ps

# Просмотреть логи
docker-compose logs

# Перезапустить
docker-compose down
docker-compose up -d
```

### Проблемы с сетью:
```bash
# Проверить порты
netstat -tlnp | grep :5678
netstat -tlnp | grep :54321

# Проверить Docker сеть
docker network ls
docker network inspect ota_analyzer_ota_network
```

### Проблемы с диском:
```bash
# Проверить место на диске
df -h

# Очистить Docker
docker system prune -f
```

## 📞 Поддержка

### Полезные команды:
```bash
# Полная информация о системе
docker-compose ps
docker system df
df -h
free -h

# Проверка конфигурации
docker-compose config

# Пересоздание контейнеров
docker-compose down
docker-compose up -d --force-recreate
```

### Логи и отладка:
```bash
# Реальные логи в реальном времени
docker-compose logs -f --tail=100

# Проверка переменных окружения
docker exec ota-n8n env | grep N8N
docker exec ota-postgres env | grep POSTGRES
```

## 🎯 Результат

После выполнения всех шагов у вас будет:

- ✅ n8n на вашем сервере
- ✅ Supabase на вашем сервере  
- ✅ Полный контроль над данными
- ✅ Автоматические бэкапы
- ✅ SSL сертификаты
- ✅ Мониторинг и логирование
- ✅ Готовность к продакшену

## 🔗 Ссылки

- [Полная документация](SELF_HOSTED_SETUP.md)
- [n8n Documentation](https://docs.n8n.io)
- [Supabase Documentation](https://supabase.com/docs)
- [Docker Documentation](https://docs.docker.com) 