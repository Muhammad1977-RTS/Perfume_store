import { Page, expect } from '@playwright/test';

export class HomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
    await expect(this.page.locator('app-product-card').first()).toBeVisible({ timeout: 10_000 });
  }

  async addFirstProductToCart() {
    const card = this.page.locator('app-product-card').first();
    const name = await card.locator('h3').innerText();
    await card.getByRole('button', { name: 'Добавить в корзину' }).click();
    return name;
  }
}

export class CartPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/cart');
  }

  async goToCheckout() {
    await this.page.getByRole('link', { name: /оформить|checkout/i }).click();
  }
}

export class CheckoutPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/checkout');
  }

  async fillGuest(opts: { email?: string; name: string; phone: string; address: string }) {
    if (opts.email) {
      await this.page.getByLabel(/email/i).fill(opts.email);
    }
    await this.page.locator('input[name="name"]').fill(opts.name);
    await this.page.locator('input[name="phone"]').fill(opts.phone);
    await this.page.locator('textarea[name="address"]').fill(opts.address);
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Отправить заказ' }).click();
  }

  async waitForSuccess() {
    await expect(this.page.locator('.success-message')).toBeVisible({ timeout: 10_000 });
  }

  async waitForRegisterPrompt() {
    await expect(this.page.locator('.register-prompt-overlay')).toBeVisible({ timeout: 6_000 });
  }

  isGuestEmailVisible() {
    return this.page.locator('input[name="guestEmail"]').isVisible();
  }
}

export class AuthPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async register(email: string, password: string, name: string) {
    await this.page.getByRole('button', { name: 'Зарегистрироваться' }).first().click();
    await this.page.locator('input[type="text"]').fill(name);
    await this.page.locator('input[type="email"]').fill(email);
    await this.page.locator('input[type="password"]').fill(password);
    await this.page.getByRole('button', { name: 'Зарегистрироваться' }).last().click();
  }

  async login(email: string, password: string) {
    await this.page.locator('input[type="email"]').fill(email);
    await this.page.locator('input[type="password"]').fill(password);
    await this.page.getByRole('button', { name: 'Войти' }).click();
  }

  async waitForRedirect() {
    await this.page.waitForURL('/', { timeout: 8_000 });
  }
}

export class Header {
  constructor(private page: Page) {}

  async clickLogin() {
    await this.page.locator('.btn-login').click();
  }

  async logout() {
    await this.page.locator('.btn-logout').click();
  }

  isLoggedIn() {
    return this.page.locator('.user-name').isVisible();
  }

  userName() {
    return this.page.locator('.user-name').innerText();
  }
}
