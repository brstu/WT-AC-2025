# Multi-stage Dockerfile

# Stage 1: Build
FROM node:20-alpine AS builder

# Устанавливаем зависимости только для production
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./
COPY package-lock.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Копируем собранное приложение в nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Экспортируем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]