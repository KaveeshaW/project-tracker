import { useEffect, useState } from 'react';
import {
  getProjects, createProject, deleteProject,
  getTasks, createTask, updateTaskStatus, updateTaskTitle, deleteTask,
} from './api';
import ProjectSelector from './components/ProjectSelector';
import KanbanBoard from './components/KanbanBoard';
import AddTaskForm from './components/AddTaskForm';
import './App.css';

export default function App() {
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    getProjects().then((data) => {
      setProjects(data);
      if (data.length > 0) setActiveProjectId(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (activeProjectId == null) return;
    getTasks(activeProjectId).then(setTasks);
  }, [activeProjectId]);

  async function handleCreateProject(name) {
    const project = await createProject(name);
    setProjects((prev) => [project, ...prev]);
    setActiveProjectId(project.id);
  }

  async function handleDeleteProject(id) {
    await deleteProject(id);
    const remaining = projects.filter((p) => p.id !== id);
    setProjects(remaining);
    if (remaining.length > 0) {
      setActiveProjectId(remaining[0].id);
    } else {
      setActiveProjectId(null);
      setTasks([]);
    }
  }

  async function handleAddTask(title) {
    const task = await createTask(activeProjectId, title);
    setTasks((prev) => [...prev, task]);
  }

  async function handleDelete(id) {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleEditTask(id, title) {
    const original = tasks.find((t) => t.id === id)?.title;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)));
    try {
      await updateTaskTitle(id, title);
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, title: original } : t)));
    }
  }

  async function handleDragEnd(result) {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId;
    const taskId = Number(draggableId);

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTaskStatus(taskId, newStatus);
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: source.droppableId } : t))
      );
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Project Tracker</h1>
        <ProjectSelector
          projects={projects}
          activeProjectId={activeProjectId}
          onSelect={setActiveProjectId}
          onCreate={handleCreateProject}
          onDelete={handleDeleteProject}
        />
      </header>
      <main>
        <AddTaskForm disabled={activeProjectId == null} onAdd={handleAddTask} />
        {activeProjectId == null ? (
          <p className="empty-state">No project selected. Create one above to get started.</p>
        ) : (
          <KanbanBoard tasks={tasks} onDragEnd={handleDragEnd} onDelete={handleDelete} onEdit={handleEditTask} />
        )}
      </main>
    </div>
  );
}
