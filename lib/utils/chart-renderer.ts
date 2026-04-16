/**
 * Pure-SVG chart renderer — no canvas dependency.
 * Charts are emitted as data-URI SVG so they embed into the PDF without HTTP.
 * Vector output = sharper than PNG at any zoom.
 */

const BRAND = {
  primary: '#0F172A',
  secondary: '#1E293B',
  body: '#334155',
  muted: '#64748B',
  subtle: '#94A3B8',
  accent: '#3B82F6',
  accentDark: '#1D4ED8',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  surface: '#F8FAFC',
  border: '#E2E8F0',
};

const PALETTE = [
  '#3B82F6', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#14B8A6',
  '#F97316', '#0EA5E9',
];

function svgToDataUri(svg: string): string {
  // Use base64 rather than URL-encoded for consistent embedding.
  const b64 = Buffer.from(svg, 'utf-8').toString('base64');
  return `data:image/svg+xml;base64,${b64}`;
}

// ────────────────────────────────────────────────────────────
// Budget Donut Chart
// ────────────────────────────────────────────────────────────
export interface BudgetSlice {
  label: string;
  value: number;
}

export function renderBudgetDonut(slices: BudgetSlice[]): string {
  const W = 520;
  const H = 360;
  const cx = 160;
  const cy = H / 2;
  const rOuter = 120;
  const rInner = 72;
  const total = slices.reduce((s, d) => s + d.value, 0) || 1;

  let angle = -Math.PI / 2;
  const paths: string[] = [];
  slices.forEach((slice, i) => {
    const frac = slice.value / total;
    const sweep = frac * Math.PI * 2;
    const a1 = angle;
    const a2 = angle + sweep;
    const large = sweep > Math.PI ? 1 : 0;

    const x1 = cx + rOuter * Math.cos(a1);
    const y1 = cy + rOuter * Math.sin(a1);
    const x2 = cx + rOuter * Math.cos(a2);
    const y2 = cy + rOuter * Math.sin(a2);
    const x3 = cx + rInner * Math.cos(a2);
    const y3 = cy + rInner * Math.sin(a2);
    const x4 = cx + rInner * Math.cos(a1);
    const y4 = cy + rInner * Math.sin(a1);

    const path = [
      `M ${x1.toFixed(2)} ${y1.toFixed(2)}`,
      `A ${rOuter} ${rOuter} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
      `L ${x3.toFixed(2)} ${y3.toFixed(2)}`,
      `A ${rInner} ${rInner} 0 ${large} 0 ${x4.toFixed(2)} ${y4.toFixed(2)}`,
      'Z',
    ].join(' ');

    paths.push(`<path d="${path}" fill="${PALETTE[i % PALETTE.length]}" />`);
    angle = a2;
  });

  // Legend
  const legendX = 320;
  let legendY = 60;
  const legend: string[] = [];
  slices.forEach((slice, i) => {
    const pct = ((slice.value / total) * 100).toFixed(1);
    const color = PALETTE[i % PALETTE.length];
    legend.push(`
      <g transform="translate(${legendX}, ${legendY})">
        <rect width="10" height="10" rx="2" fill="${color}" />
        <text x="18" y="9" font-family="Inter, Arial, sans-serif" font-size="11" fill="${BRAND.secondary}" font-weight="500">${escapeXml(slice.label)}</text>
        <text x="180" y="9" font-family="Inter, Arial, sans-serif" font-size="11" fill="${BRAND.muted}" text-anchor="end" font-weight="600">${pct}%</text>
      </g>
    `);
    legendY += 26;
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    ${paths.join('')}
    <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="11" fill="${BRAND.muted}" font-weight="500" text-transform="uppercase">Total</text>
    <text x="${cx}" y="${cy + 18}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="20" fill="${BRAND.primary}" font-weight="700">100%</text>
    ${legend.join('')}
  </svg>`;

  return svgToDataUri(svg);
}

// ────────────────────────────────────────────────────────────
// Gantt Timeline Chart
// ────────────────────────────────────────────────────────────
export interface TimelinePhase {
  name: string;
  startWeek: number;
  durationWeeks: number;
}

export interface TimelineMilestone {
  label: string;
  atWeek: number;
}

export function renderTimelineGantt(
  phases: TimelinePhase[],
  totalWeeks: number,
  milestones: TimelineMilestone[] = [],
): string {
  const W = 900;
  const rowH = 38;
  const headerH = 56;
  const labelW = 180;
  const rightPad = 24;
  const H = headerH + phases.length * rowH + 32;
  const plotW = W - labelW - rightPad;
  const plotX = labelW;
  const weekW = plotW / totalWeeks;

  // Header: week ticks
  const headerTicks: string[] = [];
  const tickEvery = totalWeeks <= 12 ? 1 : totalWeeks <= 26 ? 2 : 4;
  for (let w = 0; w <= totalWeeks; w += tickEvery) {
    const x = plotX + w * weekW;
    headerTicks.push(`<line x1="${x}" y1="${headerH - 10}" x2="${x}" y2="${H - 20}" stroke="${BRAND.border}" stroke-width="0.5"/>`);
    headerTicks.push(`<text x="${x}" y="${headerH - 16}" font-family="Inter, Arial, sans-serif" font-size="9" fill="${BRAND.muted}" text-anchor="middle" font-weight="500">W${w}</text>`);
  }

  // Column header
  const colHeader = `
    <rect x="0" y="0" width="${W}" height="${headerH - 8}" fill="${BRAND.surface}"/>
    <text x="16" y="${headerH - 26}" font-family="Inter, Arial, sans-serif" font-size="9" fill="${BRAND.muted}" font-weight="600" letter-spacing="1">PHASE</text>
    <text x="${plotX + 4}" y="${headerH - 26}" font-family="Inter, Arial, sans-serif" font-size="9" fill="${BRAND.muted}" font-weight="600" letter-spacing="1">SCHEDULE (WEEKS)</text>
  `;

  const bars: string[] = [];
  phases.forEach((p, i) => {
    const y = headerH + i * rowH;
    const barY = y + 8;
    const barH = rowH - 16;
    const x = plotX + p.startWeek * weekW;
    const w = Math.max(p.durationWeeks * weekW - 2, 6);
    const color = PALETTE[i % PALETTE.length];

    bars.push(`
      <rect x="0" y="${y}" width="${W}" height="${rowH}" fill="${i % 2 === 0 ? '#FFFFFF' : BRAND.surface}" />
      <text x="16" y="${y + rowH / 2 + 4}" font-family="Inter, Arial, sans-serif" font-size="10.5" fill="${BRAND.primary}" font-weight="600">${escapeXml(p.name)}</text>
      <rect x="${x}" y="${barY}" width="${w}" height="${barH}" fill="${color}" rx="3" ry="3" opacity="0.92"/>
      <rect x="${x}" y="${barY}" width="4" height="${barH}" fill="${color}" rx="2" ry="2" opacity="1"/>
      <text x="${x + w / 2}" y="${barY + barH / 2 + 4}" font-family="Inter, Arial, sans-serif" font-size="9.5" fill="#FFFFFF" text-anchor="middle" font-weight="600">${p.durationWeeks}w</text>
    `);
  });

  const milestoneSvg: string[] = [];
  milestones.forEach((m) => {
    const x = plotX + m.atWeek * weekW;
    const y = H - 6;
    milestoneSvg.push(`
      <polygon points="${x},${y - 10} ${x + 6},${y - 4} ${x},${y + 2} ${x - 6},${y - 4}" fill="${BRAND.accentDark}" stroke="#FFFFFF" stroke-width="1"/>
      <text x="${x}" y="${y + 14}" font-family="Inter, Arial, sans-serif" font-size="8.5" fill="${BRAND.secondary}" text-anchor="middle" font-weight="500">${escapeXml(m.label)}</text>
    `);
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H + 30}" width="${W}" height="${H + 30}">
    ${colHeader}
    ${headerTicks.join('')}
    ${bars.join('')}
    ${milestoneSvg.join('')}
  </svg>`;

  return svgToDataUri(svg);
}

// ────────────────────────────────────────────────────────────
// Metrics Bar Chart (for case-study results, if ever embedded)
// ────────────────────────────────────────────────────────────
export interface MetricBar {
  label: string;
  value: number;
  suffix?: string;
}

export function renderMetricsBar(bars: MetricBar[]): string {
  const W = 600;
  const rowH = 38;
  const H = 40 + bars.length * rowH;
  const labelW = 180;
  const valueW = 70;
  const plotW = W - labelW - valueW - 24;
  const max = Math.max(...bars.map((b) => b.value), 1);

  const rows: string[] = [];
  bars.forEach((b, i) => {
    const y = 20 + i * rowH;
    const w = (b.value / max) * plotW;
    rows.push(`
      <text x="0" y="${y + 16}" font-family="Inter, Arial, sans-serif" font-size="11" fill="${BRAND.secondary}" font-weight="500">${escapeXml(b.label)}</text>
      <rect x="${labelW}" y="${y + 6}" width="${plotW}" height="16" fill="${BRAND.surface}" rx="2"/>
      <rect x="${labelW}" y="${y + 6}" width="${w}" height="16" fill="${BRAND.accent}" rx="2"/>
      <text x="${labelW + plotW + 12}" y="${y + 18}" font-family="Inter, Arial, sans-serif" font-size="12" fill="${BRAND.primary}" font-weight="700">${b.value}${b.suffix ?? ''}</text>
    `);
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${rows.join('')}</svg>`;
  return svgToDataUri(svg);
}

// ────────────────────────────────────────────────────────────
function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
