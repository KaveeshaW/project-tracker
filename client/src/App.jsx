import { useEffect, useState } from 'react';
import {
  getProjects, createProject, deleteProject,
  getTasks, createTask, updateTaskStatus, updateTaskTitle, deleteTask,
  getCategories, createCategory, deleteCategory, updateTaskCategory,
} from './api';
import ProjectSelector from './components/ProjectSelector';
import KanbanBoard from './components/KanbanBoard';
import AddTaskForm from './components/AddTaskForm';
import CategoryManager from './components/CategoryManager';
import CategoryStrip from './components/CategoryStrip';
import './App.css';

export default function App() {
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);

  useEffect(() => {
    getProjects().then((data) => {
      setProjects(data);
      if (data.length > 0) setActiveProjectId(data[0].id);
    });
    getCategories().then(setCategories);
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

  async function handleAddTask(title, categoryId) {
    const task = await createTask(activeProjectId, title, categoryId);
    setTasks((prev) => [...prev, task]);
  }

  async function handleCreateCategory(name, color) {
    const category = await createCategory(name, color);
    setCategories((prev) => [category, ...prev]);
  }

  async function handleDeleteCategory(id) {
    await deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setTasks((prev) => prev.map((t) => t.category_id === id ? { ...t, category_id: null } : t));
    if (activeFilter === id) setActiveFilter(null);
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

  async function handleSetTaskCategory(id, categoryId) {
    const original = tasks.find((t) => t.id === id)?.category_id;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, category_id: categoryId } : t)));
    try {
      await updateTaskCategory(id, categoryId);
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, category_id: original } : t)));
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
        <CategoryManager
          categories={categories}
          onCreate={handleCreateCategory}
          onDelete={handleDeleteCategory}
        />
        <AddTaskForm
          disabled={activeProjectId == null}
          onAdd={handleAddTask}
          categories={categories}
        />
        {activeProjectId == null ? (
          <p className="empty-state">No project selected. Create one above to get started.</p>
        ) : (
          <>
            <KanbanBoard
              tasks={tasks}
              onDragEnd={handleDragEnd}
              onDelete={handleDelete}
              onEdit={handleEditTask}
              onSetCategory={handleSetTaskCategory}
              activeFilter={activeFilter}
              categories={categories}
            />
            <CategoryStrip
              categories={categories}
              tasks={tasks}
              activeFilter={activeFilter}
              onFilterChange={(id) => setActiveFilter((prev) => (prev === id ? null : id))}
            />
          </>
        )}
      </main>
    </div>
  );
}
