import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

// Helper to login
async function login(page: Page) {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'alice@example.com')
  await page.fill('input[name="password"]', 'demo123')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/dashboard/)
}

test.describe('Task Management', () => {
  // Run tests serially to avoid database conflicts
  test.describe.configure({ mode: 'serial' })

  test('should display tasks on dashboard', async ({ page }) => {
    await login(page)

    // Wait for tasks to load
    await page.waitForSelector('[class*="rounded-lg border"]', {
      timeout: 10000,
    })

    // Should have at least one task from seed data
    const taskCount = await page.locator('[class*="rounded-lg border"]').count()
    expect(taskCount).toBeGreaterThan(0)
  })

  test('should create a new task', async ({ page }) => {
    await login(page)

    // Wait for page to load
    await page.waitForSelector('button:has-text("Add Task")')

    // Get initial task count
    const initialCount = await page
      .locator('[class*="rounded-lg border"]')
      .count()

    // Open create task form
    await page.click('button:has-text("Add Task")')

    // Generate unique task name
    const uniqueTitle = `E2E Test ${Date.now()}`

    // Fill in task details
    await page.fill('input[name="title"]', uniqueTitle)
    await page.fill('textarea[name="description"]', 'Created by Playwright')
    await page.selectOption('select[name="priority"]', 'high')

    // Submit form
    await page.click('button[type="submit"]:has-text("Create")')

    // Wait for task to appear
    await page.waitForSelector(`text=${uniqueTitle}`, { timeout: 5000 })

    // Should have one more task
    const newCount = await page.locator('[class*="rounded-lg border"]').count()
    expect(newCount).toBe(initialCount + 1)
  })
})
