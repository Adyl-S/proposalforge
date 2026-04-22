/**
 * Re-assembles the HTML for the most recent generated proposal and captures
 * its cover + exec summary pages as screenshots so we can verify the
 * end-to-end orchestrator output looks correct.
 */

import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer';
import { generateProposalData } from '../lib/ai/generate-proposal';
import { assembleProposalHtml } from '../lib/pdf/template';
import { buildEmbeddedFontCss } from '../lib/pdf/generate-pdf';
import { getKnowledgeBase } from '../lib/knowledge-base/manager';
import { getProposalMeta, listProposals } from '../lib/proposals/store';

async function main() {
  const summaries = await listProposals();
  if (!summaries.length) {
    console.error('No proposals found — run the generate flow first.');
    return;
  }
  const id = summaries[0].id;
  const meta = await getProposalMeta(id);
  if (!meta) {
    console.error(`No meta row found for proposal ${id}.`);
    return;
  }
  const kb = getKnowledgeBase();

  const data = await generateProposalData(meta.input, kb);
  const html = assembleProposalHtml(data);
  const htmlWithFonts = html.replace('<style>', `<style>${buildEmbeddedFontCss()}\n`);

  const outDir = join(process.cwd(), 'test-output', 'generated-pages');
  mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    await page.setContent(htmlWithFonts, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');

    const sectionCount = await page.evaluate(() => document.querySelectorAll('.cover-page, .page').length);
    console.log(`Found ${sectionCount} sections.`);

    const wanted = [0, 2, 5, 8, 9]; // cover, exec summary, methodology, team, case studies
    for (const i of wanted) {
      const { name, box } = await page.evaluate((idx) => {
        const nodes = document.querySelectorAll('.cover-page, .page');
        const el = nodes[idx] as HTMLElement;
        if (!el) return { name: 'missing', box: null };
        el.scrollIntoView({ block: 'start' });
        const r = el.getBoundingClientRect();
        const name = el.classList.contains('cover-page')
          ? 'cover'
          : (el.querySelector('.section-number')?.textContent || `p-${idx}`)
              .toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
        return { name, box: { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height } };
      }, i);
      if (!box) continue;
      const out = join(outDir, `${String(i + 1).padStart(2, '0')}-${name}.png`);
      await page.screenshot({ path: out as `${string}.png`, clip: { x: box.x, y: box.y, width: box.w, height: box.h } });
      console.log(`  ${out}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
