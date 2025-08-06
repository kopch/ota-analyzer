#!/bin/bash

# 🚀 Self-hosted OTA Analyzer Deployment Script
# Этот скрипт развернет n8n и Supabase на вашем сервере

set -e

echo "🚀 Начинаем развертывание self-hosted OTA Analyzer"
echo "=================================================="

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для логирования
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Проверка root прав
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "Этот скрипт не должен запускаться от root пользователя"
    fi
}

# Проверка системы
check_system() {
    log "Проверка системы..."
    
    # Проверка ОС
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        error "Не удалось определить ОС"
    fi
    
    log "ОС: $OS $VER"
    
    # Проверка архитектуры
    ARCH=$(uname -m)
    if [[ "$ARCH" != "x86_64" ]]; then
        warn "Архитектура $ARCH может не поддерживаться"
    fi
    
    # Проверка памяти
    MEMORY=$(free -m | awk 'NR==2{printf "%.0f", $2/1024}')
    if [[ $MEMORY -lt 2 ]]; then
        error "Требуется минимум 2GB RAM, доступно: ${MEMORY}GB"
    fi
    
    # Проверка диска
    DISK=$(df -BG / | awk 'NR==2{print $4}' | sed 's/G//')
    if [[ $DISK -lt 10 ]]; then
        error "Требуется минимум 10GB свободного места, доступно: ${DISK}GB"
    fi
}

# Установка Docker
install_docker() {
    log "Установка Docker..."
    
    if command -v docker &> /dev/null; then
        log "Docker уже установлен"
        return
    fi
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"RHEL"* ]]; then
        sudo yum install -y docker
        sudo systemctl start docker
        sudo systemctl enable docker
        sudo usermod -aG docker $USER
    else
        error "Неподдерживаемая ОС: $OS"
    fi
    
    log "Docker установлен успешно"
}

# Установка Docker Compose
install_docker_compose() {
    log "Установка Docker Compose..."
    
    if command -v docker-compose &> /dev/null; then
        log "Docker Compose уже установлен"
        return
    fi
    
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    log "Docker Compose установлен успешно"
}

# Создание директорий
create_directories() {
    log "Создание директорий..."
    
    mkdir -p ~/ota-analyzer
    cd ~/ota-analyzer
    
    mkdir -p data/postgres
    mkdir -p data/n8n
    mkdir -p data/supabase
    mkdir -p config/nginx
    mkdir -p scripts
    
    log "Директории созданы"
}

# Создание docker-compose.yml
create_docker_compose() {
    log "Создание docker-compose.yml..."
    
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # PostgreSQL для Supabase
  postgres:
    image: postgres:15
    container_name: ota-postgres
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-ota_secure_password}
      POSTGRES_DB: supabase
      POSTGRES_USER: supabase
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - ota_network

  # Supabase
  supabase:
    image: supabase/postgres:15.1.0.117
    container_name: ota-supabase
    restart: unless-stopped
    depends_on:
      - postgres
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-ota_secure_password}
      JWT_SECRET: ${JWT_SECRET:-your_jwt_secret_key_here}
      ANON_KEY: ${ANON_KEY:-your_anon_key_here}
      SERVICE_ROLE_KEY: ${SERVICE_ROLE_KEY:-your_service_role_key_here}
    volumes:
      - ./data/supabase:/var/lib/postgresql/data
    ports:
      - "54321:5432"
    networks:
      - ota_network

  # n8n
  n8n:
    image: n8nio/n8n:latest
    container_name: ota-n8n
    restart: unless-stopped
    environment:
      N8N_HOST: 0.0.0.0
      N8N_PORT: 5678
      N8N_PROTOCOL: https
      N8N_USER_MANAGEMENT_DISABLED: false
      N8N_BASIC_AUTH_ACTIVE: true
      N8N_BASIC_AUTH_USER: ${N8N_USER:-admin}
      N8N_BASIC_AUTH_PASSWORD: ${N8N_PASSWORD:-ota_secure_password}
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY:-your_32_character_encryption_key}
      WEBHOOK_URL: ${WEBHOOK_URL:-https://your-domain.com/n8n}
      GENERIC_TIMEZONE: UTC
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: n8n
      DB_POSTGRESDB_USER: n8n
      DB_POSTGRESDB_PASSWORD: ${POSTGRES_PASSWORD:-ota_secure_password}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      SUPABASE_SERVICE_ROLE_KEY: ${SERVICE_ROLE_KEY:-your_service_role_key_here}
      SUPABASE_URL: ${SUPABASE_URL:-http://supabase:5432}
    volumes:
      - ./data/n8n:/home/node/.n8n
    ports:
      - "5678:5678"
    depends_on:
      - postgres
    networks:
      - ota_network

  # Redis для кэширования
  redis:
    image: redis:alpine
    container_name: ota-redis
    restart: unless-stopped
    networks:
      - ota_network

  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    container_name: ota-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./config/nginx/ssl:/etc/nginx/ssl
    depends_on:
      - n8n
      - supabase
    networks:
      - ota_network

networks:
  ota_network:
    driver: bridge

volumes:
  postgres_data:
  n8n_data:
  supabase_data:
EOF

    log "docker-compose.yml создан"
}

# Создание .env файла
create_env_file() {
    log "Создание .env файла..."
    
    cat > .env << 'EOF'
# Database
POSTGRES_PASSWORD=ota_secure_password_change_this

# Supabase
JWT_SECRET=your_jwt_secret_key_change_this
ANON_KEY=your_anon_key_change_this
SERVICE_ROLE_KEY=your_service_role_key_change_this

# n8n
N8N_USER=admin
N8N_PASSWORD=ota_secure_password_change_this
N8N_ENCRYPTION_KEY=your_32_character_encryption_key_change_this
WEBHOOK_URL=https://your-domain.com/n8n

# External APIs
OPENAI_API_KEY=sk-your-openai-key-here
SUPABASE_URL=http://supabase:5432
EOF

    log ".env файл создан"
    warn "Не забудьте изменить пароли в .env файле!"
}

# Создание Nginx конфигурации
create_nginx_config() {
    log "Создание Nginx конфигурации..."
    
    cat > config/nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream n8n {
        server n8n:5678;
    }

    upstream supabase {
        server supabase:5432;
    }

    server {
        listen 80;
        server_name _;

        # n8n
        location /n8n/ {
            proxy_pass http://n8n/;
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
            proxy_pass http://supabase/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            return 200 "OK";
            add_header Content-Type text/plain;
        }
    }
}
EOF

    log "Nginx конфигурация создана"
}

