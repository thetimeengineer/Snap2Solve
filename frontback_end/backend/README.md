Civicfix Backend
================

Quickstart
---------

1. Copy `.env.example` to `.env` (create `.env` manually if necessary) and set values. Use the provided MongoDB connection string for `MONGODB_URI`.
2. Install dependencies:

```bash
cd backend
npm install
```

3. Start in dev:

```bash
npm run dev
```

Notes
-----
- API root is `/api/`  
- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`  
- Issues CRUD: `/api/issues` and `/api/issues/:id`  
- Comments: `/api/issues/:id/comments` (GET/POST)

Environment variables
- `MONGODB_URI` - MongoDB connection string  
- `JWT_SECRET` - JWT signing secret  
- `PORT` - server port (default 5000)  
- `UPLOAD_DIR` - directory for file uploads





