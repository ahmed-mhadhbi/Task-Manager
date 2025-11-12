# Blue Matrix Task Manager

Task Manager / Kanban board built with a NestJS API backend and a Next.js frontend. Each user can manage projects and drag tasks across To Do → In Progress → Done columns. Authentication is handled with JWT, and data persists via Prisma + SQLite (swap for Postgres if desired).

## Project Structure

- `backend/` – NestJS 11 API with Prisma ORM  
- `frontend/` – Next.js 16 App Router client with Tailwind UI  

Both apps are independent but communicate over HTTP. The default URLs assume the backend runs on `http://localhost:3000` and the frontend on `http://localhost:3001`.

## Prerequisites

- Node.js 20+ and npm
- SQLite (bundled) or any database supported by Prisma (configure `DATABASE_URL`)

## Backend Setup (`/backend`)

```bash
cd backend
npm install

# copy environment variables and adjust as needed
cp .env .env.local   # or edit .env directly

# Prisma database setup
npx prisma migrate dev

# development server
npm run start:dev

# lint & tests
npm run lint
npm run test
```

Environment variables (`.env`):

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="changeme"
JWT_EXPIRES_IN="7d"
```

REST base URL: `http://localhost:3000/api`

### Key Endpoints

- `POST /api/auth/register` – create account  
- `POST /api/auth/login` – issue JWT  
- `GET /api/auth/me` – current user profile  
- `GET /api/projects` – list projects  
- `POST /api/projects` – create project  
- `GET /api/projects/:id` – project with tasks  
- `PATCH /api/projects/:id` / `DELETE /api/projects/:id`  
- `GET /api/projects/:projectId/tasks` – Kanban board (grouped)  
- `POST /api/projects/:projectId/tasks` – create task  
- `PATCH /api/tasks/:id` – update task details  
- `PATCH /api/tasks/:id/move` – move task between columns  
- `DELETE /api/tasks/:id`

## Frontend Setup (`/frontend`)

```bash
cd frontend
npm install

# environment variables
cp .env.example .env.local

npm run dev       # http://localhost:3001
npm run lint
npm run build
```

Environment variables (`.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Development Workflow

1. Start the backend (`npm run start:dev`).
2. Start the frontend (`npm run dev -- -p 3001` if port 3000 is taken by backend).
3. Register a user at `http://localhost:3001/register`, create a project, and manage tasks on the Kanban board.

## Testing & Quality

- Backend linting: `npm run lint`
- Backend tests: `npm run test`
- Frontend linting: `npm run lint`
- Frontend build: `npm run build`

## Deployment Notes

- For production, replace SQLite with a hosted Postgres instance and update `DATABASE_URL`.
- Configure a secure `JWT_SECRET`.
- Set `NEXT_PUBLIC_API_URL` in the deployed frontend environment to your API host.
- Run `npx prisma migrate deploy` during backend deploy to apply migrations.

## License

MIT

