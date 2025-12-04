import { expect, test } from '@playwright/test'

test.describe('Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/')

    // Should redirect to login page
    await expect(page).toHaveURL('/login')

    // Fill in login form with demo credentials
    await page.fill('input[name="email"]', 'alice@example.com')
    await page.fill('input[name="password"]', 'demo123')

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to dashboard after login
    await expect(page).toHaveURL(/\/dashboard/)

    // Should see user name in sidebar (be more specific to avoid multiple matches)
    await expect(
      page.locator('[class*="text-sm font-medium"]', {
        hasText: 'Alice Johnson',
      }),
    ).toBeVisible()
  })

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill in login form with invalid credentials
    await page.fill('input[name="email"]', 'alice@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')

    // Submit form
    await page.click('button[type="submit"]')

    // Should stay on login page and show error
    await expect(page).toHaveURL('/login')
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'alice@example.com')
    await page.fill('input[name="password"]', 'demo123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/dashboard/)

    // Click sign out button
    await page.click('button:has-text("Sign out")')

    // Should redirect to login page
    await page.waitForURL('/login')
    await expect(page).toHaveURL('/login')
  })

  test('should protect dashboard route when not logged in', async ({
    page,
  }) => {
    await page.goto('/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })
})
