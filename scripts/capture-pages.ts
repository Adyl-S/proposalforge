/**
 * Renders the sample proposal HTML to individual PNG screenshots
 * so we can visually inspect the quality of each page.
 *
 * Reuses the same data as test-pdf.ts via `--only-html` assembly.
 */

import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer';
import { assembleProposalHtml } from '../lib/pdf/template';
import { buildEmbeddedFontCss } from '../lib/pdf/generate-pdf';
import {
  renderBudgetDonut,
  renderTimelineGantt,
} from '../lib/utils/chart-renderer';
import { getInitials } from '../lib/utils/helpers';

// Import the same data builder by executing the module for its side effects
// would be ugly — instead we inline a light wrapper that rebuilds data identically.
// To keep DRY, we re-import from test-pdf via a data-only export.
// Since test-pdf is a script with main() at bottom, extract to a shared module:

import { buildSampleData } from './sample-data';

async function main() {
  const data = buildSampleData();
  const html = assembleProposalHtml(data);

  const embeddedFonts = buildEmbeddedFontCss();
  const htmlWithFonts = html.replace('<style>', `<style>${embeddedFonts}\n`);

  const outDir = join(process.cwd(), 'test-output', 'pages');
  mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    // A4 at 96dpi = 794 × 1123 px
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    await page.setContent(htmlWithFonts, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');

    // Get all section elements — cover-page + every .page
    const sectionCount = await page.evaluate(() => {
      return document.querySelectorAll('.cover-page, .page').length;
    });

    console.log(`Found ${sectionCount} sections. Capturing screenshots...`);

    for (let i = 0; i < sectionCount; i++) {
      const { name, box } = await page.evaluate((idx) => {
        const nodes = document.querySelectorAll('.cover-page, .page');
        const el = nodes[idx] as HTMLElement;
        if (!el) return { name: 'missing', box: null };
        el.scrollIntoView({ block: 'start' });
        const r = el.getBoundingClientRect();
        const name = el.classList.contains('cover-page')
          ? 'cover'
          : (el.querySelector('.section-number')?.textContent || `page-${idx}`)
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .slice(0, 30);
        return {
          name,
          box: { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height },
        };
      }, i);

      if (!box) continue;

      const clip = { x: box.x, y: box.y, width: box.w, height: box.h };
      const filename = `${String(i + 1).padStart(2, '0')}-${name}.png`;
      const out = join(outDir, filename);
      await page.screenshot({ path: out as `${string}.png`, clip, type: 'png' });
      console.log(`  ${filename}  (${Math.round(box.w)}×${Math.round(box.h)})`);
    }

    console.log(`\n✓ Screenshots saved to ${outDir}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
