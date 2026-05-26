# Engineering Standards Reference

Standards applied in this project, with links to the source documents.

---

## React / JSX

**Reference:** [Airbnb React/JSX Style Guide](https://github.com/airbnb/javascript/tree/master/react)

Key rules we follow:
- One component per file
- PascalCase for component filenames and component names
- Prefer function components over class components
- Keep `useEffect` for side effects only — never for derived state (compute it inline instead)
- Props named `onX` in the component signature, handler named `handleX` in the parent
- Destructure props at the top of the component

---

## JavaScript

**Reference:** [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

Key rules:
- `const` by default, `let` only when reassignment is needed, never `var`
- Arrow functions for callbacks, named `function` declarations for component functions
- Template literals over string concatenation
- Explicit `===` comparisons
- No unused variables (enforced by ESLint)

---

## Node.js / Express

**Reference:** [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

Key rules:
- Structure by feature/resource, not by role — `routes/tasks.js`, not `controllers/tasks.js` + `models/tasks.js`
- Validate inputs at the route boundary; trust DB constraints for integrity rules
- Always return structured errors: `{ error: string }` with a meaningful HTTP status
- Use `try/catch` around DB calls; let the Express error middleware handle unexpected errors
- Never log sensitive data

---

## REST API Design

**Reference:** [RESTful API Design Guidelines](https://restfulapi.net)

Conventions:
- Resource names are plural nouns: `/tasks`, `/projects`, `/categories`
- HTTP method expresses the action — avoid verbs in URLs (`/tasks/delete/1` is wrong; `DELETE /tasks/1` is right)
- Status codes carry meaning — don't return 200 with `{ error: ... }` in the body
- `PATCH` for partial updates (send only changed fields), `PUT` for full replacement (not used here)
- Consistent error shape: `{ error: "human-readable message" }`

---

## Testing

**References:**
- [Jest docs](https://jestjs.io)
- [Playwright docs](https://playwright.dev)
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) (Kent C. Dodds)

Strategy:
- **Unit/integration tests (Jest + supertest)** — test API endpoints against a real in-memory SQLite database; no mocks
- **E2E tests (Playwright)** — test the full app in a real browser; use API fixtures to set up state, UI actions to exercise features, assertions on visible elements
- **What not to test** — implementation details, internal React state, CSS; test behaviour and outcomes instead

Test isolation:
- Each Jest test suite runs against an empty `:memory:` database
- Each Playwright test creates and cleans up its own data via the API

---

## Security

**Reference:** [OWASP Top 10](https://owasp.org/www-project-top-ten/)

For this project (local, single-user, no auth):
- Use parameterised queries — never interpolate user input into SQL strings (`db.prepare('... WHERE id = ?').run(id)` not `... WHERE id = ${id}`)
- Validate and trim all user-supplied strings at the route boundary before they reach the DB
- CORS restricted to `localhost:5173` only — not `*`

---

## CSS

**Reference:** [CSS Modules (Vite)](https://vitejs.dev/guide/features#css-modules)

Current state: global `App.css` (legacy). New components should use CSS Modules (`Component.module.css`). Migration of existing components is planned.

Rules for CSS Modules:
- One `.module.css` file per component, colocated in the same folder
- camelCase class names in the module file
- Import as `import styles from './Component.module.css'` and use `className={styles.wrapper}`
- Use `clsx` for conditional class combinations
