import puppeteer, { type PDFOptions } from 'puppeteer';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface GeneratePdfOptions {
  html: string;
  outputPath?: string;
  /**
   * Directory to serve as the base for relative URLs (e.g., fonts).
   * We embed fonts as base64 to avoid server dependency.
   */
  projectRoot?: string;
}

const FONT_FILES = [
  ['Inter-Regular.woff2', 400],
  ['Inter-Medium.woff2', 500],
  ['Inter-SemiBold.woff2', 600],
  ['Inter-Bold.woff2', 700],
] as const;

/**
 * Inline the Inter fonts as base64 data URIs so the PDF is fully self-contained
 * (no HTTP dependency when Puppeteer renders the page).
 */
export function buildEmbeddedFontCss(projectRoot: string = process.cwd()): string {
  const fontsDir = join(projectRoot, 'public', 'fonts');
  return FONT_FILES.map(([file, weight]) => {
    const buf = readFileSync(join(fontsDir, file));
    const b64 = buf.toString('base64');
    return `@font-face { font-family: 'Inter'; src: url(data:font/woff2;base64,${b64}) format('woff2'); font-weight: ${weight}; font-style: normal; font-display: block; }`;
  }).join('\n');
}

export async function generateProposalPdf(opts: GeneratePdfOptions): Promise<Buffer> {
  const projectRoot = opts.projectRoot ?? process.cwd();

  // Inject embedded fonts at the top of the document so we don't rely on HTTP.
  const embeddedFonts = buildEmbeddedFontCss(projectRoot);
  const html = opts.html.replace('<style>', `<style>${embeddedFonts}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.emulateMediaType('print');

    const pdfOptions: PDFOptions = {
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      headerTemplate: `<div style="font-size:7.5pt;color:#94A3B8;width:100%;text-align:right;padding:4mm 18mm 0 0;font-family:Inter,Arial,sans-serif;letter-spacing:0.08em;text-transform:uppercase;"><span class="pageNumber"></span> · Confidential</div>`,
      footerTemplate: `<div style="font-size:7.5pt;color:#64748B;width:100%;padding:0 18mm 4mm 18mm;font-family:Inter,Arial,sans-serif;display:flex;justify-content:space-between;"><span>ProposalForge</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    };

    if (opts.outputPath) {
      pdfOptions.path = opts.outputPath;
    }

    const pdf = await page.pdf(pdfOptions);
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
