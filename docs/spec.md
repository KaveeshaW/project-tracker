# Project Tracker — Spec-Driven Development Record

This project was built using **Spec-Driven Development (SDD)**: no code was written until each phase was explicitly approved.

---

## Phase 1 — Proposal

**Goal:** Build a single-user, local project tracker with a Kanban board.

**Core outcomes:**
- Create and manage named projects
- Create tasks within a project, each with a title and status
- View tasks in a three-column Kanban board (To Do / In Progress / Done)
- Drag tasks between columns to update their status
- Persist everything across page refreshes (backend + SQLite)

**Scope boundaries (v1):**
- One active project at a time (selectable via dropdown)
- Tasks have: title, status, and project assignment
- No auth, no due dates, no priorities, no labels, no comments

**Out of scope:**
- Multi-user, accounts, or authentication
- Real-time sync / websockets
- Task ordering within a column
- Rich text, attachments, or sub-tasks

**Stack:** React + Vite (frontend), Express + SQLite via `better-sqlite3` (backend)

---

## Phase 2 — Specification

### Constraints
- Single-user, no authentication
- Data persisted in SQLite (`server/db.sqlite`)
- Backend: `localhost:3001`, Frontend: `localhost:5173`
- Status values fixed enum: `todo` | `in-progress` | `done`
- Projects ordered by `created_at DESC`

### Data Model

**projects**

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER PK | auto-increment |
| `name` | TEXT | required, unique |
| `created_at` | TEXT | ISO timestamp |

**tasks**

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER PK | auto-increment |
| `project_id` | INTEGER FK | references `projects.id` |
| `title` | TEXT | required |
| `status` | TEXT | `todo` \| `in-progress` \| `done` |
| `created_at` | TEXT | ISO timestamp |

### API

| Method | Path | Body | Response | Description |
|--------|------|------|----------|-------------|
| `GET` | `/projects` | — | `Project[]` | List all projects |
| `POST` | `/projects` | `{ name }` | `Project` | Create a project |
| `GET` | `/tasks?projectId=` | — | `Task[]` | List tasks for a project |
| `POST` | `/tasks` | `{ projectId, title }` | `Task` | Create a task (defaults to `todo`) |
| `PATCH` | `/tasks/:id` | `{ status }` | `Task` | Update task status |
| `DELETE` | `/tasks/:id` | — | `{ ok: true }` | Delete a task |

All responses are JSON. Errors return `{ error: string }` with an appropriate HTTP status.

### UI / Component Breakdown

```
App
├── ProjectSelector          # dropdown to select or create a project
├── KanbanBoard              # renders three columns
│   ├── Column (×3)          # "To Do", "In Progress", "Done"
│   │   └── TaskCard (×n)   # title + delete button
└── AddTaskForm              # title input + submit, scoped to active project
```

**Behaviors:**
- On load, fetch all projects; auto-select the first one
- Selecting a project fetches its tasks and renders the board
- Dragging a TaskCard between columns calls `PATCH /tasks/:id` with the new status
- `AddTaskForm` is disabled when no project is selected
- Creating a project immediately selects it
- Deleting a task removes it from the board without a page reload

---

## Phase 3 — Implementation Plan

### Build order
1. Backend API (Express + SQLite) — `db.js`, routes, `server.js`
2. React scaffold (Vite) — install `@hello-pangea/dnd`
3. Frontend components — `api.js`, `ProjectSelector`, `TaskCard`, `Column`, `KanbanBoard`, `AddTaskForm`
4. Wire state in `App.jsx` — project/task state, drag-end handler, optimistic updates

### Architectural risks

| Risk | Mitigation |
|------|-----------|
| Optimistic drag updates can de-sync if PATCH fails | Catch errors and revert local state on failure |
| CORS misconfiguration | Set `cors({ origin: 'http://localhost:5173' })` explicitly |
| SQLite write contention if multiple tabs open | Acceptable for single-user; use one tab |
| `better-sqlite3` native compilation failure | Requires Xcode CLI tools on Mac |

---

## Phase 4 — Task List

| # | Task | Status |
|---|------|--------|
| T1 | Create `/server` folder and initialize `package.json` | ✅ |
| T2 | Install `express`, `better-sqlite3`, `cors` | ✅ |
| T3 | Create `db.js` with SQLite connection and table setup | ✅ |
| T4 | Create `routes/projects.js` | ✅ |
| T5 | Create `routes/tasks.js` | ✅ |
| T6 | Create `server.js` | ✅ |
| T7 | Scaffold React app with Vite inside `/client` | ✅ |
| T8 | Install `@hello-pangea/dnd` | ✅ |
| T9 | Create `src/api.js` fetch wrappers | ✅ |
| T10 | Build `ProjectSelector` component | ✅ |
| T11 | Build `TaskCard` component | ✅ |
| T12 | Build `Column` component with `Droppable` | ✅ |
| T13 | Build `KanbanBoard` with `DragDropContext` | ✅ |
| T14 | Build `AddTaskForm` component | ✅ |
| T15 | Wire everything in `App.jsx` | ✅ |
