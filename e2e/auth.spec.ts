import { test, expect } from '@playwright/test';
import { AuthPage, Header } from './helpers/pages';

// Unique email per test run so re-runs don't fail with "already registered"
const TEST_EMAIL    = `user_${Date.now()}@test.com`;
const TEST_PASSWORD = 'password123';
const TEST_NAME     = 'Тест Пользователь';

test.describe('User registration and login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    });
  });

  test('shows login button in header when not authenticated', async ({ page }) => {
    await expect(page.locator('.btn-login')).toBeVisible();
    await expect(page.locator('.user-name')).not.toBeVisible();
  });

  test('navigates to login page from header', async ({ page }) => {
    await page.locator('.btn-login').click();
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h1')).toHaveText('Войти в аккаунт');
  });

  test('switches between login and register modes', async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.goto();

    await expect(page.locator('h1')).toHaveText('Войти в аккаунт');

    // Switch to register
    await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
    await expect(page.locator('h1')).toHaveText('Создать аккаунт');
    await expect(page.locator('input[type="text"]')).toBeVisible(); // name field

    // Switch back to login
    await page.getByRole('button', { name: 'Войти' }).click();
    await expect(page.locator('h1')).toHaveText('Войти в аккаунт');
  });

  test('registers a new user and redirects to home', async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.register(TEST_EMAIL, TEST_PASSWORD, TEST_NAME);
    await auth.waitForRedirect();

    // Header shows user name after registration
    await expect(page.locator('.user-name')).toBeVisible();
    await expect(page.locator('.btn-login')).not.toBeVisible();
  });

  test('shows error when registering duplicate email', async ({ page }) => {
    // Register once
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.register(TEST_EMAIL, TEST_PASSWORD, TEST_NAME);
    await auth.waitForRedirect();

    // Logout
    const header = new Header(page);
    await header.logout();

    // Try to register with same email
    await auth.goto();
    await auth.register(TEST_EMAIL, TEST_PASSWORD, 'Другое Имя');

    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText(/Email|already|зарегистр/i);
  });

  test('logs in with valid credentials', async ({ page }) => {
    // First register
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.register(TEST_EMAIL, TEST_PASSWORD, TEST_NAME);
    await auth.waitForRedirect();

    // Logout
    const header = new Header(page);
    await header.logout();
    await expect(page.locator('.btn-login')).toBeVisible();

    // Login
    await auth.goto();
    await auth.login(TEST_EMAIL, TEST_PASSWORD);
    await auth.waitForRedirect();

    await expect(page.locator('.user-name')).toBeVisible();
  });

  test('shows error on wrong password', async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.login('nonexistent@test.com', 'wrongpassword');

    await expect(page.locator('.error-message')).toBeVisible({ timeout: 6_000 });
  });

  test('logout clears session and shows login button', async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.register(TEST_EMAIL, TEST_PASSWORD, TEST_NAME);
    await auth.waitForRedirect();

    const header = new Header(page);
    await header.logout();

    await expect(page.locator('.btn-login')).toBeVisible();
    await expect(page.locator('.user-name')).not.toBeVisible();

    // Token removed from localStorage
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeNull();
  });
});
