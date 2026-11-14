import { test, expect } from '@playwright/test';

async function open(page) {
  await page.locator('mat-select').click();
  await page.getByRole('listbox').waitFor();
  await page.getByRole('listbox').evaluate(async (element) => {
    await Promise.all(
      element
        .getAnimations({ subtree: true })
        .map((animation) => animation.finished.catch(() => {})),
    );
  });
}
async function scroll(page) {
  await page.getByRole('listbox').evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    element.dispatchEvent(new Event('scroll'));
  });
}

for (const mode of ['module', 'standalone']) {
  test.describe(mode, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/?mode=${mode}`);
      await expect(page.locator('main')).toHaveAttribute('data-loaded', '10');
    });

    test('pages, guards requests, selects, and reopens', async ({ page }) => {
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await open(page);
      for (let loaded = 10; loaded < 50; loaded += 10) {
        await scroll(page);
        await expect(page.getByRole('option')).toHaveCount(loaded + 10);
      }
      await expect(page.locator('main')).toHaveAttribute('data-complete', 'true');
      await scroll(page);
      await page.waitForTimeout(250);
      await expect(page.locator('main')).toHaveAttribute('data-requests', '5');
      await page.getByRole('option', { name: 'Customer 49', exact: true }).click();
      await expect(page.locator('mat-select')).toContainText('Customer 49');
      await expect(page.getByRole('listbox')).toHaveCount(0);
      await open(page);
      await expect(page.getByRole('option', { name: 'Customer 49', exact: true })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(errors).toEqual([]);
    });

    test('known limitation: complete changed while open does not suppress output', async ({
      page,
    }) => {
      test.fail(true, 'V5 captures complete on opening; the host request guard is required.');
      await page.getByRole('button', { name: 'Complete while open' }).click();
      await open(page);
      await expect(page.locator('main')).toHaveAttribute('data-complete', 'true');
      await scroll(page);
      await page.waitForTimeout(250);
      await expect(page.locator('main')).toHaveAttribute('data-events', '0');
    });

    test('known limitation: closing does not cancel a pending scroll', async ({ page }) => {
      test.fail(true, 'V5 only tears down scroll listeners on directive destruction.');
      await open(page);
      await scroll(page);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      await expect(page.locator('main')).toHaveAttribute('data-events', '0');
    });
  });
}
