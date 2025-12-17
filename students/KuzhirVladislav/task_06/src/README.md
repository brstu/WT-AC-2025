# Movie Collection App

This is a Node.js server application using Express.js and TypeScript for managing movie collections with user authentication.

## Features

- User registration and login with JWT authentication.
- CRUD operations for collections (personal to users).
- CRUD operations for movies (global).
- Add/remove/update movies in collections with roles (e.g., "watched", "planned").

## Prerequisites

- Node.js >= 18
- npm

## Installation

1. Clone the repository.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in the values (JWT_SECRET is required).
4. For SQLite: Use default DATABASE_URL=file:./dev.db
   For PostgreSQL: Set DATABASE_URL=postgresql://user:password@localhost:5432/dbname and change provider in prisma/schema.prisma to "postgresql".
5. Run `npx prisma migrate dev` to apply migrations.
6. Optionally, run `npm run prisma:seed` to create a test user (email: test@example.com, password: password123).

## Running the App

- Development: `npm run dev`
- Production: `npm run build` then `npm start`

## Endpoints

### Auth

- POST /api/auth/signup { email, password, name? } - Register user.
- POST /api/auth/login { email, password } - Login and get JWT.

Example curl for signup:

```bash
curl -X POST http://localhost:3000/api/auth/signup -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"pass123","name":"User"}'
```

Example curl for login:

```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"pass123"}'
```

### Collections (Requires Bearer Token)

- GET /api/collections - List own collections.
- GET /api/collections/:id - Get collection details.
- POST /api/collections { title, description? } - Create collection.
- PUT /api/collections/:id { title, description? } - Update collection.
- DELETE /api/collections/:id - Delete collection.

Example curl for create collection (replace TOKEN):

```bash
curl -X POST http://localhost:3000/api/collections -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"title":"My Favorites"}'
```

### Movies (Requires Bearer Token)

- GET /api/movies - List all movies.
- GET /api/movies/:id - Get movie details.
- POST /api/movies { title, year?, genre? } - Create movie.
- PUT /api/movies/:id { title, year?, genre? } - Update movie.
- DELETE /api/movies/:id - Delete movie.

### Collection Movies (Requires Bearer Token)

- POST /api/collection-movies { collectionId, movieId, role } - Add movie to collection.
- GET /api/collection-movies/:collectionId - List movies in collection.
- PUT /api/collection-movies/:id { role } - Update role.
- DELETE /api/collection-movies/:id - Remove movie from collection.

## Switching to PostgreSQL

1. Install PostgreSQL.
2. Update prisma/schema.prisma: change provider to "postgresql".
3. Update .env DATABASE_URL to PostgreSQL connection string.
4. Run migrations again.
