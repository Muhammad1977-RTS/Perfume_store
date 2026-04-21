import { test, expect } from '@playwright/test';
import { HomePage, CheckoutPage, AuthPage, Header } from './helpers/pages';

const AUTH_EMAIL    = `auth_checkout_${Date.now()}@test.com`;
const AUTH_PASSWORD = 'password123';
const AUTH_NAME     = 'Авторизованный Покупатель';

test.describe('Authorized user checkout', () => {
  // Register once before all tests in this suite
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.register(AUTH_EMAIL, AUTH_PASSWORD, AUTH_NAME);
    await page.waitForURL('/');
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    // Clear cart, then log in
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('cart'));

    // Restore session by logging in via UI
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.login(AUTH_EMAIL, AUTH_PASSWORD);
    await auth.waitForRedirect();
  });

  test('header shows user name after login', async ({ page }) => {
    await expect(page.locator('.user-name')).toBeVisible();
    const name = await page.locator('.user-name').innerText();
    expect(name.length).toBeGreaterThan(0);
  });

  test('checkout hides guest email field for logged-in user', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.addFirstProductToCart();

    const checkout = new CheckoutPage(page);
    await checkout.goto();

    // Guest email field must NOT be visible
    await expect(page.locator('input[name="guestEmail"]')).not.toBeVisible();
    // Shows logged-in email in the description
    await expect(page.locator('.checkout-head p strong')).toContainText(AUTH_EMAIL);
  });

  test('authorized user completes checkout without register prompt', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.addFirstProductToCart();

    const checkout = new CheckoutPage(page);
    await checkout.goto();

    await page.locator('input[name="name"]').fill('Авторизованный Тест');
    await page.locator('input[name="phone"]').fill('+7 933 333 33 33');
    await page.locator('textarea[name="address"]').fill('г. Санкт-Петербург, Невский пр., д. 20');

    await checkout.submit();
    await checkout.waitForSuccess();
    await expect(page.locator('.success-message')).toContainText('успешно');

    // No register prompt for authorized users
    await expect(page.locator('.register-prompt-overlay')).not.toBeVisible();
  });

  test('cart badge resets to 0 after successful order', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.addFirstProductToCart();

    const badge = page.locator('.cart-link strong');
    await expect(badge).toHaveText('1');

    const checkout = new CheckoutPage(page);
    await checkout.goto();

    await page.locator('input[name="name"]').fill('Тест Очистка');
    await page.locator('input[name="phone"]').fill('+7 944 444 44 44');
    await page.locator('textarea[name="address"]').fill('г. Екатеринбург, ул. Ленина, д. 15');

    await checkout.submit();
    await checkout.waitForSuccess();

    // Cart is cleared after order
    await expect(badge).toHaveText('0');
  });

  test('session persists on page reload', async ({ page }) => {
    await page.reload();
    // After reload, still logged in (token in localStorage)
    await expect(page.locator('.user-name')).toBeVisible();
    await expect(page.locator('.btn-login')).not.toBeVisible();
  });
});
