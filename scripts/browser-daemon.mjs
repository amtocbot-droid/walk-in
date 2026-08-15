// Persistent browser daemon: owns a long-lived browser + context + page, and
// executes action files dropped into /tmp/walkin-actions/ in filename order.
// Each action exports `default async function (page, context, browser)`.
// After each run it writes <name>.result.json next to the action file and
// refreshes /tmp/walkin-shot.png. State (cookies, localStorage) persists
// between actions because the context never closes.
import { chromium } from 'playwright';
import { readdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join, basename } from 'node:path';

const DIR = '/tmp/walkin-actions';

const browser = await chromium.launch({ headless: false, args: ['--window-size=1440,900'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
writeFileSync('/tmp/walkin-daemon-ready.txt', String(process.pid));
console.log('daemon ready');

process.on('SIGTERM', async () => { await browser.close(); process.exit(0); });
process.on('SIGINT', async () => { await browser.close(); process.exit(0); });

while (true) {
  let files = [];
  try {
    files = readdirSync(DIR)
      .filter(f => f.endsWith('.mjs') && !existsSync(join(DIR, f + '.done')))
      .sort();
  } catch { /* dir may not exist yet */ }

  for (const f of files) {
    const path = join(DIR, f);
    const name = basename(f, '.mjs');
    let result;
    try {
      const { default: action } = await import(pathToFileURL(path).href + '?t=' + Date.now());
      const value = await action(page, context, browser);
      result = { ok: true, value: value ?? null };
    } catch (err) {
      result = { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
    try { await page.screenshot({ path: '/tmp/walkin-shot.png' }); } catch { /* page may be closed */ }
    writeFileSync(join(DIR, name + '.result.json'), JSON.stringify(result, null, 2));
    writeFileSync(path + '.done', '');
    console.log('ran', f, result.ok ? 'ok' : 'FAILED');
  }

  await new Promise(r => setTimeout(r, 500));
}
