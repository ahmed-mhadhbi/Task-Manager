## Frontend (Next.js) – Blue Matrix Task Manager

Client interface for authentication, project CRUD, and drag-and-drop Kanban boards.

### Tech Stack

- Next.js 16 App Router (`src/app`)
- Tailwind CSS (v4), shadcn-inspired UI
- React Query, React Hook Form + Zod, Zustand
- Hello Pangea DnD for drag/drop interactions

### Setup

```bash
npm install
cp .env.example .env.local   # configure API URL
npm run dev                  # default localhost:3000
```

If the backend is running on port 3000, start the frontend on another port, e.g. `npm run dev -- -p 3001`.

### Environment Variables

`.env.example` (copy to `.env.local`):

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Scripts

```bash
npm run dev     # development server
npm run build   # production build
npm run start   # start production build
npm run lint    # ESLint
```

### Features

- Authentication (register/login) with persisted JWT
- Protected dashboard layout with navbar and logout
- Project creation/edit/delete, overview stats
- Kanban board per project with drag-and-drop columns
- Task creation, editing, column moves, and deletion
- Responsive layout and loading/empty states

### Deployment Notes

- Set `NEXT_PUBLIC_API_URL` to the deployed backend base path.
- Configure CORS on the backend to allow the deployed frontend origin.
- Use `npm run build && npm run start` or host on Vercel/Netlify with environment variables configured.
