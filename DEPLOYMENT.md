# Module 4 Deployment Guide

## MongoDB Atlas

1. Create a database cluster and database user.
2. Add `0.0.0.0/0` only when testing Render access, or replace it with approved static production IP rules when available.
3. Copy the SRV connection string and set it as `MONGO_URI`.

## Render API

1. Connect the repository and select the `backend` root directory.
2. Runtime: Node.
3. Build command: `npm install && npm run build`.
4. Start command: `npm start`.
5. Health check path: `/api/health`.
6. Set `NODE_ENV=production`, `PORT=10000`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `CLIENT_URL`, SMTP values and ImageKit values.

Example Render environment:

```text
CLIENT_URL=https://your-app.vercel.app
JWT_EXPIRE=7d
```

## Vercel Frontend

1. Import the repository and set the root directory to `frontend`.
2. Framework preset: Vite.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Set `VITE_API_URL=https://your-api.onrender.com/api`.
6. Set `VITE_ENABLE_AI_HUB=false` for Module 4.
7. Replace `YOUR_VERCEL_APP` in `public/robots.txt` and `public/sitemap.xml` with the real domain after deployment.
