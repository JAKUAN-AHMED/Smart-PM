# Smart Project & Task Collaboration System

A full-stack project & task management platform with role-based access control, real-time-ready data layer, validation/conflict handling, dashboards, and activity tracking.

**Stack:** Node.js · TypeScript · Express · MongoDB (Mongoose) · React · Redux Toolkit · RTK Query · TailwindCSS · Recharts · Zod

---

## Table of Contents

1. [Features Overview](#features-overview)
2. [Project Structure](#project-structure)
3. [Local Setup](#local-setup)
4. [Environment Variables](#environment-variables)
5. [Demo Credentials](#demo-credentials)
6. [API Reference](#api-reference)
7. [Deployment](#deployment)
8. [Notes on Architecture](#notes-on-architecture)

---

## Features Overview

### Authentication & RBAC
- Email + password signup / login (JWT tokens, bcrypt hashing)
- One-click **Demo Login** on the sign-in screen
- Three roles enforced both API-side and UI-side:
  - **Admin** — full system access
  - **ProjectManager** — create/manage projects, assign tasks
  - **Member** — update only assigned tasks, see projects they belong to

### Projects
- CRUD with name, description, deadline, status (`Active` / `Completed` / `OnHold`)
- Add / remove team members per project
- Per-project progress (`completed / total` tasks, % bar)

### Tasks
- CRUD with title, description, assignee, due date, priority (`Low / Medium / High`), status (`Todo / InProgress / Completed`)
- **Validation & conflict handling:**
  - Prevents duplicate titles inside the same project (case-insensitive unique index)
  - Prevents reassigning a `Completed` task — *“Completed tasks cannot be reassigned.”*
  - Blocks past-dated deadlines — *“Please select a valid deadline.”*
  - Blocks adding tasks to completed projects
- Inline status change from the table, comments per task

### Team Collaboration
- Add members to projects
- Per-member workload summary (total / todo / in-progress / completed / pending) with completion %

### Activity Log
- Auto-recorded for create / update / delete / status change / assignment / comment
- Recent activity surfaced on the Dashboard + dedicated Activity page

### Dashboard & Analytics
- KPI cards: Total Projects, Total Tasks, Completed, Pending, Overdue
- Charts (Recharts):
  - Project Progress (bar)
  - Tasks by Priority (pie)
  - Completion Trend — last 14 days (line)
  - Task Status Distribution (pie)
- Upcoming Deadlines, High-Priority Tasks, Recent Activity, Member Workload widgets

### Search · Filter · Sort · Paginate
- Project search (name / description), status filter, sort by latest / deadline / updated / name
- Task search, plus filters: project, assignee, status, priority, deadline status (upcoming/overdue)
- Server-side pagination on lists

### UX
- Dark / Light theme (persisted)
- Responsive layout
- Toast notifications, modal forms, empty states

---

## Project Structure

```
.
├── server/                      # Node.js + Express + TS + MongoDB
│   ├── src/
│   │   ├── config/              # env & db connect
│   │   ├── models/              # Mongoose: User, Project, Task, Activity
│   │   ├── validators/          # Zod request schemas
│   │   ├── middleware/          # auth, RBAC, validation, error
│   │   ├── services/            # business logic (auth, project, task, activity)
│   │   ├── controllers/         # thin HTTP handlers
│   │   ├── routes/              # route definitions
│   │   ├── utils/               # ApiError, asyncHandler, apiResponse, seed
│   │   ├── types/               # global type augmentation
│   │   ├── app.ts               # Express app
│   │   └── server.ts            # bootstrap
│   ├── package.json
│   └── tsconfig.json
└── client/                      # React + Vite + Redux Toolkit + RTK Query
    ├── src/
    │   ├── app/                 # store, api base, hooks
    │   ├── features/
    │   │   ├── auth/            # authSlice + authApi
    │   │   ├── users/           # usersApi
    │   │   ├── projects/        # projectsApi
    │   │   ├── tasks/           # tasksApi
    │   │   ├── activity/        # activityApi
    │   │   ├── dashboard/       # dashboardApi
    │   │   └── ui/              # uiSlice (theme, sidebar)
    │   ├── components/
    │   │   ├── ui/              # Avatar, Badge, Modal, Pagination, …
    │   │   ├── layout/          # AppLayout, Sidebar, Topbar
    │   │   ├── projects/        # ProjectForm
    │   │   ├── tasks/           # TaskForm
    │   │   └── dashboard/       # KpiCard
    │   ├── pages/               # Login, Signup, Dashboard, Projects, Tasks…
    │   ├── routes/              # ProtectedRoute, AppRoutes
    │   ├── utils/               # format, errors
    │   ├── types/               # shared types
    │   └── styles/              # Tailwind base
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

---

## Local Setup

### Prerequisites

- Node.js ≥ 18
- MongoDB running locally (or a connection string for Atlas)

### 1. Backend

```bash
cd server
cp .env.example .env       # then edit values as needed
npm install
npm run seed               # creates demo users, projects, tasks
npm run dev                # http://localhost:5000
```

### 2. Frontend

```bash
cd client
cp .env.example .env       # set VITE_API_BASE_URL if not localhost:5000
npm install
npm run dev                # http://localhost:5173
```

Open http://localhost:5173 and click **Demo Login (Admin)**.

---

## Environment Variables

### `server/.env`

| Key              | Description                              | Example                                  |
| ---------------- | ---------------------------------------- | ---------------------------------------- |
| `PORT`           | API port                                 | `5000`                                   |
| `NODE_ENV`       | `development` / `production`             | `development`                            |
| `MONGO_URI`      | MongoDB connection string                | `mongodb://127.0.0.1:27017/smart_pm`     |
| `JWT_SECRET`     | Long random string for token signing     | `change_me_in_prod`                      |
| `JWT_EXPIRES_IN` | Token lifetime                           | `7d`                                     |
| `CLIENT_ORIGIN`  | Allowed CORS origin(s), comma-separated  | `http://localhost:5173`                  |

### `client/.env`

| Key                  | Description                       | Example                          |
| -------------------- | --------------------------------- | -------------------------------- |
| `VITE_API_BASE_URL`  | Base URL of the backend API       | `http://localhost:5000/api`      |

---

## Demo Credentials

After running `npm run seed` in `server/`, these accounts are available (password is the same for all):

| Role            | Email             | Password   |
| --------------- | ----------------- | ---------- |
| Admin           | `admin@demo.com`  | `demo1234` |
| Project Manager | `pm@demo.com`     | `demo1234` |
| Member          | `john@demo.com`   | `demo1234` |
| Member          | `sara@demo.com`   | `demo1234` |
| Member          | `mike@demo.com`   | `demo1234` |

The login screen has a **Demo Login** button pre-wired to the Admin account.

---

## API Reference

Base URL: `/api`

### Auth

| Method | Endpoint        | Auth | Description                           |
| ------ | --------------- | ---- | ------------------------------------- |
| POST   | `/auth/signup`  | —    | Register a user                       |
| POST   | `/auth/login`   | —    | Returns `{ user, token }`             |
| GET    | `/auth/me`      | ✓    | Current user                          |

### Projects

| Method | Endpoint                              | Roles            |
| ------ | ------------------------------------- | ---------------- |
| GET    | `/projects?search&status&page&limit&sort` | any         |
| GET    | `/projects/:id`                       | any              |
| POST   | `/projects`                           | Admin, PM        |
| PATCH  | `/projects/:id`                       | Admin, PM        |
| DELETE | `/projects/:id`                       | Admin, PM        |
| POST   | `/projects/:id/members`               | Admin, PM        |
| DELETE | `/projects/:id/members/:memberId`     | Admin, PM        |

### Tasks

| Method | Endpoint                                                   | Roles     |
| ------ | ---------------------------------------------------------- | --------- |
| GET    | `/tasks?search&project&assignee&status&priority&deadlineStatus&page&limit&sort` | any |
| GET    | `/tasks/:id`                                               | any       |
| POST   | `/tasks`                                                   | Admin, PM |
| PATCH  | `/tasks/:id`                                               | any\*     |
| PATCH  | `/tasks/:id/status`                                        | any\*     |
| DELETE | `/tasks/:id`                                               | Admin, PM |
| POST   | `/tasks/:id/comments`                                      | any       |

\* Members can update assigned tasks; service-layer validations enforce conflict rules.

### Dashboard & Misc

| Method | Endpoint                            |
| ------ | ----------------------------------- |
| GET    | `/dashboard/stats`                  |
| GET    | `/dashboard/project-progress`       |
| GET    | `/dashboard/upcoming-deadlines`     |
| GET    | `/dashboard/high-priority`          |
| GET    | `/dashboard/progress-trend`         |
| GET    | `/users` / `/users/workload`        |
| GET    | `/activities?limit&project`         |
| GET    | `/health`                           |

Standard response envelope:

```json
{ "success": true, "data": { ... }, "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 } }
```

Error envelope:

```json
{ "success": false, "message": "This task already exists in the project.", "details": null }
```

---

## Deployment

### Backend (Render / Railway / Fly.io / VPS)

1. Build:
   ```bash
   cd server
   npm install
   npm run build
   ```
2. Start: `node dist/server.js`
3. Set env vars (see table above). Make sure `MONGO_URI` points to your Atlas cluster and `CLIENT_ORIGIN` matches your deployed frontend URL.
4. Optional: run `npm run seed` once after first deploy.

### Frontend (Vercel / Netlify / Cloudflare Pages)

1. Build command: `npm run build`
2. Output directory: `dist`
3. Set `VITE_API_BASE_URL` to your deployed backend, e.g. `https://api.your-domain.com/api`
4. SPA routing: add a rewrite from `/*` → `/index.html` (Vercel/Netlify do this automatically with the `vite` framework preset).

### MongoDB

- Use MongoDB Atlas free tier.
- Whitelist `0.0.0.0/0` (or your hosting provider's egress IPs) during setup.

---

## Notes on Architecture

- **Backend layering:** routes → controllers (thin) → services (business rules) → models. Errors funnel through a single `errorHandler` that handles Zod, Mongoose, and `ApiError`.
- **Conflict handling:** A compound unique index `{ project, title }` with case-insensitive collation gives us the duplicate-task guarantee even under concurrent writes; the service throws `409 Conflict` with a user-facing message.
- **RBAC:** Express middleware enforces roles per route. The frontend additionally hides actions Members shouldn't see.
- **Activity log:** wrapped in a helper that never throws back to the request — logging failures are isolated.
- **Frontend caching:** RTK Query manages all server cache with explicit tag invalidation (`Project`, `Task`, `Dashboard`, `Activity`, `Workload`), so creating a task immediately refreshes the dashboard widgets that depend on it.
- **Theming:** Tailwind dark mode toggled via a class on `<html>`; the preference is persisted in `localStorage`.
- **No premature abstractions:** Each feature folder owns its slice + API; shared UI lives under `components/ui`.

---

## Scripts

### Server

```bash
npm run dev       # nodemon + ts-node
npm run build     # tsc → dist/
npm start         # node dist/server.js
npm run seed      # populate MongoDB with demo data
```

### Client

```bash
npm run dev       # Vite dev server (http://localhost:5173)
npm run build     # type-check + vite build
npm run preview   # preview built bundle
```
