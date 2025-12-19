# Educational API

A RESTful API for managing educational groups, tasks, and grades using Express.js.

## Installation

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Copy `.env.example` to `.env` and configure if needed (e.g., PORT=3000).
4. If `data.json` doesn't exist, it will be created with sample data on first run.

## Running the API

- Development: `npm run dev` (uses nodemon for auto-reload).
- Production: `npm start`.

The API will be available at `http://localhost:3000`.

## API Documentation

Swagger UI is available at `/docs`.

OpenAPI JSON spec at `/openapi.json`.

## Endpoints

- Groups: `/api/groups` (GET, POST), `/api/groups/:id` (GET, PATCH, DELETE), `/api/groups/:id/tasks` (GET).
- Tasks: `/api/tasks` (GET, POST), `/api/tasks/:id` (GET, PATCH, DELETE), `/api/tasks/:id/grades` (GET).
- Grades: `/api/grades` (GET, POST), `/api/grades/:id` (GET, PATCH, DELETE).

Query params for lists: `q` (search by name/title/studentId), `limit` (default 10), `offset` (default 0).

## Examples

### Create a Group (POST /api/groups)

```bash
curl -X POST http://localhost:3000/api/groups \
-H "Content-Type: application/json" \
-d '{"name": "Math 101", "description": "Intro to Math", "students": ["student1"]}'
```
