cd backend
npm install            # if you haven’t already
npx prisma migrate dev # ensures the SQLite DB is up to date
npm run start:dev      # runs on http://localhost:3000
****************************************************************
cd frontend
npm install
cp .env.example .env.local    # only needed once; tweak the API URL if you changed $env:PORT = 3001          
npm run dev     # front-end on http://localhost:3001
***********************************************************
Test:
- Backend linting: 'npm run lint'
- Backend tests: 'npm run test'
- Frontend linting: 'npm run lint'
- Frontend build: 'npm run build'
******************************************************************
Key Endpoints:
- POST /api/auth/register – create account  
- POST /api/auth/login – issue JWT  
- GET /api/auth/me – current user profile  
- GET /api/projects – list projects  
- POST /api/projects – create project  
- GET /api/projects/:id – project with tasks  
- PATCH /api/projects/:id / DELETE /api/projects/:id  
- GET /api/projects/:projectId/tasks – Kanban board (grouped)  
- POST /api/projects/:projectId/task – create task  
- PATCH /api/tasks/:id – update task details  
- PATCH /api/tasks/:id/move – move task between columns  
- DELETE /api/tasks/:id
