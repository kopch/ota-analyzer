#!/bin/bash

# 🚀 OTA Analyzer - Render.com Setup Script
# Этот скрипт поможет быстро настроить деплоймент на Render.com

echo "🚀 Настройка OTA Analyzer для Render.com"
echo "========================================"

# Проверка наличия необходимых инструментов
check_requirements() {
    echo "📋 Проверка требований..."
    
    if ! command -v git &> /dev/null; then
        echo "❌ Git не установлен. Установите Git и попробуйте снова."
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js не установлен. Установите Node.js и попробуйте снова."
        exit 1
    fi
    
    echo "✅ Все требования выполнены"
}

# Настройка Git репозитория
setup_git() {
    echo "🔧 Настройка Git репозитория..."
    
    if [ ! -d ".git" ]; then
        echo "❌ Это не Git репозиторий. Инициализируйте Git и попробуйте снова."
        exit 1
    fi
    
    # Проверка наличия удаленного репозитория
    if ! git remote get-url origin &> /dev/null; then
        echo "❌ Удаленный репозиторий не настроен. Добавьте origin и попробуйте снова."
        exit 1
    fi
    
    echo "✅ Git репозиторий настроен"
}

# Проверка и установка зависимостей
setup_dependencies() {
    echo "📦 Проверка зависимостей..."
    
    if [ ! -f "package.json" ]; then
        echo "❌ package.json не найден"
        exit 1
    fi
    
    if [ ! -d "node_modules" ]; then
        echo "📦 Установка зависимостей..."
        npm install
    else
        echo "✅ Зависимости уже установлены"
    fi
}

# Проверка конфигурационных файлов
check_config_files() {
    echo "📁 Проверка конфигурационных файлов..."
    
    required_files=(
        "render.yaml"
        ".github/workflows/deploy-render.yml"
        "package.json"
        "vite.config.js"
        "tailwind.config.js"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            echo "❌ Файл $file не найден"
            exit 1
        fi
    done
    
    echo "✅ Все конфигурационные файлы найдены"
}

# Тестовая сборка
test_build() {
    echo "🔨 Тестовая сборка..."
    
    # Проверка переменных окружения
    if [ -z "$VITE_SUPABASE_URL" ]; then
        echo "⚠️  VITE_SUPABASE_URL не установлен"
    fi
    
    if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
        echo "⚠️  VITE_SUPABASE_ANON_KEY не установлен"
    fi
    
    # Попытка сборки
    echo "🔨 Запуск сборки..."
    if npm run build; then
        echo "✅ Сборка успешна"
    else
        echo "❌ Ошибка сборки"
        exit 1
    fi
}

# Инструкции по настройке
show_instructions() {
    echo ""
    echo "🎯 Следующие шаги для настройки Render.com:"
    echo "============================================"
    echo ""
    echo "1. 📝 Создайте аккаунт на Render.com:"
    echo "   https://render.com"
    echo ""
    echo "2. 🔗 Подключите GitHub репозиторий:"
    echo "   - Нажмите 'New +' → 'Static Site'"
    echo "   - Выберите ваш репозиторий"
    echo "   - Branch: main"
    echo "   - Build Command: npm install && npm run build"
    echo "   - Publish Directory: dist"
    echo ""
    echo "3. 🔐 Настройте Environment Variables в Render:"
    echo "   VITE_SUPABASE_URL=https://your-project.supabase.co"
    echo "   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo "   VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/ota-analysis"
    echo "   VITE_OPENAI_API_KEY=sk-your-openai-key"
    echo "   VITE_APP_NAME=OTA Analyzer"
    echo "   VITE_APP_URL=https://your-app-name.onrender.com"
    echo ""
    echo "4. 🔑 Настройте GitHub Secrets:"
    echo "   Перейдите в ваш репозиторий → Settings → Secrets and variables → Actions"
    echo "   Добавьте:"
    echo "   - VITE_SUPABASE_URL"
    echo "   - VITE_SUPABASE_ANON_KEY"
    echo "   - VITE_N8N_WEBHOOK_URL"
    echo "   - VITE_OPENAI_API_KEY"
    echo "   - RENDER_SERVICE_ID"
    echo "   - RENDER_API_KEY"
    echo ""
    echo "5. 🚀 Создайте первый деплой:"
    echo "   git add ."
    echo "   git commit -m 'Initial deployment setup'"
    echo "   git push origin main"
    echo ""
    echo "📚 Подробная документация: RENDER_DEPLOYMENT.md"
    echo ""
}

# Основная функция
main() {
    echo "🚀 Начинаем настройку..."
    echo ""
    
    check_requirements
    setup_git
    setup_dependencies
    check_config_files
    test_build
    
    echo ""
    echo "✅ Настройка завершена успешно!"
    show_instructions
}

# Запуск скрипта
main "$@" 