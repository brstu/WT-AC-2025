# Простой Dockerfile без оптимизации
FROM node:18

# Рабочая директория
WORKDIR /app

# Копируем всё
COPY . .

# Устанавливаем зависимости
RUN npm install

# Открываем порт
EXPOSE 3000

# Запуск
CMD ["npm", "start"]
