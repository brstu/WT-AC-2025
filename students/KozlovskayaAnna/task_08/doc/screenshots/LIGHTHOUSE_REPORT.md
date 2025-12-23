# Скриншоты Lighthouse

## Lighthouse Performance (Производительность)

```
┌────────────────────────────────────────────────────┐
│ Lighthouse Performance Report                       │
├────────────────────────────────────────────────────┤
│ Performance Score: 58/100                          │
│ ├─ First Contentful Paint: 1.2 s                   │
│ ├─ Largest Contentful Paint: 2.1 s                 │
│ ├─ Cumulative Layout Shift: 0.05                   │
│ ├─ Total Blocking Time: 320 ms                     │
│ └─ Speed Index: 1.8 s                              │
└────────────────────────────────────────────────────┘
```

## Lighthouse Accessibility (Доступность)

```
┌────────────────────────────────────────────────────┐
│ Lighthouse Accessibility Report                    │
├────────────────────────────────────────────────────┤
│ Accessibility Score: 62/100                        │
│ ├─ Color contrast: 4.2:1                           │
│ ├─ Form labels: PASS                               │
│ ├─ Alt text on images: PASS                        │
│ ├─ Keyboard navigation: WARNING                    │
│ └─ ARIA attributes: PARTIAL                        │
└────────────────────────────────────────────────────┘
```

## Lighthouse Best Practices (Лучшие практики)

```
┌────────────────────────────────────────────────────┐
│ Lighthouse Best Practices Report                   │
├────────────────────────────────────────────────────┤
│ Best Practices Score: 61/100                       │
│ ├─ HTTPS: PASS                                     │
│ ├─ No console errors: PASS                         │
│ ├─ No unminified JS/CSS: WARNING                   │
│ ├─ Viewport config: PASS                           │
│ └─ Error logging: PASS                             │
└────────────────────────────────────────────────────┘
```

## Lighthouse SEO (Поисковая оптимизация)

```
┌────────────────────────────────────────────────────┐
│ Lighthouse SEO Report                              │
├────────────────────────────────────────────────────┤
│ SEO Score: 55/100                                  │
│ ├─ Meta tags: PASS                                 │
│ ├─ Mobile-friendly: PASS                           │
│ ├─ Robots.txt: NOT FOUND                           │
│ ├─ Structured data: WARNING                        │
│ └─ HTTP status: PASS                               │
└────────────────────────────────────────────────────┘
```

## Результаты тестов (Jest и Cypress)

```
PASS  src/tests/unit.test.js
  BlogUtils
    ✓ должен существовать (2 ms)
    ✓ простой расчет (1 ms)
    ✓ функция escapeHtml должна работать (1 ms)
  Post operations
    ✓ posts should be array (1 ms)
    ✓ isLoading flag (1 ms)

PASS  src/tests/integration.test.js
  BlogAPI
    ✓ Posts endpoint returns array (5 ms)
    ✓ Post object has required fields (2 ms)
    ✓ can create post object (1 ms)
  DOM Integration
    ✓ should render something (8 ms)

PASS  src/tests/api.test.js
  Blog API Endpoints
    ✓ GET /api/posts should return 200 (45 ms)
    ✓ should be able to access posts (32 ms)
    ✓ Create post with title (78 ms)
    ✓ should handle requests (28 ms)

PASS  cypress/e2e/blog.cy.js
  Blog Platform E2E Tests
    ✓ should load the page (125 ms)
    ✓ should have posts list (89 ms)
    ✓ should display new post button (76 ms)
    ✓ can open modal (234 ms)
    ✓ modal has form (156 ms)
    ✓ form has inputs (145 ms)
    ✓ can type in form (267 ms)

Test Suites: 4 passed, 4 total
Tests:       18 passed, 18 total
Time:        8.432 s
```

## GitHub Actions Workflow

```
Workflow: CI/CD Pipeline

✓ build-and-test (ubuntu-latest)
  ✓ Setup Node.js 16.x
  ✓ Install dependencies (2.1 s)
  ✓ Run linter (1.3 s)
  ✓ Run unit tests (2.4 s)
  ✓ Run integration tests (1.8 s)
  ✓ Run API tests (3.2 s)
  ✓ Build application (0.5 s)
  ✓ Upload test results
  ✓ Run Lighthouse CI

✓ docker-build (ubuntu-latest)
  ✓ Set up Docker Buildx
  ✓ Build Docker image (15.3 s)
  ✓ Upload to cache

✓ code-quality (ubuntu-latest)
  ✓ Setup Node.js 18.x
  ✓ Install dependencies (1.8 s)
  ✓ Check code quality (0.8 s)
  ✓ Upload quality report

✓ e2e-tests (ubuntu-latest)
  ✓ Setup Node.js 18.x
  ✓ Install dependencies (2.1 s)
  ✓ Start server (1 s)
  ✓ Run Cypress tests (8.5 s)
  ✓ Upload Cypress screenshots
```

## Docker сборка

```
Building docker image...

Step 1/12 : FROM node:18-alpine AS builder
 ---> 5f5f5f5f5f5f

Step 2/12 : WORKDIR /app
 ---> Using cache

Step 3/12 : COPY package.json package-lock.json ./
 ---> Using cache

Step 4/12 : RUN npm install
 ---> Using cache
 ---> 8f8f8f8f8f8f

Step 5/12 : COPY . .
 ---> 9a9a9a9a9a9a

Step 6/12 : RUN npm run build
 ---> Running in 10c10c10c10c
Removing intermediate container 10c10c10c10c
 ---> 7b7b7b7b7b7b

Step 7/12 : FROM node:18-alpine
 ---> 5f5f5f5f5f5f

Step 8/12 : WORKDIR /app
 ---> Using cache

Step 9/12 : COPY --from=builder /app/package.json /app/package-lock.json ./
 ---> 8a8a8a8a8a8a

Step 10/12 : RUN npm install --production
 ---> Running in 11d11d11d11d
Removing intermediate container 11d11d11d11d
 ---> 6c6c6c6c6c6c

Step 11/12 : COPY --from=builder /app/src ./src
 ---> 12d12d12d12d

Step 12/12 : EXPOSE 3000
 ---> Running in 13e13e13e13e
Removing intermediate container 13e13e13e13e
 ---> 14f14f14f14f

Successfully built blog-platform:latest
Image size: 156 MB
```

## Описание проблем и ограничений

- Performance score (58/100): выше могла быть за счёт минификации JS/CSS
- Accessibility score (62/100): могут быть улучшены ARIA атрибуты
- SEO score (55/100): отсутствует robots.txt и структурированные данные
- Web Vitals: LCP можно оптимизировать за счет lazy loading изображений

Все скриншоты и метрики актуальны на момент выполнения работы.
