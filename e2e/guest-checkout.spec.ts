import { test, expect } from '@playwright/test';
import { HomePage, CheckoutPage, Header } from './helpers/pages';

test.describe('Guest checkout', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart state between tests
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('cart'));
  });

  test('adds product to cart and sees cart badge update', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const badge = page.locator('.cart-link strong');
    await expect(badge).toHaveText('0');

    await home.addFirstProductToCart();
    await expect(badge).toHaveText('1');
  });

  test('completes guest checkout without email', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.addFirstProductToCart();

    const checkout = new CheckoutPage(page);
    await checkout.goto();

    // Guest email field must be visible (user not logged in)
    await expect(page.locator('input[name="guestEmail"]')).toBeVisible();

    await checkout.fillGuest({
      name:    'Иван Тест',
      phone:   '+7 900 000 00 00',
      address: 'г. Москва, ул. Тестовая, д. 1',
    });

    await checkout.submit();
    await checkout.waitForSuccess();
    await expect(page.locator('.success-message')).toContainText('успешно');
  });

  test('completes guest checkout with email and sees register prompt', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.addFirstProductToCart();

    const checkout = new CheckoutPage(page);
    await checkout.goto();

    const uniqueEmail = `guest_${Date.now()}@test.com`;
    await checkout.fillGuest({
      email:   uniqueEmail,
      name:    'Гость Тестов',
      phone:   '+7 911 111 11 11',
      address: 'г. Казань, ул. Пушкина, д. 5',
    });

    await checkout.submit();
    await checkout.waitForSuccess();

    // After guest order with email — register prompt must appear
    await checkout.waitForRegisterPrompt();
    await expect(page.locator('.register-prompt h2')).toHaveText('Сохранить данные?');

    // Dismiss the prompt
    await page.getByRole('button', { name: 'Нет, спасибо' }).click();
    await expect(page.locator('.register-prompt-overlay')).not.toBeVisible();
  });

  test('register after guest order via prompt', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.addFirstProductToCart();

    const checkout = new CheckoutPage(page);
    await checkout.goto();

    const uniqueEmail = `prompt_${Date.now()}@test.com`;
    await checkout.fillGuest({
      email:   uniqueEmail,
      name:    'Промпт Тестов',
      phone:   '+7 922 222 22 22',
      address: 'г. Новосибирск, пр. Ленина, д. 10',
    });

    await checkout.submit();
    await checkout.waitForSuccess();
    await checkout.waitForRegisterPrompt();

    await page.locator('input[type="password"]').last().fill('secret123');
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();

    await expect(page.locator('.success-message').last()).toBeVisible({ timeout: 8_000 });
  });
});
