/**
 * Captures UI screenshots for visual verification.
 * Assumes the dev server is running on http://localhost:3001.
 */

import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

async function main() {
  const outDir = join(process.cwd(), 'test-output', 'ui');
  mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

    const shots: [string, string][] = [
      ['dashboard', 'http://localhost:3001/'],
      ['create-step-1', 'http://localhost:3001/create'],
      ['knowledge-base', 'http://localhost:3001/knowledge-base'],
    ];

    for (const [name, url] of shots) {
      console.log(`Capturing ${name} at ${url}`);
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      await new Promise((r) => setTimeout(r, 400));
      await page.screenshot({ path: join(outDir, `${name}.png`) as `${string}.png`, fullPage: false });
    }

    // Also capture proposal detail if we have one
    const res = await fetch('http://localhost:3001/api/proposals');
    const list = (await res.json()) as { id: string }[];
    if (list.length > 0) {
      const id = list[0].id;
      await page.goto(`http://localhost:3001/proposals/${id}`, { waitUntil: 'networkidle0', timeout: 30000 });
      await new Promise((r) => setTimeout(r, 500));
      await page.screenshot({ path: join(outDir, `proposal-detail.png`) as `${string}.png`, fullPage: false });
      console.log(`Captured proposal-detail for ${id}`);
    }

    console.log(`\n✓ UI screenshots saved to ${outDir}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
