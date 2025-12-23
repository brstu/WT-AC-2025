# Gym Booking App

This is a Node.js server application using Express.js and TypeScript for managing gym bookings with user authentication and role-based access control.

## Features

- User registration and login with JWT authentication.
- CRUD operations for gym slots (schedules).
- Role-based access control (admin/user).
- Booking management with user roles.
- Payment stub functionality for processed bookings.

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

- POST /api/auth/signup { email, password, name?, role? } - Register user (role: admin/user).
- POST /api/auth/login { email, password } - Login and get JWT.

Example curl for signup:

```bash
curl -X POST http://localhost:3000/api/auth/signup -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"pass123","name":"User"}'
```

Example curl for login:

```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"pass123"}'
```

### Gym Slots/Schedule (Requires Bearer Token)

- GET /api/slots - List available gym slots.
- GET /api/slots/:id - Get slot details.
- POST /api/slots { startTime, endTime, capacity, price? } - Create slot (admin only).
- PUT /api/slots/:id { startTime, endTime, capacity, price? } - Update slot (admin only).
- DELETE /api/slots/:id - Delete slot (admin only).

Example curl for list slots (replace TOKEN):

```bash
curl -X GET http://localhost:3000/api/slots -H "Authorization: Bearer TOKEN"
```

### Bookings (Requires Bearer Token)

- GET /api/bookings - List own bookings.
- GET /api/bookings/:id - Get booking details.
- POST /api/bookings { slotId } - Book a gym slot.
- PUT /api/bookings/:id { status } - Update booking status.
- DELETE /api/bookings/:id - Cancel booking.

### Payments (Requires Bearer Token)

- POST /api/payments { bookingId, amount } - Process payment stub.
- GET /api/payments/:bookingId - Get payment status.

## Switching to PostgreSQL

1. Install PostgreSQL.
2. Update prisma/schema.prisma: change provider to "postgresql".
3. Update .env DATABASE_URL to PostgreSQL connection string.
4. Run migrations again.
