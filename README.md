# Project Tracker

A single-user Kanban board for tracking tasks across projects. Built with React + Vite (frontend) and Express + SQLite (backend).

Built using **Spec-Driven Development (SDD)** — see [docs/spec.md](docs/spec.md) for the full Proposal, Specification, Plan, and Task breakdown.

## Running

You need two terminals.

**Terminal 1 — Backend**
```bash
cd server
npm install
npm start
```
Runs on http://localhost:3001

**Terminal 2 — Frontend**
```bash
cd client
npm install
npm run dev
```
Runs on http://localhost:5173

Open http://localhost:5173 in your browser.

## Features

- Create and switch between projects
- Add tasks to a project
- Drag tasks between To Do, In Progress, and Done columns
- Delete tasks
- Data persists across page refreshes (SQLite)

## Project Structure

```
project_tracker/
├── server/
│   ├── db.js              # SQLite setup
│   ├── routes/
│   │   ├── projects.js    # GET/POST /projects
│   │   └── tasks.js       # GET/POST/PATCH/DELETE /tasks
│   └── server.js          # Express app (port 3001)
├── client/
│   └── src/
│       ├── api.js          # Fetch wrappers
│       ├── App.jsx         # Root component and state
│       └── components/
│           ├── ProjectSelector.jsx
│           ├── KanbanBoard.jsx
│           ├── Column.jsx
│           ├── TaskCard.jsx
│           └── AddTaskForm.jsx
└── docs/
    └── spec.md            # SDD phases 1–4
```
