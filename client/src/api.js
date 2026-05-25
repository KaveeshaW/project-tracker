const BASE = 'http://localhost:3001';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const getProjects = () => request('/projects');
export const createProject = (name) =>
  request('/projects', { method: 'POST', body: JSON.stringify({ name }) });
export const deleteProject = (id) => request(`/projects/${id}`, { method: 'DELETE' });

export const getTasks = (projectId) => request(`/tasks?projectId=${projectId}`);
export const createTask = (projectId, title) =>
  request('/tasks', { method: 'POST', body: JSON.stringify({ projectId, title }) });
export const updateTaskStatus = (id, status) =>
  request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' });