# Создание скриптов управления
create_management_scripts() {
    log "Создание скриптов управления..."
    
    # Скрипт запуска
    cat > scripts/start.sh << 'EOF'
#!/bin/bash
cd ~/ota-analyzer
docker-compose up -d
echo "OTA Analyzer запущен!"
echo "n8n: http://localhost:5678"
echo "Supabase: http://localhost:54321"
EOF

    # Скрипт остановки
    cat > scripts/stop.sh << 'EOF'
#!/bin/bash
cd ~/ota-analyzer
docker-compose down
echo "OTA Analyzer остановлен"
EOF

    # Скрипт перезапуска
    cat > scripts/restart.sh << 'EOF'
#!/bin/bash
cd ~/ota-analyzer
docker-compose restart
echo "OTA Analyzer перезапущен"
EOF

    # Скрипт обновления
    cat > scripts/update.sh << 'EOF'
#!/bin/bash
cd ~/ota-analyzer
docker-compose pull
docker-compose up -d
echo "OTA Analyzer обновлен"
EOF

    # Скрипт бэкапа
    cat > scripts/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=~/ota-analyzer/backups
mkdir -p $BACKUP_DIR

cd ~/ota-analyzer

# Backup базы данных
docker exec ota-postgres pg_dump supabase > $BACKUP_DIR/supabase_$DATE.sql
gzip $BACKUP_DIR/supabase_$DATE.sql

# Backup n8n данных
docker exec ota-n8n tar czf - /home/node/.n8n > $BACKUP_DIR/n8n_$DATE.tar.gz

echo "Backup создан: $BACKUP_DIR/"
EOF

    # Делаем скрипты исполняемыми
    chmod +x scripts/*.sh
    
    log "Скрипты управления созданы"
}

# Создание systemd сервиса
create_systemd_service() {
    log "Создание systemd сервиса..."
    
    sudo tee /etc/systemd/system/ota-analyzer.service > /dev/null << EOF
[Unit]
Description=OTA Analyzer Self-Hosted
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/$USER/ota-analyzer
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable ota-analyzer.service
    
    log "Systemd сервис создан и включен"
}

# Запуск сервисов
start_services() {
    log "Запуск сервисов..."
    
    cd ~/ota-analyzer
    
    # Создаем сеть если не существует
    docker network create ota_network 2>/dev/null || true
    
    # Запускаем сервисы
    docker-compose up -d
    
    log "Сервисы запущены"
}

# Проверка статуса
check_status() {
    log "Проверка статуса сервисов..."
    
    cd ~/ota-analyzer
    
    echo ""
    echo "📊 Статус сервисов:"
    docker-compose ps
    
    echo ""
    echo "🔗 Доступные сервисы:"
    echo "  n8n: http://localhost:5678"
    echo "  Supabase: http://localhost:54321"
    echo "  PostgreSQL: localhost:5432"
    
    echo ""
    echo "📝 Следующие шаги:"
    echo "  1. Измените пароли в .env файле"
    echo "  2. Настройте SSL сертификаты"
    echo "  3. Настройте домен в Nginx"
    echo "  4. Обновите Environment Variables в Render"
}

# Основная функция
main() {
    log "Начинаем развертывание..."
    
    check_root
    check_system
    install_docker
    install_docker_compose
    create_directories
    create_docker_compose
    create_env_file
    create_nginx_config
    create_management_scripts
    create_systemd_service
    start_services
    check_status
    
    echo ""
    log "🎉 Развертывание завершено успешно!"
    echo ""
    echo "📚 Документация: SELF_HOSTED_SETUP.md"
    echo "🔧 Скрипты управления: ~/ota-analyzer/scripts/"
    echo "📁 Конфигурация: ~/ota-analyzer/"
    echo ""
    echo "⚠️  ВАЖНО: Измените все пароли в .env файле!"
}

# Запуск скрипта
main "$@" 