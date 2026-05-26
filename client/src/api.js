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
export const createTask = (projectId, title, categoryId = null) =>
  request('/tasks', { method: 'POST', body: JSON.stringify({ projectId, title, category_id: categoryId }) });
export const updateTaskStatus = (id, status) =>
  request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const updateTaskTitle = (id, title) =>
  request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ title }) });
export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' });

export const getCategories = () => request('/categories');
export const createCategory = (name, color) =>
  request('/categories', { method: 'POST', body: JSON.stringify({ name, color }) });
export const deleteCategory = (id) => request(`/categories/${id}`, { method: 'DELETE' });
