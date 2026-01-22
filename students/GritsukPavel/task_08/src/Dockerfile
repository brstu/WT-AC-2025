FROM node:18

WORKDIR /app

COPY package.json .
COPY script.js .
COPY script.test.js .
COPY jest.config.json .
COPY index.html .
COPY style.css .

RUN npm install

EXPOSE 8080

CMD ["npm", "start"]
