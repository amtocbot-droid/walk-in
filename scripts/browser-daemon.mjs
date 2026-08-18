// Persistent browser daemon: owns a long-lived browser + context + page, and
// executes action files dropped into /tmp/walkin-actions/ in filename order.
// Each action exports `default async function (page, context, browser)`.
// After each run it writes <name>.result.json next to the action file and
// refreshes /tmp/walkin-shot.png. State (cookies, localStorage) persists
// between actions because the profile dir is stable; if the window is closed
// the browser relaunches automatically and the session survives.
import { chromium } from 'playwright';
import { readdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join, basename } from 'node:path';

const DIR = '/tmp/walkin-actions';
// Persistent profile so logins (e.g. AWS console) survive daemon restarts.
const PROFILE = process.env.WALKIN_PROFILE || '/tmp/walkin-browser-profile';

process.on('unhandledRejection', (err) => console.error('unhandledRejection:', err));
process.on('uncaughtException', (err) => console.error('uncaughtException:', err));

let shuttingDown = false;
process.on('SIGTERM', () => { shuttingDown = true; });
process.on('SIGINT', () => { shuttingDown = true; });

async function launch() {
  const context = await chromium.launchPersistentContext(PROFILE, {
    headless: false,
    viewport: { width: 1440, height: 900 },
    args: ['--window-size=1440,900'],
  });
  return context;
}

async function main() {
  let context = await launch();
  let page = context.pages()[0] ?? await context.newPage();
  context.on('close', () => { context = null; page = null; });
  writeFileSync('/tmp/walkin-daemon-ready.txt', String(process.pid));
  console.log('daemon ready');

  while (!shuttingDown) {
    if (!context) {
      // Window was closed; relaunch with the same profile (sessions survive).
      try {
        context = await launch();
        page = context.pages()[0] ?? await context.newPage();
        context.on('close', () => { context = null; page = null; });
        console.log('browser relaunched');
      } catch (err) {
        console.error('relaunch failed:', err);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
    }
    if (!page || page.isClosed()) {
      try {
        page = context.pages()[0] ?? await context.newPage();
      } catch (err) {
        // Context died without a clean 'close' event — force a relaunch.
        console.error('page recovery failed:', err);
        try { await context.close(); } catch { /* already gone */ }
        context = null; page = null;
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
    }

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
        const value = await action(page, context, context.browser());
        result = { ok: true, value: value ?? null };
      } catch (err) {
        result = { ok: false, error: err instanceof Error ? err.message : String(err) };
      }
      try { if (page && !page.isClosed()) await page.screenshot({ path: '/tmp/walkin-shot.png' }); } catch { /* page may be closed */ }
      writeFileSync(join(DIR, name + '.result.json'), JSON.stringify(result, null, 2));
      writeFileSync(path + '.done', '');
      console.log('ran', f, result.ok ? 'ok' : 'FAILED');
    }

    await new Promise(r => setTimeout(r, 500));
  }

  try { if (context) await context.close(); } catch { /* already gone */ }
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
