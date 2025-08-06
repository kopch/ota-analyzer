# 🖥️ Самостоятельное развертывание n8n и Supabase

## 🎯 Варианты развертывания:

### 1. **Полное self-hosted** (n8n + Supabase)
- n8n на вашем сервере
- Supabase на вашем сервере
- Полный контроль над данными

### 2. **Гибридное** (n8n self-hosted + Supabase Cloud)
- n8n на вашем сервере
- Supabase в облаке
- Баланс контроля и простоты

### 3. **Полное облачное** (n8n Cloud + Supabase Cloud)
- Все в облаке
- Максимальная простота

## 🖥️ Self-hosted n8n

### Вариант 1: Docker (Рекомендуется)

#### 1. Установить Docker:
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# CentOS/RHEL
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
```

#### 2. Создать docker-compose.yml:
```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - N8N_USER_MANAGEMENT_DISABLED=false
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_secure_password
      - N8N_ENCRYPTION_KEY=your_32_character_encryption_key
      - WEBHOOK_URL=https://your-domain.com
      - GENERIC_TIMEZONE=UTC
      - OPENAI_API_KEY=sk-your-openai-key
      - SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
      - SUPABASE_URL=https://your-supabase-instance.com
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - n8n_network

volumes:
  n8n_data:

networks:
  n8n_network:
    driver: bridge
```

#### 3. Запустить n8n:
```bash
docker-compose up -d
```

### Вариант 2: Прямая установка

#### 1. Установить Node.js:
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

#### 2. Установить n8n:
```bash
npm install n8n -g
```

#### 3. Создать systemd service:
```bash
sudo nano /etc/systemd/system/n8n.service
```

```ini
[Unit]
Description=n8n
After=network.target

[Service]
Type=simple
User=n8n
ExecStart=/usr/bin/n8n start
Restart=always
RestartSec=10
Environment=N8N_HOST=0.0.0.0
Environment=N8N_PORT=5678
Environment=N8N_PROTOCOL=https
Environment=N8N_BASIC_AUTH_ACTIVE=true
Environment=N8N_BASIC_AUTH_USER=admin
Environment=N8N_BASIC_AUTH_PASSWORD=your_secure_password
Environment=N8N_ENCRYPTION_KEY=your_32_character_encryption_key
Environment=WEBHOOK_URL=https://your-domain.com
Environment=OPENAI_API_KEY=sk-your-openai-key
Environment=SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
Environment=SUPABASE_URL=https://your-supabase-instance.com

[Install]
WantedBy=multi-user.target
```

#### 4. Запустить сервис:
```bash
sudo systemctl daemon-reload
sudo systemctl enable n8n
sudo systemctl start n8n
```

## 🗄️ Self-hosted Supabase

### Вариант 1: Docker Compose (Рекомендуется)

#### 1. Клонировать Supabase:
```bash
git clone https://github.com/supabase/supabase
cd supabase/docker
```

#### 2. Настроить .env:
```bash
cp .env.example .env
nano .env
```

```env
POSTGRES_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
ANON_KEY=your_anon_key
SERVICE_ROLE_KEY=your_service_role_key
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=your_dashboard_password
```

#### 3. Запустить Supabase:
```bash
docker-compose up -d
```

### Вариант 2: Прямая установка PostgreSQL

#### 1. Установить PostgreSQL:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 2. Настроить PostgreSQL:
```bash
sudo -u postgres psql
```

```sql
-- Создать базу данных
CREATE DATABASE supabase;

-- Создать пользователя
CREATE USER supabase_user WITH PASSWORD 'your_password';

-- Дать права
GRANT ALL PRIVILEGES ON DATABASE supabase TO supabase_user;

-- Включить расширения
\c supabase
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

#### 3. Установить Supabase CLI:
```bash
npm install -g supabase
```

#### 4. Инициализировать проект:
```bash
supabase init
supabase start
```

## 🔧 Настройка Nginx (Reverse Proxy)

