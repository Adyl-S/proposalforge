/**
 * Milestone 1 verification script.
 * Renders a fully-populated sample proposal to PDF using hardcoded content —
 * NO AI, NO KB loading. This validates that the template + CSS + Puppeteer
 * pipeline produces premium, enterprise-grade output.
 *
 * Run:  npm run test:pdf
 */

import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { assembleProposalHtml } from '../lib/pdf/template';
import { generateProposalPdf } from '../lib/pdf/generate-pdf';
import { buildSampleData } from './sample-data';

async function main() {
  const data = buildSampleData();
  const html = assembleProposalHtml(data);

  const outDir = join(process.cwd(), 'test-output');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'sample-proposal.pdf');

  console.log('Rendering HTML → PDF via Puppeteer...');
  const start = Date.now();
  await generateProposalPdf({ html, outputPath: outPath });
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log(`\n✓ PDF generated in ${elapsed}s`);
  console.log(`  → ${outPath}`);
}

main().catch((err) => {
  console.error('PDF generation failed:', err);
  process.exit(1);
});
