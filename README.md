# Social Media Backend

This is a Node.js backend project for a social media application. It uses TypeScript for type safety and follows a modular architecture for scalability and maintainability.

## Features
- User authentication (login, registration)
- JWT-based authorization
- Input validation
- Centralized error handling
- Modular structure (controllers, services, models, routes)
- Database integration (configured in `src/configs/database.ts`)

## Project Structure

```
src/
  app.ts                # Main app setup
  server.ts             # Server entry point
  configs/
    database.ts         # Database configuration
  controllers/
    auth.controller.ts  # Auth controller logic
    user.controller.ts  # User controller logic
  dtos/
    user.dto.ts         # Data Transfer Objects (DTOs)
  interfaces/
    user.interface.ts   # User type definitions
  libs/
    customError.ts      # Custom error class
  middlewares/
    auth.middleware.ts      # Auth middleware
    errorHandler.ts         # Error handling middleware
    validation.middleware.ts# Validation middleware
  models/
    user.model.ts       # User model
  routes/
    auth.route.ts       # Auth routes
    user.route.ts       # User routes
  services/
    auth.service.ts     # Auth service logic
    user.service.ts     # User service logic
  validators/
    user.validator.ts   # User input validation
```

## Getting Started

### Prerequisites
- Node.js >= 16.x
- npm >= 8.x
- Database (e.g., MongoDB)

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd social-media-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (create a `.env` file taking an example from .env.example):
   - Example:
     ```env
     PORT=5000
     DB_URI=mongodb://localhost:27017/social-media
     JWT_SECRET=your_jwt_secret
     ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Scripts
- `npm run dev` — Start server in development mode
- `npm run build` — Compile TypeScript
- `npm start` — Start server in production mode

## API Endpoints

### Auth Endpoints
- `POST /api/v1/auth/register` — Register a new user
- `POST /api/v1/auth/login` — Login and receive JWT
- `GET /api/v1/auth/profile` — Get authenticated user's profile
- `POST /api/v1/auth/change-password` — Change password (authenticated)
- `POST /api/v1/auth/forgot-password` — Request password reset
- `POST /api/v1/auth/reset-password?token=some_token` — Reset password with token

### User Endpoints
- `POST /api/v1/user/update-location` — Update user's location (authenticated)

