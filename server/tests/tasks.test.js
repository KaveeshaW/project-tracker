const request = require('supertest');
const app = require('../server');

let taskId;

beforeAll(async () => {
  // Create a project and a task to use across all tests
  const projectRes = await request(app)
    .post('/projects')
    .send({ name: 'Test Project' });
  const projectId = projectRes.body.id;

  const taskRes = await request(app)
    .post('/tasks')
    .send({ projectId, title: 'Original title' });
  taskId = taskRes.body.id;
});

describe('PATCH /tasks/:id — title update', () => {
  test('returns the updated task when given a valid title', async () => {
    const res = await request(app)
      .patch(`/tasks/${taskId}`)
      .send({ title: 'New name' });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(taskId);
    expect(res.body.title).toBe('New name');
  });

  test('returns 400 when title is an empty string', async () => {
    const res = await request(app)
      .patch(`/tasks/${taskId}`)
      .send({ title: '' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/non-empty/);
  });

  test('returns 400 when title is only whitespace', async () => {
    const res = await request(app)
      .patch(`/tasks/${taskId}`)
      .send({ title: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/non-empty/);
  });
});

describe('PATCH /tasks/:id — status update (regression)', () => {
  test('returns the updated task when given a valid status', async () => {
    const res = await request(app)
      .patch(`/tasks/${taskId}`)
      .send({ status: 'done' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('done');
  });

  test('returns 400 when status is invalid', async () => {
    const res = await request(app)
      .patch(`/tasks/${taskId}`)
      .send({ status: 'invalid-status' });

    expect(res.status).toBe(400);
  });
});
