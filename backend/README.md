## Backend (NestJS) – Blue Matrix Task Manager

This service powers authentication, project management, and Kanban task workflows. It exposes a REST API secured with JWT and backed by Prisma + SQLite (swap `DATABASE_URL` for Postgres or another supported database).

### Tech Stack

- NestJS 11, TypeScript, Passport JWT
- Prisma ORM with SQLite
- Class Validator / Transformer

### Quick Start

```bash
npm install

# Ensure environment values (defaults below)
cp .env .env.local   # optional

# Apply Prisma migrations & generate client
npx prisma migrate dev

# start API on http://localhost:3000
npm run start:dev
```

### Environment Variables

`./.env` (already provided):

```
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="changeme"
JWT_EXPIRES_IN="7d"
```

### Scripts

```bash
npm run start:dev   # watch mode
npm run lint        # ESLint
npm run test        # unit tests
npm run build       # compile to dist/
```

### API Overview

All routes are prefixed with `/api`.

| Method | Route                               | Description                           |
| ------ | ----------------------------------- | ------------------------------------- |
| POST   | /auth/register                      | Create user and return JWT            |
| POST   | /auth/login                         | Log in with email/password            |
| GET    | /auth/me                            | Current authenticated user            |
| GET    | /projects                           | List user projects                    |
| POST   | /projects                           | Create project                        |
| GET    | /projects/:id                       | Project details with tasks            |
| PATCH  | /projects/:id                       | Update project (name/description)     |
| DELETE | /projects/:id                       | Delete project                        |
| GET    | /projects/:projectId/tasks          | Tasks grouped by status               |
| POST   | /projects/:projectId/tasks          | Create task                           |
| PATCH  | /tasks/:id                          | Update task content/status            |
| PATCH  | /tasks/:id/move                     | Move task (column & position)         |
| DELETE | /tasks/:id                          | Delete task                           |

All protected endpoints require `Authorization: Bearer <token>`.

### Testing

```bash
npm run lint
npm run test
```

### Deployment Tips

- Set `DATABASE_URL` to your production database (e.g. Postgres on Railway/Neon).  
- Use a long, random `JWT_SECRET`.  
- Run `npx prisma migrate deploy` during deploy pipelines.  
- Configure CORS for your frontend origin if different from localhost.  
