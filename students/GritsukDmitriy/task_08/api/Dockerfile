FROM node:20-alpine

WORKDIR /app

COPY db.json .

RUN npm install -g json-server@0.17.4

EXPOSE 3000

CMD ["json-server", "--watch", "db.json", "--host", "0.0.0.0"]
