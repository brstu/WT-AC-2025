FROM node:18

WORKDIR /app

COPY . .

RUN npm install && \
    npm run build && \
    npm install -g serve@14.2.4

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
