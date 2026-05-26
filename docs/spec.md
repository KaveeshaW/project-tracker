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

---

## Feature: Delete Project

**Proposal:** Add a "Delete Project" button that removes the project and all its tasks, then auto-selects the next available project.

**Specification:**
- Button visible only when a project is selected and no create-project form is open
- Requires `window.confirm` before deleting
- Server deletes tasks first (transaction), then the project — no orphaned rows
- Client removes project from state; auto-selects `remaining[0]` or clears to empty state

**API change:** `DELETE /projects/:id` — wraps both deletes in a SQLite transaction.

**Status:** ✅ Implemented

---

## Feature: Edit Task Title

**Proposal:** Allow inline editing of a task card's title without leaving the board.

**Specification:**
- Default view: `[ title ] [ ✏ ] [ ✕ ]`
- Edit mode: `[ input pre-filled ] [ Save ] [ Cancel ]`
- Enter or Save button saves; Escape or Cancel discards
- Save disabled if input is empty or unchanged
- Card not draggable while in edit mode (prevents accidental drag on click)
- Only one card editable at a time (local state in TaskCard)
- Optimistic update — title changes immediately, reverts if PATCH fails

**API change:** `PATCH /tasks/:id` extended to accept `{ title }` in addition to `{ status }`.

**Key fix:** `e.stopPropagation()` on the input's `onKeyDown` required to prevent `@hello-pangea/dnd`'s keyboard sensor from intercepting the Enter key.

**Status:** ✅ Implemented

---

## Feature: Task Categories + Progress Rings

**Proposal:** Tasks can belong to optional categories (name + colour). A ring strip below the board shows per-category completion as a circular SVG progress ring. Clicking a ring filters the board to that category.

**Specification:**

*Data model additions:*
- `categories` table — `id`, `name` (unique), `color` (hex), `created_at`
- `tasks.category_id` — nullable FK to `categories.id`, `ON DELETE SET NULL`

*API additions:*

| Method | Path | Body | Notes |
|--------|------|------|-------|
| GET | `/categories` | — | ordered `created_at DESC` |
| POST | `/categories` | `{ name, color }` | 409 on duplicate name |
| DELETE | `/categories/:id` | — | SQLite SET NULL cascade |
| PATCH | `/tasks/:id` | `{ category_id }` | nullable, extended endpoint |
| POST | `/tasks` | `{ ..., category_id }` | optional at creation |

*UI additions:*
- `CategoryManager` — coloured chip list + create form with 8 preset colour swatches
- `AddTaskForm` — optional category dropdown when categories exist
- `CategoryStrip` + `CategoryCard` — SVG ring (`stroke-dasharray`/`stroke-dashoffset`), name, X/Y done count
- Filter: clicking a ring sets `activeFilter` in App state; board shows only matching tasks; click again clears
- Task cards show a coloured dot when assigned to a category

**Migration strategy:** `ALTER TABLE tasks ADD COLUMN category_id ...` wrapped in try/catch — silently skipped if column already exists.

**Status:** ✅ Implemented

---

## Enhancement: Edit Task Category

**Summary:** Extend the existing task card edit mode to also allow changing (or removing) the category, without a separate SDD cycle.

**Changes:**
- Edit mode gains a category `<select>` dropdown below the title input (only shown when categories exist)
- Dropdown pre-fills with the task's current category
- Save button enabled if title OR category changed
- Separate optimistic-update handler `handleSetTaskCategory` in App — mirrors the title handler pattern
- `updateTaskCategory` added to `api.js`

**No server changes** — `PATCH /tasks/:id { category_id }` already existed.

**Status:** ✅ Implemented

---

## Testing Strategy

### Backend — Jest (`server/tests/`)
- `tasks.test.js` — PATCH status, PATCH title, POST task validation
- `categories.test.js` — full CRUD for categories, PATCH category_id on tasks, POST task with category_id

Run: `cd server && npm test`

### End-to-End — Playwright (`e2e/`)
- `kanban.spec.js` — create task, edit title, drag between columns, delete task
- `categories.spec.js` — category CRUD via UI, coloured dot, ring 0%/100%, filter, edit category, remove category

Run from project root: `npm run test:e2e`

### Test isolation
- Jest: `DB_PATH=:memory:` — every run gets a fresh in-memory SQLite database
- Playwright: each test creates a unique project via API in `beforeEach` and deletes it in `afterEach`; categories are tracked and deleted per-test
