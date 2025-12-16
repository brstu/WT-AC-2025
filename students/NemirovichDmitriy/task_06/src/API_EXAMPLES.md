# Примеры запросов к API

## Регистрация нового пользователя

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\"}"
```

## Вход в систему

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"editor@example.com\",\"password\":\"password123\"}"
```

Ответ вернет токен, который нужно использовать для авторизованных запросов.

## Получить все статьи

```bash
curl -X GET http://localhost:3000/api/articles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Создать новую статью

```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"title\":\"Новая статья\",\"content\":\"Содержание статьи\"}"
```

## Получить статью по ID

```bash
curl -X GET http://localhost:3000/api/articles/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Обновить статью

```bash
curl -X PUT http://localhost:3000/api/articles/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"title\":\"Обновленное название\",\"content\":\"Обновленное содержание\"}"
```

## Удалить статью

```bash
curl -X DELETE http://localhost:3000/api/articles/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