### 1. Установить Nginx:
```bash
# Ubuntu/Debian
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### 2. Настроить SSL с Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. Создать конфигурацию Nginx:
```bash
sudo nano /etc/nginx/sites-available/ota-analyzer
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend (Vue.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # n8n
    location /n8n/ {
        proxy_pass http://localhost:5678/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Supabase API
    location /api/ {
        proxy_pass http://localhost:54321/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Supabase Dashboard
    location /dashboard/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Активировать конфигурацию:
```bash
sudo ln -s /etc/nginx/sites-available/ota-analyzer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔐 Безопасность

### 1. Настроить Firewall:
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

### 2. Настроить Fail2ban:
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Регулярные обновления:
```bash
# Создать скрипт обновления
sudo nano /usr/local/bin/update-system.sh
```

```bash
#!/bin/bash
apt update && apt upgrade -y
docker system prune -f
docker-compose pull
docker-compose up -d
```

```bash
sudo chmod +x /usr/local/bin/update-system.sh
sudo crontab -e
# Добавить: 0 2 * * 0 /usr/local/bin/update-system.sh
```

## 📊 Мониторинг

### 1. Установить Prometheus + Grafana:
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  prometheus_data:
  grafana_data:
```

### 2. Настроить логирование:
```bash
# Установить ELK Stack или использовать journald
sudo journalctl -u n8n -f
sudo journalctl -u postgresql -f
```

## 🔄 Backup и восстановление

### 1. Backup базы данных:
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump supabase > backup_$DATE.sql
gzip backup_$DATE.sql
```

### 2. Backup n8n данных:
```bash
#!/bin/bash
# backup-n8n.sh
DATE=$(date +%Y%m%d_%H%M%S)
docker exec n8n tar czf - /home/node/.n8n > n8n_backup_$DATE.tar.gz
```

### 3. Автоматические бэкапы:
```bash
sudo crontab -e
# Добавить:
0 1 * * * /path/to/backup.sh
0 2 * * * /path/to/backup-n8n.sh
```

## 🚀 Развертывание

### Полный docker-compose.yml:
```yaml
version: '3.8'

services:
  # PostgreSQL
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: supabase
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app_network

  # Supabase
  supabase:
    image: supabase/postgres:15.1.0.117
    depends_on:
      - postgres
    environment:
      POSTGRES_PASSWORD: your_password
      JWT_SECRET: your_jwt_secret
    volumes:
      - supabase_data:/var/lib/postgresql/data
    networks:
      - app_network

  # n8n
  n8n:
    image: n8nio/n8n:latest
    depends_on:
      - postgres
    environment:
      N8N_HOST: 0.0.0.0
      N8N_PORT: 5678
      N8N_PROTOCOL: https
      N8N_BASIC_AUTH_ACTIVE: true
      N8N_BASIC_AUTH_USER: admin
      N8N_BASIC_AUTH_PASSWORD: your_password
      N8N_ENCRYPTION_KEY: your_32_char_key
      WEBHOOK_URL: https://your-domain.com/n8n
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: n8n
      DB_POSTGRESDB_USER: n8n
      DB_POSTGRESDB_PASSWORD: your_password
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - app_network

  # Redis (для кэширования)
  redis:
    image: redis:alpine
    networks:
      - app_network

volumes:
  postgres_data:
  supabase_data:
  n8n_data:

networks:
  app_network:
    driver: bridge
```

## 📞 Поддержка

### Полезные команды:
```bash
# Проверка статуса сервисов
docker-compose ps
sudo systemctl status n8n postgresql nginx

# Просмотр логов
docker-compose logs -f n8n
sudo journalctl -u n8n -f

# Обновление
docker-compose pull
docker-compose up -d

# Backup
docker exec postgres pg_dump supabase > backup.sql
```

### Мониторинг ресурсов:
```bash
# Установить htop
sudo apt install htop
htop

# Мониторинг диска
df -h
du -sh /var/lib/docker/volumes/*

# Мониторинг сети
iftop
```

## 🎯 Преимущества self-hosted:

1. **Полный контроль** над данными
2. **Нет ограничений** по использованию
3. **Стоимость** может быть ниже
4. **Кастомизация** под ваши нужды
5. **Приватность** данных

## ⚠️ Недостатки:

1. **Сложность** настройки
2. **Ответственность** за безопасность
3. **Обслуживание** сервера
4. **Резервное копирование**
5. **Мониторинг** и алерты 