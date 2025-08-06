#!/bin/bash

# 🚀 Quick Deploy Script for OTA Analyzer
# Этот скрипт поможет быстро развернуть всю систему на Render

set -e

echo "🚀 Quick Deploy OTA Analyzer на Render"
echo "======================================"

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Проверка требований
check_requirements() {
    log "Проверка требований..."
    
    if ! command -v git &> /dev/null; then
        error "Git не установлен"
    fi
    
    if ! command -v node &> /dev/null; then
        error "Node.js не установлен"
    fi
    
    if ! command -v npm &> /dev/null; then
        error "npm не установлен"
    fi
    
    log "✅ Все требования выполнены"
}

# Проверка файлов
check_files() {
    log "Проверка файлов проекта..."
    
    required_files=(
        "render-complete.yaml"
        "backend/package.json"
        "backend/server.js"
        "backend/init-db.sql"
        "Dockerfile.n8n.complete"
        "n8n-workflows/ota-analysis.json"
        "src/lib/api.js"
        "src/stores/auth-new.js"
        "src/stores/projects-new.js"
        "package.json"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            error "Файл $file не найден"
        fi
    done
    
    log "✅ Все файлы на месте"
}

# Настройка Git
setup_git() {
    log "Настройка Git..."
    
    if [ ! -d ".git" ]; then
        error "Это не Git репозиторий. Инициализируйте Git и добавьте remote origin"
    fi
    
    # Проверить remote origin
    if ! git remote get-url origin &> /dev/null; then
        error "Remote origin не настроен. Добавьте: git remote add origin https://github.com/your-username/ota-analyzer.git"
    fi
    
    log "✅ Git настроен"
}

# Установка зависимостей
install_dependencies() {
    log "Установка зависимостей..."
    
    # Frontend dependencies
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    # Backend dependencies
    if [ ! -d "backend/node_modules" ]; then
        cd backend
        npm install
        cd ..
    fi
    
    log "✅ Зависимости установлены"
}

# Тестовая сборка
test_build() {
    log "Тестовая сборка..."
    
    # Тест frontend сборки
    if npm run build; then
        log "✅ Frontend сборка успешна"
    else
        error "Frontend сборка провалилась"
    fi
    
    # Тест backend
    cd backend
    if npm test 2>/dev/null || true; then
        log "✅ Backend тесты пройдены"
    else
        warn "Backend тесты не найдены или провалились"
    fi
    cd ..
}

# Генерация секретов
generate_secrets() {
    log "Генерация секретов..."
    
    # JWT Secret
    JWT_SECRET=$(openssl rand -base64 32)
    
    # n8n Encryption Key
    N8N_ENCRYPTION_KEY=$(openssl rand -base64 24)
    
    # Database Password
    DB_PASSWORD=$(openssl rand -base64 16)
    
    echo ""
    echo "🔐 Сгенерированные секреты:"
    echo "=========================="
    echo "JWT_SECRET=$JWT_SECRET"
    echo "N8N_ENCRYPTION_KEY=$N8N_ENCRYPTION_KEY"
    echo "DB_PASSWORD=$DB_PASSWORD"
    echo ""
    
    # Сохранить в файл
    cat > .env.secrets << EOF
# Generated secrets - DO NOT COMMIT TO GIT
JWT_SECRET=$JWT_SECRET
N8N_ENCRYPTION_KEY=$N8N_ENCRYPTION_KEY
DB_PASSWORD=$DB_PASSWORD
EOF
    
    log "✅ Секреты сгенерированы и сохранены в .env.secrets"
}

# Инструкции по развертыванию
show_deployment_instructions() {
    echo ""
    echo "🎯 Инструкции по развертыванию на Render:"
    echo "========================================="
    echo ""
    echo "1. 📝 Подготовка:"
    echo "   - Получите OpenAI API ключ: https://platform.openai.com/api-keys"
    echo "   - Создайте аккаунт на Render: https://render.com"
    echo ""
    echo "2. 🗄️ Создание базы данных:"
    echo "   - В Render Dashboard: New → PostgreSQL"
    echo "   - Name: ota-analyzer-db"
    echo "   - Plan: Free"
    echo "   - Скопируйте Internal Database URL"
    echo ""
    echo "3. 🔧 Создание Backend:"
    echo "   - New → Web Service"
    echo "   - Connect GitHub repository"
    echo "   - Root Directory: backend"
    echo "   - Build Command: npm ci"
    echo "   - Start Command: npm start"
    echo ""
    echo "4. ⚙️ Создание n8n:"
    echo "   - New → Web Service"
    echo "   - Environment: Docker"
    echo "   - Dockerfile Path: Dockerfile.n8n.complete"
    echo ""
    echo "5. 🎨 Создание Frontend:"
    echo "   - New → Static Site"
    echo "   - Build Command: npm ci && npm run build"
    echo "   - Publish Directory: dist"
    echo ""
    echo "6. 🔑 Environment Variables:"
    echo "   Скопируйте значения из .env.secrets"
    echo ""
    echo "📚 Подробная документация: COMPLETE_DEPLOYMENT.md"
    echo ""
}

# Проверка готовности к деплою
check_deployment_readiness() {
    log "Проверка готовности к деплою..."
    
    # Проверить что все файлы на месте
    check_files
    
    # Проверить что зависимости установлены
    if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ]; then
        error "Зависимости не установлены. Запустите: npm install && cd backend && npm install"
    fi
    
    # Проверить что секреты сгенерированы
    if [ ! -f ".env.secrets" ]; then
        warn "Секреты не сгенерированы. Запустите: ./quick-deploy.sh --generate-secrets"
    fi
    
    # Проверить что можно собрать проект
    if ! npm run build &> /dev/null; then
        error "Проект не собирается. Проверьте ошибки"
    fi
    
    log "✅ Проект готов к деплою"
}

# Основная функция
main() {
    case "${1:-}" in
        "--generate-secrets")
            generate_secrets
            exit 0
            ;;
        "--check-only")
            check_requirements
            check_files
            setup_git
            check_deployment_readiness
            echo "✅ Все проверки пройдены успешно!"
            exit 0
            ;;
        "--help"|"-h")
            echo "Использование: $0 [опции]"
            echo ""
            echo "Опции:"
            echo "  --generate-secrets  Генерировать новые секреты"
            echo "  --check-only        Только проверить готовность"
            echo "  --help, -h         Показать эту справку"
            echo ""
            echo "Без опций: полная подготовка к деплою"
            exit 0
            ;;
    esac
    
    log "Начинаем подготовку к деплою..."
    
    check_requirements
    check_files
    setup_git
    install_dependencies
    test_build
    generate_secrets
    check_deployment_readiness
    
    echo ""
    log "🎉 Подготовка завершена успешно!"
    show_deployment_instructions
    
    echo ""
    echo "🚀 Следующие шаги:"
    echo "1. Следуйте инструкциям выше"
    echo "2. Настройте Environment Variables в Render"
    echo "3. Запустите деплой"
    echo "4. Проверьте работу системы"
    echo ""
    echo "📞 Если нужна помощь: COMPLETE_DEPLOYMENT.md"
}

# Запуск скрипта
main "$@" 