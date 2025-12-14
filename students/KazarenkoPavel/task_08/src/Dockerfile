# Стадия сборки
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Сборка приложения
RUN npm run build

# Стадия production
FROM nginx:alpine AS production

# Копируем собранное приложение в nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
