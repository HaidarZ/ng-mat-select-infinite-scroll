import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';

const dist = resolve('projects/example/dist/browser');
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const file = resolve(dist, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(dist + sep)) { response.writeHead(403).end(); return; }
    response.setHeader('Content-Type', ({'.html':'text/html','.js':'application/javascript','.css':'text/css','.ico':'image/x-icon'})[extname(file)] || 'application/octet-stream');
    response.end(await readFile(file));
  } catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({channel:process.env.CI ? undefined : 'chrome', headless:true});
try {
  const page = await browser.newPage({ viewport: { width: 1100, height: 950 } });
  const errors=[];
  const open = async () => {
    await page.locator('mat-select').click();
    await page.getByRole('option').first().waitFor();
    await page.getByRole('listbox').evaluate(async element => {
      await Promise.all(element.getAnimations({subtree:true}).map(animation=>animation.finished.catch(()=>{})));
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
  };
  const close = async () => { await page.keyboard.press('Escape'); await page.waitForFunction(()=>!document.querySelector('[role="listbox"]')); };
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.getByText('20 of 1000 loaded', {exact:false}).waitFor();
  await open();
  await page.getByRole('option').first().waitFor();
  await page.getByRole('listbox').evaluate(async element=>{
    await Promise.all(element.getAnimations({subtree:true}).map(animation=>animation.finished.catch(()=>{})));
    element.scrollTop=element.scrollHeight;
    element.dispatchEvent(new Event('scroll'));
  });
  await page.getByText('40 of 1000 loaded', {exact:false}).waitFor();
  await page.getByRole('option',{name:'Customer 0001',exact:true}).click();
  await close();
  await page.getByLabel('Find a customer').fill('1000');
  await page.getByText('1 of 1 loaded', {exact:false}).waitFor();
  await open();
  await page.getByRole('option',{name:'Customer 1000',exact:true}).click();
  await close();
  await page.getByText('2 selected', {exact:false}).waitFor();
  await page.getByLabel('Find a customer').fill('');
  await page.getByText('20 of 1000 loaded', {exact:false}).waitFor();
  await page.getByLabel('Fail the next request').check();
  await open();
  await page.getByRole('listbox').evaluate(element=>{element.scrollTop=element.scrollHeight;element.dispatchEvent(new Event('scroll'));});
  await page.getByRole('status').filter({hasText:'failed'}).waitFor();
  await close();
  await page.getByRole('button',{name:'Retry',exact:true}).click();
  await page.getByText('40 of 1000 loaded', {exact:false}).waitFor();
  assert.deepEqual(errors,[]);
  await mkdir('artifacts',{recursive:true});
  await page.screenshot({path:'artifacts/demo.png',fullPage:true});
  console.log('Demo passed: paging, search cancellation/reset, selection retention, failure and retry.');
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
