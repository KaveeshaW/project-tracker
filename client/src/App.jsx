import { useEffect, useState } from 'react';
import {
  getProjects, createProject,
  getTasks, createTask, updateTaskStatus, deleteTask,
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

  async function handleAddTask(title) {
    const task = await createTask(activeProjectId, title);
    setTasks((prev) => [...prev, task]);
  }

  async function handleDelete(id) {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
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
        />
      </header>
      <main>
        <AddTaskForm disabled={activeProjectId == null} onAdd={handleAddTask} />
        <KanbanBoard tasks={tasks} onDragEnd={handleDragEnd} onDelete={handleDelete} />
      </main>
    </div>
  );
}
