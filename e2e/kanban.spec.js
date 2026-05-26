const { test, expect } = require('@playwright/test');

const API = 'http://localhost:3001';

test.describe('Kanban board', () => {
  let projectId;

  test.beforeEach(async ({ page, request }) => {
    // Create a fresh isolated project for this test
    const res = await request.post(`${API}/projects`, {
      data: { name: `e2e-${Date.now()}` },
    });
    const project = await res.json();
    projectId = project.id;

    await page.goto('/');
    // Explicitly select the test project from the dropdown
    await page.selectOption('select', String(projectId));
  });

  test.afterEach(async ({ request }) => {
    // Delete the project — cascades to all its tasks
    await request.delete(`${API}/projects/${projectId}`);
  });

  // ─── Create task ──────────────────────────────────────────────────────────

  test('creating a task shows it in the To Do column', async ({ page }) => {
    await page.fill('input[placeholder="New task title"]', 'My new task');
    await page.click('button:has-text("Add Task")');

    const todoColumn = page.locator('.column').nth(0);
    await expect(todoColumn).toContainText('My new task');
  });

  // ─── Edit task ────────────────────────────────────────────────────────────

  test('editing a task title updates the card', async ({ page, request }) => {
    await request.post(`${API}/tasks`, {
      data: { projectId, title: 'Original title' },
    });
    await page.reload();
    await page.selectOption('select', String(projectId));

    await page.locator('.edit-btn').first().click();
    await page.locator('.task-edit-input').fill('Updated title');
    await page.keyboard.press('Enter');

    await expect(page.locator('.task-card').first()).toContainText('Updated title');
  });

  test('pressing Escape in edit mode cancels without saving', async ({ page, request }) => {
    await request.post(`${API}/tasks`, {
      data: { projectId, title: 'Original title' },
    });
    await page.reload();
    await page.selectOption('select', String(projectId));

    await page.locator('.edit-btn').first().click();
    await page.locator('.task-edit-input').fill('Changed title');
    await page.keyboard.press('Escape');

    // Card should still show original title, not be in edit mode
    await expect(page.locator('.task-card').first()).toContainText('Original title');
    await expect(page.locator('.task-edit-input')).toHaveCount(0);
  });

  // ─── Drag task ────────────────────────────────────────────────────────────

  test('dragging a task from To Do to In Progress moves it', async ({ page, request }) => {
    await request.post(`${API}/tasks`, {
      data: { projectId, title: 'Task to drag' },
    });
    await page.reload();
    await page.selectOption('select', String(projectId));

    const card = page.locator('.column').nth(0).locator('.task-card').first();
    const target = page.locator('.column').nth(1).locator('.task-list');

    const from = await card.boundingBox();
    const to = await target.boundingBox();

    // Gradual mouse movement so the dnd library detects the drag gesture
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2 - 5, { steps: 5 });
    await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 20 });
    await page.waitForTimeout(100);
    await page.mouse.up();

    await expect(page.locator('.column').nth(1)).toContainText('Task to drag');
  });

  // ─── Delete task ──────────────────────────────────────────────────────────

  test('deleting a task removes it from the board', async ({ page, request }) => {
    await request.post(`${API}/tasks`, {
      data: { projectId, title: 'Task to delete' },
    });
    await page.reload();
    await page.selectOption('select', String(projectId));

    await expect(page.locator('.task-card')).toContainText('Task to delete');

    await page.locator('.delete-btn').first().click();

    await expect(page.locator('.task-card')).toHaveCount(0);
  });
});
