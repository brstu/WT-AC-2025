FROM node:20-alpine

WORKDIR /app

COPY db.json .

RUN npm install -g json-server

EXPOSE 3000

CMD ["json-server", "--watch", "db.json", "--host", "0.0.0.0"]
