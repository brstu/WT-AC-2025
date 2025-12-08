# Deployment Guide - YouTube Playlist Manager

Руководство по развертыванию приложения в различных окружениях.

---

## 📋 Содержание

1. [Локальная разработка](#-локальная-разработка)
2. [Docker Development](#-docker-development)
3. [Production Build](#-production-build)
4. [Docker Production](#-docker-production)
5. [GitHub Pages Deployment](#-github-pages-deployment)
6. [CI/CD Pipeline](#-cicd-pipeline)
7. [Troubleshooting](#-troubleshooting)

---

## 🛠 Локальная разработка

### Требования

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Установка

```bash
# 1. Клонировать репозиторий
git clone https://github.com/alexsandro007/WT-AC-2025.git
cd WT-AC-2025/students/YarmolaAleksandr/task_08

# 2. Установить зависимости
npm install

# 3. Запустить dev server
npm run dev
```

### Development Server

```bash
# Запуск с hot-reload
npm run dev

# Приложение доступно:
# Local:   http://localhost:5173
# Network: http://192.168.x.x:5173
```

### Режимы разработки

```bash
# Основной режим
npm run dev              # Vite dev server на порту 5173

# С тестами в watch mode
npm run test:watch       # Unit/Integration tests auto-rerun

# С Vitest UI
npm run test:ui          # Vitest UI на http://localhost:51204

# С Playwright UI
npm run test:e2e:ui      # Playwright UI для E2E тестов
```

---

## 🐳 Docker Development

### Системные требования

- Docker >= 24.0
- Docker Compose >= 2.20

### Быстрый старт

```bash
# 1. Сборка и запуск
docker-compose up -d

# 2. Проверка статуса
docker-compose ps

# 3. Просмотр логов
docker-compose logs -f

# 4. Остановка
docker-compose down
```

### Docker Compose конфигурация

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Полезные команды

```bash
# Пересборка образа
docker-compose up -d --build

# Просмотр логов определенного сервиса
docker-compose logs -f app

# Вход в контейнер
docker-compose exec app sh

# Очистка
docker-compose down -v        # С удалением volumes
docker system prune -a        # Полная очистка Docker
```

---

## 📦 Production Build

### Сборка

```bash
# 1. Production build
npm run build

# Результат в директории dist/:
# dist/
# ├── index.html
# ├── assets/
# │   ├── index-[hash].js
# │   ├── index-[hash].css
# │   └── ...
```

### Предпросмотр production сборки

```bash
# Запуск preview server
npm run preview

# Открыть http://localhost:4173
```

### Оптимизации production сборки

**Vite конфигурация:**

```javascript
// vite.config.js
export default {
  build: {
    minify: 'terser',          // Минификация
    sourcemap: false,          // Без sourcemaps в production
    rollupOptions: {
      output: {
        manualChunks: {        // Code splitting
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
}
```

### Проверка размера бандла

```bash
npm run build

# Результат:
# dist/index.html                   0.46 kB │ gzip:  0.30 kB
# dist/assets/index-a1b2c3d4.css   12.15 kB │ gzip:  3.28 kB
# dist/assets/index-e5f6g7h8.js    143.52 kB │ gzip: 46.18 kB
```

---

## 🚢 Docker Production

### Multi-stage Dockerfile

Приложение использует multi-stage Dockerfile для оптимизации размера образа:

```dockerfile
# Stage 1: Dependencies (production only)
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Production (nginx)
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Сборка Docker образа

```bash
# Сборка образа
docker build -t youtube-playlist-manager:latest .

# Запуск контейнера
docker run -d -p 3000:80 --name playlist-app youtube-playlist-manager:latest

# Проверка
curl http://localhost:3000
```

### Nginx конфигурация

```nginx
# nginx.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Static assets caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

---

## 🌐 GitHub Pages Deployment

### Автоматический деплой

Приложение автоматически деплоится на GitHub Pages при push в ветку `main` через GitHub Actions.

### Настройка GitHub Pages

1. **Repository Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `gh-pages` / `root`

### Ручной деплой

```bash
# 1. Сборка приложения
npm run build

# 2. Деплой на GitHub Pages
npm install -g gh-pages
gh-pages -d dist

# Или используя git subtree
git subtree push --prefix dist origin gh-pages
```

### Конфигурация base URL

Для GitHub Pages необходимо настроить `base` в `vite.config.js`:

```javascript
export default {
  base: '/all_tasks_v23/task_08/'
}
```

---

## 🤖 CI/CD Pipeline

### GitHub Actions Workflow

Файл: `.github/workflows/ci.yml`

### Pipeline Jobs

#### 1. Lint Job

```yaml
lint:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npm run lint
```

#### 2. Test Job

```yaml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npm test
    - run: npm run test:coverage
```

#### 3. E2E Job

```yaml
e2e:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npx playwright install --with-deps
    - run: npm run test:e2e
```

#### 4. Build Job

```yaml
build:
  runs-on: ubuntu-latest
  needs: [lint, test]
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npm run build
    - uses: actions/upload-artifact@v3
      with:
        name: dist
        path: dist/
```

#### 5. Docker Job

```yaml
docker:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - run: docker build -t app:test .
    - run: docker run -d -p 3000:80 app:test
    - run: sleep 5 && curl http://localhost:3000
```

### Triggers

```yaml
on:
  push:
    branches: [main, task08]
  pull_request:
    branches: [main]
```

### Secrets и Environment Variables

Для деплоя могут потребоваться секреты:

```yaml
env:
  NODE_ENV: production
  VITE_API_URL: ${{ secrets.API_URL }}
```

---

## 🔧 Troubleshooting

### Проблема: npm install fails

```bash
# Очистка кэша
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Проблема: Vite dev server не запускается

```bash
# Проверка порта
lsof -ti:5173 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5173   # Windows

# Запуск на другом порту
npm run dev -- --port 3000
```

### Проблема: Docker build fails

```bash
# Очистка Docker кэша
docker builder prune -a

# Сборка без кэша
docker build --no-cache -t app:latest .
```

### Проблема: Tests fail in CI

```bash
# Локальная проверка CI environment
npm ci                    # Вместо npm install
NODE_ENV=test npm test
```

### Проблема: E2E tests timeout

```bash
# Увеличение timeout в playwright.config.js
export default {
  timeout: 60000,  # 60 секунд
  use: {
    actionTimeout: 15000
  }
}
```

### Проблема: Nginx 404 на refresh

Проверьте `try_files` в nginx.conf:

```nginx
location / {
    try_files $uri $uri/ /index.html;  # SPA fallback
}
```

### Проблема: GitHub Pages 404

1. Проверьте настройку `base` в `vite.config.js`
2. Убедитесь, что файлы находятся в правильной ветке (`gh-pages`)
3. Проверьте наличие `.nojekyll` файла в корне

---

## 📊 Мониторинг и логирование

### Production Logs

```bash
# Docker logs
docker-compose logs -f app

# Nginx access logs
docker exec app tail -f /var/log/nginx/access.log

# Nginx error logs
docker exec app tail -f /var/log/nginx/error.log
```

### Health Check

```bash
# HTTP health check
curl http://localhost:3000

# Docker health check
docker inspect --format='{{.State.Health.Status}}' app
```

---

## 🔐 Безопасность

### Security Headers

Nginx конфигурация включает:

```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

### HTTPS/SSL

Для production рекомендуется использовать HTTPS:

```bash
# С помощью Let's Encrypt + Certbot
certbot --nginx -d yourdomain.com
```

---

## 📈 Performance

### Optimization Checklist

- ✅ Minification (Terser)
- ✅ Code splitting
- ✅ Gzip compression
- ✅ Browser caching (1 year for static assets)
- ✅ Lazy loading компонентов
- ✅ Image optimization
- ✅ CDN для статики (опционально)

---

## 🔗 Полезные ссылки

- **Live Demo**: [https://alexsandro007.github.io/all_tasks_v23/task_08/index.html](https://alexsandro007.github.io/all_tasks_v23/task_08/index.html)
- **Vite Docs**: https://vitejs.dev/
- **Docker Docs**: https://docs.docker.com/
- **Nginx Docs**: https://nginx.org/en/docs/
- **GitHub Actions**: https://docs.github.com/en/actions
