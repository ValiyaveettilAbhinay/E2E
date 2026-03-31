# Food and Resource Sharing — Fullstack E2E Project

A community-first web application to share surplus food and resources. This repository contains a React (Vite) frontend and an Express + MongoDB backend with JWT auth, Google OAuth scaffolding, image uploads, request workflow, simple gamification (karma/badges), and email/password reset support.

---

## Quick summary
- Frontend: Vite + React, Axios, Tailwind-like utilities (custom CSS)
- Backend: Node.js + Express, Mongoose (MongoDB), Passport (Google OAuth), multer (uploads), nodemailer (email scaffold), node-cron (scheduled jobs)
- Auth: JWT-based auth + Google OAuth (optional)
- Features: items listing, image upload, favorites, request/approval workflow (first-come-first-serve), karma/boost, monthly reset job, password reset flow

---

## Repository layout
```
/backend    # Express app (server.js, controllers, models, routes)
/frontend   # Vite + React SPA (src/, public/)
```

---

## Prerequisites
- Node 18+ (or latest LTS)
- npm
- MongoDB (local or Atlas)

---

## Backend — Local setup
1. Open a terminal and go to the backend folder:
   ```powershell
   cd c:\Users\keert\OneDrive\Desktop\E2E\backend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Create `.env` (DO NOT commit this file). Required variables:
   ```env
   MONGO_URI=your_mongo_connection_string
   JWT_SECRET=replace_with_a_strong_random_string
   FRONTEND_URL=http://localhost:5173
   PORT=5000

   # Optional: Google OAuth
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

   # Optional: SMTP (for email features)
   SMTP_HOST=
   SMTP_PORT=587
   SMTP_USER=
   SMTP_PASS=
   SMTP_FROM=no-reply@example.com
   ```
4. Start the backend (development):
   ```powershell
   npm start
   # or
   npx nodemon server.js
   ```
5. Server default URL: `http://localhost:5000`

Notes:
- If `MONGO_URI` is missing the server will exit with a helpful message.
- If Google OAuth is not configured the app will show a warning and OAuth routes respond with 501.

---

## Frontend — Local setup
1. Open a terminal and go to the frontend folder:
   ```powershell
   cd c:\Users\keert\OneDrive\Desktop\E2E\frontend
   ```
2. Install deps and run dev server:
   ```powershell
   npm install
   npm run dev
   ```
3. Frontend dev URL: `http://localhost:5173`

Note: `frontend/src/api/axios.js` uses `http://localhost:5000/api` as the default API base URL. Change this to your deployed backend when you publish.

---

## Important scripts
- Backend
  - `npm start` — run `node server.js`
- Frontend
  - `npm run dev` — start Vite dev server
  - `npm run build` — build production assets

---

## Routes / Endpoints (overview)
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `GET /api/auth/google` (OAuth)
- Items: `GET /api/items`, `POST /api/items` (multipart image), `GET /api/items/recommend`, `POST /api/items/favorite/:id`, `DELETE /api/items/favorite/:id`, `POST /api/items/boost/:id`
- Requests: `POST /api/requests/send`, `GET /api/requests/my`, `GET /api/requests/incoming`, owner accept/reject endpoints
- Dashboard/admin endpoints in `backend/routes`

---

## Deployment notes
- Recommended: Deploy frontend to Vercel (static site) and backend to a server/host (Render, Railway, Fly, DigitalOcean, or Cloud Run).
- For Vercel (monorepo): create `vercel.json` to point build to `frontend/` and proxy `/api/*` to your backend host.
- Do not deploy `.env` to public repos. Add environment variables via the provider dashboard.

---

## Security / cleanup
- If any secrets were committed, rotate them immediately (DB users, API keys, OAuth secrets).
- To remove secrets from Git history use `bfg` or `git filter-repo` and then force-push. Coordinate with collaborators before rewriting history.

---

## Troubleshooting (common issues)
- "Cannot find module server.js" — run `node backend/server.js` from the backend folder or use `npm start` inside `backend/`.
- Mongoose `uri` undefined — add `MONGO_URI` to `backend/.env` and restart.
- OAuth errors — ensure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` are set and match Google Console.

---

## Contributing
- Work on feature branches, open PRs, and run linters/tests before merging.
- Keep commits small and focused.

---

If you want, I can:
- Add a `vercel.json` example for this repo.
- Add a `.gitignore` and remove tracked `.env` automatically.
- Produce a deployment checklist for a chosen hosting provider for the backend.

