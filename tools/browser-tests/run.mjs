/**
 * Exercise a built compatibility consumer in a real headless browser.
 * Usage from the repository root: node tools/browser-tests/run.mjs <major> [--minimum].
 * Run with Node 24.15 after check-compatibility.mjs. The fixture's controls and
 * counters are defined in compat/template/main.ts. A local HTTP server serves
 * its dist/ directory; Chrome is used locally and Playwright Chromium in CI.
 * Success writes artifacts/browser-<major>[-minimum].json with the tarball hash.
 * Keyboard checks assert the active option, the next Arrow Down step, and selection.
 */
import { chromium, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const major = Number(process.argv[2]);
const minimum = process.argv.includes('--minimum');
const dist = join(root, 'compat', `angular-${major}${minimum ? '-minimum' : ''}`, 'dist');
// Bind an ephemeral loopback port and serve only this fixture's built assets.
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = resolve(dist, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(dist + sep)) {
      response.writeHead(403).end();
      return;
    }
    const mime = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
    };
    response.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream');
    response.end(await readFile(file));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
let browser;
let currentPage;
const results = [];
let angularVersion;
try {
  browser = await chromium.launch({
    channel: process.env.CI ? undefined : 'chrome',
    headless: true,
  });
  const modes = ['module', 'standalone', ...(major >= 21 ? ['standalone&zoneless=1'] : [])];
  for (const mode of modes) {
    const page = await browser.newPage();
    currentPage = page;
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const url = `http://127.0.0.1:${server.address().port}/?mode=${mode}`;
    const count = async (id) => Number(await page.getByTestId(id).textContent());
    const waitCount = async (id, n) =>
      page.waitForFunction(
        ({ id, n }) => Number(document.querySelector(`[data-testid="${id}"]`)?.textContent) === n,
        { id, n },
      );
    /** Change fixture inputs while the overlay is open, without clicking through it. */
    const control = async (id) => {
      const wasPaused = id === 'pause' ? await page.getByTestId('paused').textContent() : undefined;
      await page.getByTestId(id).evaluate((element) => element.click());
      if (id === 'pause')
        await page.waitForFunction(
          (previous) => document.querySelector('[data-testid="paused"]')?.textContent !== previous,
          wasPaused,
        );
    };
    /** Simulate a bottom scroll and return the viewport anchor before options append. */
    const scroll = async () =>
      page.getByRole('listbox').evaluate((element) => {
        element.scrollTop = element.scrollHeight;
        element.dispatchEvent(new Event('scroll'));
        return element.scrollTop;
      });
    /** Wait for overlay removal so reopening cannot target the old panel. */
    const close = async () => {
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => !document.querySelector('[role="listbox"]'));
    };
    /** Wait for Material animations and layout before measuring scroll geometry. */
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
    await page.goto(url);
    await page.getByTestId('angular').waitFor();
    angularVersion = (await page.getByTestId('angular').textContent()).trim();
    assert.equal(
      Number(angularVersion.split('.')[0]),
      major,
      'runtime must use the fixture Angular major',
    );

    // Paging, live loading/completion inputs, and listener cleanup on reopen.
    await open();
    assert.equal(await page.getByRole('option').count(), 20);
    const anchor = await scroll();
    await waitCount('count', 40);
    assert.equal(await count('requests'), 1);
    assert.equal(await count('emissions'), 1);
    // Material must not pull the viewport back to the selected first item on append.
    assert.ok(
      Math.abs(
        (await page.getByRole('listbox').evaluate((element) => element.scrollTop)) - anchor,
      ) <= 1,
      'append preserves scroll position',
    );
    await control('pause');
    await scroll();
    await page.waitForTimeout(80);
    assert.equal(await count('emissions'), 1, 'loading suppresses outputs');
    await control('pause');
    await waitCount('count', 60);
    const completedEmissions = await count('emissions');
    await scroll();
    await page.waitForTimeout(80);
    assert.equal(await count('emissions'), completedEmissions, 'live complete suppresses outputs');
    await close();
    for (let i = 0; i < 3; i++) {
      await open();
      await close();
    }
    assert.equal(
      await count('emissions'),
      completedEmissions,
      'reopening does not duplicate outputs',
    );

    // A last-item preselection should load another page without a user scroll.
    await page.goto(url + '&selected=19');
    await open();
    await waitCount('count', 40); // Opening on a selected last item needs no new scroll.
    assert.equal(await count('selection'), 19);
    await close();

    // Replay the repeated-selection sequence reported in issue #16.
    await page.goto(url + '&initial=10&page=10');
    for (const option of [4, 6, 8]) {
      await open();
      await page.getByRole('option', { name: `Option ${option}`, exact: true }).click();
      await page.waitForFunction(() => !document.querySelector('[role="listbox"]'));
    }
    await open();
    await scroll();
    await page.waitForFunction(
      () => Number(document.querySelector('[data-testid="count"]')?.textContent) >= 20,
    );
    await close();

    // Option density and group headers must not require a hard-coded item height.
    await page.goto(url + '&threshold=0px');
    await page.addStyleTag({
      content: '.mat-mdc-option { min-height: 32px !important; line-height: 20px !important; }',
    });
    await open();
    await scroll();
    await waitCount('count', 40);
    assert.equal(await count('requests'), 1, 'custom density and group headers use real geometry');
    await close();

    // A failed page stays idle until an explicit retry.
    await page.goto(url);
    await control('fail');
    await open();
    await scroll();
    await page.waitForFunction(
      () => document.querySelector('[data-testid="error"]')?.textContent === 'true',
    );
    await page.waitForTimeout(180);
    assert.equal(await count('requests'), 1, 'failed page does not automatically loop');
    await control('retry');
    await waitCount('count', 40);
    assert.equal(await count('requests'), 2);
    await close();

    // Short pages can fill the viewport automatically without an unbounded loop.
    await page.goto(url + '&initial=2&page=2&total=10');
    await open();
    await page.waitForFunction(
      () => Number(document.querySelector('[data-testid="count"]')?.textContent) >= 6,
    );
    await page.waitForTimeout(180);
    assert.ok((await count('requests')) <= 4, 'short-list filling stays bounded');
    await close();

    // Appending options must retain all values in a multiple selection.
    await page.goto(url + '&multiple=1');
    await open();
    await page.getByRole('option', { name: 'Option 1', exact: true }).click();
    await scroll();
    await waitCount('count', 40);
    assert.equal((await page.getByTestId('selection').textContent()).trim(), '0,1');
    await close();

    // Keep loading paused until the keyboard has reached the old page boundary.
    // Appending must preserve that item, and Arrow Down must enter the new page.
    await page.goto(url);
    await control('pause');
    await open();
    await page.keyboard.press('End');
    const select = page.locator('mat-select');
    const boundaryOption = page.getByRole('option', { name: 'Option 19', exact: true });
    const before = await boundaryOption.getAttribute('id');
    assert.ok(before);
    // Zoneless host bindings render asynchronously after a keyboard event.
    await expect(select).toHaveAttribute('aria-activedescendant', before);
    await control('pause');
    await waitCount('count', 40);
    // Let the directive's deferred append check finish after Material's reset.
    await page.waitForTimeout(50);
    await expect(select, 'append preserves the active keyboard option').toHaveAttribute(
      'aria-activedescendant',
      before,
    );
    await expect(boundaryOption).toHaveClass(/mat-mdc-option-active/);
    const after = await select.getAttribute('aria-activedescendant');
    assert.equal(await count('selection'), 0, 'restoring the highlight must not select it');
    await page.keyboard.press('ArrowDown');
    const nextOption = page.getByRole('option', { name: 'Option 20', exact: true });
    await expect(select, 'Arrow Down continues into the appended page').toHaveAttribute(
      'aria-activedescendant',
      await nextOption.getAttribute('id'),
    );
    await expect(nextOption).toHaveClass(/mat-mdc-option-active/);
    await page.keyboard.press('Enter');
    await waitCount('selection', 20);
    results.push({
      mode,
      scenarios: [
        'paging',
        'scroll-position',
        'loading',
        'complete',
        'reopen',
        'preselection',
        'issue-16-sequence',
        'custom-density',
        'grouped-options',
        'retry',
        'short-list',
        'multiple-selection',
        'keyboard-paging',
      ],
      materialPreservesActiveItemOnAppend: before === after,
    });
    assert.deepEqual(errors, [], 'browser errors');
    await page.close();
  }
  // A receipt is written only after every mode finishes, so a partial run fails CI.
  const artifact = JSON.parse(await readFile(join(root, 'dist/artifact.json'), 'utf8'));
  const receipt = {
    major,
    minimum,
    angularVersion,
    passed: true,
    artifact,
    browser: await browser.version(),
    results,
  };
  await mkdir(join(root, 'artifacts'), { recursive: true });
  await writeFile(
    join(root, 'artifacts', `browser-${major}${minimum ? '-minimum' : ''}.json`),
    JSON.stringify(receipt, null, 2) + '\n',
  );
  console.log(JSON.stringify(receipt));
} catch (error) {
  // Read fixture/directive state for diagnostics only. Production behavior does
  // not depend on these private fields, and the test does not modify them.
  if (currentPage && !currentPage.isClosed())
    console.error(
      await currentPage.evaluate(() => ({
        url: location.href,
        state: window.consumer && {
          requests: window.consumer.requests,
          emissions: window.consumer.emissions,
          paused: window.consumer.paused,
          loading: window.consumer.loading,
          count: window.consumer.options.length,
        },
        directive: window.consumer?.directive && {
          loading: window.consumer.directive.loading,
          complete: window.consumer.directive.complete,
          connected: window.consumer.directive.connected,
          panelOpen: window.consumer.directive.matSelect.panelOpen,
          listenerClosed: window.consumer.directive.scroll?.subscription?.closed,
          samePanel:
            window.consumer.directive.scroll?.panel ===
            window.consumer.directive.matSelect.panel?.nativeElement,
          keys: Object.keys(window.consumer.directive),
        },
        text: document.body.innerText,
        panel: document.querySelector('[role="listbox"]') && {
          scrollTop: document.querySelector('[role="listbox"]').scrollTop,
          scrollHeight: document.querySelector('[role="listbox"]').scrollHeight,
          clientHeight: document.querySelector('[role="listbox"]').clientHeight,
        },
      })),
    );
  throw error;
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
