# RealEstate Platform

React, TypeScript and Express real estate platform for the Indian market.

## Structure

- `frontend/` - Vite, React, TypeScript and Tailwind UI
- `backend/` - Express, Mongoose REST API

## Setup

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cd backend && npm install
cd ../frontend && npm install
```

Start MongoDB-backed API:

```bash
cd backend
npm run dev
```

Start frontend:

```bash
cd frontend
npm run dev
```

## Scripts

Backend:

```text
npm run dev    Start with hot reload
npm run build  Compile TypeScript
npm start      Run compiled API
npm run seed   Seed users, properties and appointments
```

Frontend:

```text
npm run dev    Start Vite
npm run build  Production build
npm run lint   Lint source
npm run preview Preview production build
```

## Environment Variables

Backend: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `CLIENT_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`, `AI_HUB_ENABLED`, `AI_API_URL`, `AI_API_KEY`, `AI_MODEL`.

Frontend: `VITE_API_URL`, `VITE_ENABLE_AI_HUB`.

Never commit populated `.env` files.

## API Endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/forgot-password` | Public |
| POST | `/api/auth/reset-password/:token` | Public |
| GET | `/api/users/me` | Auth |
| GET | `/api/properties` | Public |
| GET | `/api/properties/:id` | Public |
| POST | `/api/properties` | Auth |
| PUT | `/api/properties/:id` | Owner |
| DELETE | `/api/properties/:id` | Owner |
| GET | `/api/properties/my` | Auth |
| POST | `/api/appointments/guest` | Public |
| POST | `/api/appointments` | Auth |
| GET | `/api/appointments/my` | Auth |
| PATCH | `/api/appointments/:id/cancel` | Owner |
| POST | `/api/ai-hub/search` | Feature flag |

## AI Hub

Set `VITE_ENABLE_AI_HUB=true` and `AI_HUB_ENABLED=true` only after configuring the AI API. Enter the Firecrawl key in the UI. The key is stored only in browser localStorage and sent through `x-firecrawl-key`; it is never stored or logged by the backend.

## Learning Objectives Recap

- React with TypeScript, Context, Router and lazy loading.
- Custom Express REST API with Mongoose and JWT.
- Password hashing and SMTP password reset.
- ImageKit multipart image uploads and owner-only CRUD.
- Indian-market filtering, property galleries and viewing appointments.
- Helmet, CORS, sanitization and rate limiting.
- Vercel and Render deployment.
- Optional Firecrawl, AI ranking, retries and feature flags.
