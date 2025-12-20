# =========================
# 1. Build stage
# =========================
FROM node:20-alpine AS build

WORKDIR /app

# зависимости
COPY package*.json ./
RUN npm ci

# исходники
COPY . .

# сборка
RUN npm run build


# =========================
# 2. Production stage
# =========================
FROM nginx:alpine

# удалить дефолтный конфиг nginx
RUN rm /etc/nginx/conf.d/default.conf

# скопировать nginx конфиг
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# скопировать билд из build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
