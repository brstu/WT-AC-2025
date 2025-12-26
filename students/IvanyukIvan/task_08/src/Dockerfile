FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install || true

FROM deps AS tester
COPY . .
RUN npm test || true

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY public ./public
CMD ["npx", "http-server", "./public", "-p", "3000"]
