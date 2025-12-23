@echo off
REM Скрипт для запуска приложения на Windows

echo 🚀 Запуск блог-платформы...

cd src

REM Проверка наличия зависимостей
if not exist "node_modules" (
    echo 📦 Установка зависимостей...
    call npm install
)

echo 🌐 Стартуем сервер на http://localhost:3000
echo.
echo Доступные команды:
echo   npm test        - запуск тестов
echo   npm run lint    - проверка кода
echo   npm run build   - сборка проекта
echo   npm run test:e2e - E2E тесты
echo.

call npm start
