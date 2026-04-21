/**
 * Capture per-section screenshots of a live (AI-generated) proposal.
 * Given a proposal ID in data/proposals/<id>/meta.json, re-runs the generator
 * with the stored input and saves PNGs per section for visual QA.
 *
 * Usage: npx tsx scripts/capture-live-proposal.ts <proposal-id>
 */

// Load .env.local so AI keys are available to the tsx script (Next.js does this
// automatically at runtime, but tsx scripts need an explicit load).
import { existsSync, readFileSync as _readEnv } from 'node:fs';
{
  const envPath = '.env.local';
  if (existsSync(envPath)) {
    for (const line of _readEnv(envPath, 'utf-8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const [, k, rawV] = m;
      if (process.env[k]) continue;
      const v = rawV.replace(/^['"]|['"]$/g, '');
      process.env[k] = v;
    }
  }
}

import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer';
import { generateProposalData } from '../lib/ai/generate-proposal';
import { assembleProposalHtml } from '../lib/pdf/template';
import { buildEmbeddedFontCss } from '../lib/pdf/generate-pdf';
import { getKnowledgeBase } from '../lib/knowledge-base/manager';

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error('Usage: npx tsx scripts/capture-live-proposal.ts <proposal-id>');
    process.exit(1);
  }

  const metaPath = join(process.cwd(), 'data', 'proposals', id, 'meta.json');
  const meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
  const kb = await getKnowledgeBase();

  console.log(`Regenerating proposal ${id} for visual QA...`);
  const data = await generateProposalData(meta.input, kb, (evt) => {
    if (evt.status === 'done' || evt.status === 'fallback') {
      console.log(`  [${evt.status.padEnd(8)}] ${evt.section} (${evt.elapsedMs}ms)`);
    }
  });

  const html = assembleProposalHtml(data);
  const embeddedFonts = buildEmbeddedFontCss();
  const htmlWithFonts = html.replace('<style>', `<style>${embeddedFonts}\n`);

  const outDir = join(process.cwd(), 'test-output', `live-${id}`);
  mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    await page.setContent(htmlWithFonts, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');

    const sectionCount = await page.evaluate(() => {
      return document.querySelectorAll('.cover-page, .page').length;
    });
    console.log(`Capturing ${sectionCount} sections -> ${outDir}`);

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
      console.log(`  ${filename}  (${Math.round(box.w)}x${Math.round(box.h)})`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
