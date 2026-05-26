# Project Tracker — Claude Code Instructions

This file is read automatically by Claude Code at the start of every session.

## Stack

| Layer | Tech | Port |
|-------|------|------|
| Frontend | React 19 + Vite | 5173 |
| Backend | Express 5 + better-sqlite3 | 3001 |
| Database | SQLite (`server/db.sqlite`) | — |
| Drag and drop | @hello-pangea/dnd | — |

## Running the project

```bash
# Backend
cd server && npm start

# Frontend (separate terminal)
cd client && npm run dev

# Backend tests
cd server && npm test

# E2E tests (both servers must be running)
npm run test:e2e
```

## Workflow — Spec-Driven Development (SDD)

All features follow this 6-phase cycle. Never write code without phase approval.

1. **Proposal** — goal, scope, what's out of scope
2. **Specification** — data model, API contract, UI behaviour
3. **Plan** — file-by-file implementation plan, risks
4. **Tasks** — numbered checklist
5. **Implementation** — write the code; include tests (see below)
6. **Verification** — manual checklist + automated test results

Small enhancements (< 5 files, no schema change) may skip to implementation with a one-paragraph summary instead of a full spec. Get confirmation first.

## Testing — always required

Every feature must ship with:

- **Jest** (`server/tests/<feature>.test.js`) — covers all new/changed API endpoints
- **Playwright** (`e2e/<feature>.spec.js`) — covers the happy path and key edge cases in the browser

Run both suites before marking implementation complete. Fix failures before reporting done.

Test isolation rules:
- Jest: `DB_PATH=:memory:` — fresh in-memory SQLite per run, no real data touched
- Playwright: each test creates a unique project via API in `beforeEach`, deletes it in `afterEach`; categories tracked and deleted per-test

## Coding standards

These standards apply to all new code. See `docs/standards.md` for rationale and links.

### React / Frontend

- **Components** — one component per file, PascalCase filename
- **State** — keep state as high as needed, no higher; local state preferred unless siblings need it
- **Props** — explicit named props, no spreading unknown props onto DOM elements
- **Side effects** — `useEffect` only for external sync (API, DOM listeners); never for derived state
- **Event handlers** — prefix with `handle` in parent (`handleDeleteTask`), `on` in props (`onDelete`)
- **Optimistic updates** — update local state first, call API, revert on error
- **No inline styles** except for dynamic values (e.g. `style={{ background: color }}`)
- **CSS** — CSS Modules (`Component.module.css`) for new components; existing global CSS (`App.css`) until migration is complete
- **No unnecessary comments** — name things clearly instead; only comment non-obvious constraints or workarounds

### Node.js / Backend

- **Routes** — one file per resource in `server/routes/`
- **Validation** — validate at the boundary (route handler); trust DB constraints for integrity
- **Error responses** — always `{ error: string }` with a meaningful HTTP status
- **Transactions** — use SQLite transactions for multi-table writes
- **No raw SQL strings in app logic** — all queries in route files, never in `db.js`
- **`db.js`** — only responsible for connection and schema bootstrap; no business logic

### API design (RESTful)

- **Nouns for paths** — `/tasks`, `/projects`, `/categories`
- **HTTP verbs for actions** — GET (read), POST (create), PATCH (partial update), DELETE (remove)
- **Status codes** — 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 409 Conflict, 500 Server Error
- **Partial updates** — `PATCH` accepts only the fields being changed; branching inside the handler is fine
- **Cascade deletes** — handled explicitly in a transaction (tasks before project) or via `ON DELETE SET NULL`/`CASCADE` in schema

### Known patterns in this codebase

- **dnd + keyboard events** — `@hello-pangea/dnd` intercepts Escape at capture phase. Use `document.addEventListener('keydown', handler, true)` inside a `useEffect` when editing, not `onKeyDown` on the element, to win the race.
- **DB migration** — new columns added with `ALTER TABLE ... ADD COLUMN` inside try/catch; silently skipped if column exists.
- **In-memory test DB** — `DB_PATH=:memory:` env var in `npm test`; `db.js` reads `process.env.DB_PATH`.
- **App export** — `server.js` exports `app` and only calls `.listen()` when `require.main === module`, so supertest can import it without starting a port.
