const request = require('supertest');
const app = require('../server');

describe('/categories', () => {
  let categoryId;

  test('GET returns an array', async () => {
    const res = await request(app).get('/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST creates with valid name and color', async () => {
    const res = await request(app)
      .post('/categories')
      .send({ name: 'Work', color: '#3498db' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Work');
    expect(res.body.color).toBe('#3498db');
    expect(res.body.id).toBeDefined();
    categoryId = res.body.id;
  });

  test('POST returns 409 on duplicate name', async () => {
    const res = await request(app)
      .post('/categories')
      .send({ name: 'Work', color: '#e74c3c' });
    expect(res.status).toBe(409);
  });

  test('POST returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/categories')
      .send({ color: '#3498db' });
    expect(res.status).toBe(400);
  });

  test('POST returns 400 when color is missing', async () => {
    const res = await request(app)
      .post('/categories')
      .send({ name: 'Health' });
    expect(res.status).toBe(400);
  });

  test('DELETE removes the category', async () => {
    const res = await request(app).delete(`/categories/${categoryId}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('DELETE returns 404 for non-existent id', async () => {
    const res = await request(app).delete('/categories/99999');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /tasks/:id — category_id', () => {
  let projectId;
  let taskId;
  let categoryId;

  beforeAll(async () => {
    const pRes = await request(app)
      .post('/projects')
      .send({ name: 'Category PATCH Project' });
    projectId = pRes.body.id;

    const tRes = await request(app)
      .post('/tasks')
      .send({ projectId, title: 'Task for category patch' });
    taskId = tRes.body.id;

    const cRes = await request(app)
      .post('/categories')
      .send({ name: 'Design', color: '#9b59b6' });
    categoryId = cRes.body.id;
  });

  test('assigns a category to a task', async () => {
    const res = await request(app)
      .patch(`/tasks/${taskId}`)
      .send({ category_id: categoryId });
    expect(res.status).toBe(200);
    expect(res.body.category_id).toBe(categoryId);
  });

  test('removes a category by passing null', async () => {
    const res = await request(app)
      .patch(`/tasks/${taskId}`)
      .send({ category_id: null });
    expect(res.status).toBe(200);
    expect(res.body.category_id).toBeNull();
  });

  test('POST /tasks with category_id saves it', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ projectId, title: 'Categorised from creation', category_id: categoryId });
    expect(res.status).toBe(201);
    expect(res.body.category_id).toBe(categoryId);
  });
});
