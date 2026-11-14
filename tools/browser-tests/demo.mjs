/**
 * Check the production demo's paging, search, selection, and retry UI.
 * Usage from the repository root: node tools/browser-tests/demo.mjs (Node 24.15).
 * Requires npm run build:example. Serves projects/example/dist/browser under
 * the GitHub Pages path on a loopback port, using Chrome or CI's Chromium.
 * Prints the result and saves artifacts/demo.png; the browser/server are closed.
 */
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';

const dist = resolve('projects/example/dist/browser');
const basePath = '/ng-mat-select-infinite-scroll/';
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    if (!pathname.startsWith(basePath)) {
      response.writeHead(404).end();
      return;
    }
    const file = resolve(dist, pathname.slice(basePath.length) || 'index.html');
    if (!file.startsWith(dist + sep)) {
      response.writeHead(403).end();
      return;
    }
    response.setHeader(
      'Content-Type',
      {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.ico': 'image/x-icon',
      }[extname(file)] || 'application/octet-stream',
    );
    response.end(await readFile(file));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({
  channel: process.env.CI ? undefined : 'chrome',
  headless: true,
});
try {
  const page = await browser.newPage({ viewport: { width: 1100, height: 950 } });
  const errors = [];
  /** Let Material's opening animation settle before interacting with options. */
  const open = async () => {
    await page.locator('mat-select').click();
    await page.getByRole('option').first().waitFor();
    await page.getByRole('listbox').evaluate(async (element) => {
      await Promise.all(
        element
          .getAnimations({ subtree: true })
          .map((animation) => animation.finished.catch(() => {})),
      );
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
  };
  /** Wait for panel removal so the next action cannot target a closing overlay. */
  const close = async () => {
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('[role="listbox"]'));
  };
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}${basePath}`);
  // Load a second page and select a record before changing the query.
  await page.getByText('20 of 1000 loaded', { exact: false }).waitFor();
  await open();
  await page.getByRole('option').first().waitFor();
  await page.getByRole('listbox').evaluate(async (element) => {
    await Promise.all(
      element
        .getAnimations({ subtree: true })
        .map((animation) => animation.finished.catch(() => {})),
    );
    element.scrollTop = element.scrollHeight;
    element.dispatchEvent(new Event('scroll'));
  });
  const progress = page.getByRole('progressbar', { name: 'Loading customers' });
  await progress.waitFor();
  const progressBounds = await progress.boundingBox();
  const panelBounds = await page.getByRole('listbox').boundingBox();
  assert.ok(
    progressBounds.y + progressBounds.height <= panelBounds.y,
    'panel must not cover loading',
  );
  await page.getByText('40 of 1000 loaded', { exact: false }).waitFor();
  await page.getByRole('option', { name: 'Customer 0001', exact: true }).click();
  await close();
  // Filtering and clearing a query must retain both selected records.
  await page.getByLabel('Find a customer').fill('1000');
  await page.getByText('1 of 1 loaded', { exact: false }).waitFor();
  await open();
  await page.getByRole('option', { name: 'Customer 1000', exact: true }).click();
  await close();
  await page.getByText('2 selected', { exact: false }).waitFor();
  await page.getByLabel('Find a customer').fill('No matching customer');
  await page.getByText('0 of 0 loaded', { exact: false }).waitFor();
  await page
    .getByRole('status')
    .filter({ hasText: 'All matching customers are loaded.' })
    .waitFor();
  await page.getByLabel('Find a customer').fill('');
  await page.getByText('20 of 1000 loaded', { exact: false }).waitFor();
  // A failed request should expose a retry action and keep the page offset.
  await page.getByLabel('Fail the next request').check();
  await open();
  await page.getByRole('listbox').evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    element.dispatchEvent(new Event('scroll'));
  });
  await page.getByRole('status').filter({ hasText: 'failed' }).waitFor();
  await close();
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await page.getByText('40 of 1000 loaded', { exact: false }).waitFor();
  // The optional search component supplies the input; this app resets/cancels
  // queries, while msInfiniteScroll continues to request the filtered pages.
  await page.getByRole('button', { name: 'ngx-mat-select-search', exact: true }).click();
  await page.getByText('20 of 1000 loaded', { exact: false }).waitFor();
  await open();
  const search = page.getByLabel('Find a customer');
  // The search option is aria-disabled to prevent selection, but its native
  // input is editable. Use the same focused keyboard input as a user.
  const setQuery = async (value) => {
    await search.press('ControlOrMeta+A');
    await search.pressSequentially(value);
  };
  await setQuery('00');
  await page.getByRole('progressbar', { name: 'Loading customers' }).waitFor();
  await page.waitForFunction(() =>
    document.querySelector('mat-hint')?.textContent.includes('20 of'),
  );
  await page.getByRole('listbox').evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    element.dispatchEvent(new Event('scroll'));
  });
  await page.getByText('40 of', { exact: false }).waitFor();
  await page.getByRole('option', { name: 'Customer 0021', exact: true }).click();
  await setQuery('09');
  await page.getByRole('progressbar', { name: 'Loading customers' }).waitFor();
  await setQuery('1000');
  await page.getByText('1 of 1 loaded', { exact: false }).waitFor();
  await page.getByRole('option', { name: 'Customer 1000', exact: true }).waitFor();
  assert.equal(await page.getByRole('option', { name: 'Customer 0901', exact: true }).count(), 0);
  await close();
  await page.getByText('3 selected', { exact: false }).waitFor();
  await open();
  assert.deepEqual(errors, []);
  await mkdir('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/demo.png', fullPage: true });
  console.log(
    'Demo passed under the Pages path: paging, loading, search/reset, empty results, selection retention, failure/retry, and ngx-mat-select-search integration.',
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
