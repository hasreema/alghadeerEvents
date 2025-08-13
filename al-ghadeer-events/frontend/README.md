# Al Ghadeer Events – Frontend (Next.js)

This is the frontend-only application for Al Ghadeer Events built with Next.js 14 and TypeScript.

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- A running backend API URL (FastAPI or compatible) – set via `NEXT_PUBLIC_API_URL`

### Local Development
```bash
cd frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://<your-backend-host>:8000/api
npm run dev
# Open http://localhost:3000
```

### Docker (Frontend-only)
```bash
# from repo root
export NEXT_PUBLIC_API_URL=http://localhost:8000/api
docker compose -f docker-compose.frontend.yml up -d --build
# Open http://localhost:3000
```

## Configuration
- `NEXT_PUBLIC_API_URL`: Base URL for backend API (e.g. http://localhost:8000/api)
- `NEXT_PUBLIC_WS_URL`: WebSocket base URL (optional)
- `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_DEFAULT_LANGUAGE`, feature flags in `.env.example`

## Tech
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + MUI components
- Zustand state management
- Axios for API

## Structure
- `src/app`: pages and layout
- `src/services`: API client and feature services (events, tasks, payments)
- `src/store`: Zustand stores
- `src/components`: UI components (calendar, payments)
- `src/config.ts`: central config for API/WS URLs

## Connecting to Backend
The frontend reads `NEXT_PUBLIC_API_URL`. Ensure your backend exposes endpoints like:
- `POST /api/auth/login`
- `GET /api/events`, `GET /api/tasks`, `GET /api/payments`

If you deploy backend elsewhere, just set `NEXT_PUBLIC_API_URL` accordingly.