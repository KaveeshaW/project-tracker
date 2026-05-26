const { test, expect } = require('@playwright/test');

const API = 'http://localhost:3001';

test.describe('Category features', () => {
  let projectId;
  const createdCategoryIds = [];

  test.beforeEach(async ({ page, request }) => {
    const res = await request.post(`${API}/projects`, {
      data: { name: `cat-e2e-${Date.now()}` },
    });
    const project = await res.json();
    projectId = project.id;

    await page.goto('/');
    await page.selectOption('select', String(projectId));
  });

  test.afterEach(async ({ request }) => {
    await request.delete(`${API}/projects/${projectId}`);
    for (const id of createdCategoryIds) {
      await request.delete(`${API}/categories/${id}`).catch(() => {});
    }
    createdCategoryIds.length = 0;
  });

  async function createCategoryViaApi(request, name, color = '#3498db') {
    const res = await request.post(`${API}/categories`, { data: { name, color } });
    const cat = await res.json();
    createdCategoryIds.push(cat.id);
    return cat;
  }

  // ─── Category Manager UI ─────────────────────────────────────────────────

  test('create a category via UI and see it as a chip', async ({ page, request }) => {
    // Use class selector to avoid matching the "New Project" button
    await page.locator('.category-toggle-btn').click();
    await page.fill('input[placeholder="Category name"]', 'Work');
    await page.locator('.swatch').first().click();
    await page.click('button[type="submit"]');

    await expect(page.locator('.category-chip', { hasText: 'Work' })).toBeVisible();

    // Track for cleanup
    const cats = await (await request.get(`${API}/categories`)).json();
    const cat = cats.find((c) => c.name === 'Work');
    if (cat) createdCategoryIds.push(cat.id);
  });

  test('shows error on duplicate category name', async ({ page, request }) => {
    const cat = await createCategoryViaApi(request, `Dup-${Date.now()}`);
    await page.reload();
    await page.selectOption('select', String(projectId));

    await page.locator('.category-toggle-btn').click();
    await page.fill('input[placeholder="Category name"]', cat.name);
    await page.click('button[type="submit"]');

    await expect(page.locator('.error')).toBeVisible();
  });

  test('deleting a category removes its chip', async ({ page, request }) => {
    const catName = `DeleteMe-${Date.now()}`;
    const cat = await createCategoryViaApi(request, catName);
    await page.reload();
    await page.selectOption('select', String(projectId));

    // Target the specific chip by name — avoids fragility from other existing categories
    const chip = page.locator('.category-chip', { hasText: catName });
    await expect(chip).toBeVisible();
    await chip.locator('.chip-delete').click();
    await expect(chip).not.toBeVisible();

    // Already deleted — remove from cleanup list so afterEach doesn't 404
    const idx = createdCategoryIds.indexOf(cat.id);
    if (idx !== -1) createdCategoryIds.splice(idx, 1);
  });

  // ─── Task with category ───────────────────────────────────────────────────

  test('task created with a category shows a coloured dot', async ({ page, request }) => {
    const cat = await createCategoryViaApi(request, `Dot-${Date.now()}`);
    await page.reload();
    await page.selectOption('select', String(projectId));

    await page.selectOption('.category-select', String(cat.id));
    await page.fill('input[placeholder="New task title"]', 'Dotted task');
    await page.click('button:has-text("Add Task")');

    await expect(page.locator('.task-cat-dot')).toBeVisible();
  });

  // ─── Progress ring ────────────────────────────────────────────────────────

  test('ring shows 0% with no done tasks', async ({ page, request }) => {
    const cat = await createCategoryViaApi(request, `Ring-${Date.now()}`);
    await request.post(`${API}/tasks`, {
      data: { projectId, title: 'Undone task', category_id: cat.id },
    });
    await page.reload();
    await page.selectOption('select', String(projectId));

    const card = page.locator('.category-card', { hasText: cat.name });
    await expect(card.locator('.ring-pct')).toContainText('0%');
  });

  test('ring updates to 100% when task dragged to Done', async ({ page, request }) => {
    const cat = await createCategoryViaApi(request, `Drag-${Date.now()}`);
    await request.post(`${API}/tasks`, {
      data: { projectId, title: 'Drag me', category_id: cat.id },
    });
    await page.reload();
    await page.selectOption('select', String(projectId));

    const card = page.locator('.column').nth(0).locator('.task-card').first();
    const doneList = page.locator('.column').nth(2).locator('.task-list');
    const from = await card.boundingBox();
    const to = await doneList.boundingBox();

    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2 - 5, { steps: 5 });
    await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 40 });
    await page.waitForTimeout(300);
    await page.mouse.up();

    // Wait for the card to land in the Done column before asserting the ring
    await expect(page.locator('.column').nth(2)).toContainText('Drag me');

    const ringCard = page.locator('.category-card', { hasText: cat.name });
    await expect(ringCard.locator('.ring-pct')).toContainText('100%');
  });

  // ─── Filter ───────────────────────────────────────────────────────────────

  test('clicking a ring filters the board; clicking again clears it', async ({ page, request }) => {
    const cat = await createCategoryViaApi(request, `Filter-${Date.now()}`);
    await request.post(`${API}/tasks`, {
      data: { projectId, title: 'In category', category_id: cat.id },
    });
    await request.post(`${API}/tasks`, {
      data: { projectId, title: 'No category' },
    });
    await page.reload();
    await page.selectOption('select', String(projectId));

    await expect(page.locator('.task-card')).toHaveCount(2);

    const ringCard = page.locator('.category-card', { hasText: cat.name });
    await ringCard.click();
    await expect(page.locator('.task-card')).toHaveCount(1);
    await expect(page.locator('.task-card').first()).toContainText('In category');

    await ringCard.click();
    await expect(page.locator('.task-card')).toHaveCount(2);
  });
});
