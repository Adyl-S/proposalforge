import { readFileSync, existsSync } from 'node:fs';
import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function generateId(prefix: string = ''): string {
  const uuid = randomUUID().split('-')[0];
  return prefix ? `${prefix}-${uuid}` : uuid;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(d: Date | string, fmt: 'long' | 'short' = 'long'): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  const opts: Intl.DateTimeFormatOptions =
    fmt === 'long'
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: 'short', day: '2-digit' };
  return new Intl.DateTimeFormat('en-US', opts).format(date);
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function fileToDataUri(filePath: string): string | undefined {
  if (!existsSync(filePath)) return undefined;
  const ext = extname(filePath).toLowerCase().slice(1);
  const mime =
    ext === 'jpg' || ext === 'jpeg'
      ? 'image/jpeg'
      : ext === 'png'
        ? 'image/png'
        : ext === 'svg'
          ? 'image/svg+xml'
          : ext === 'webp'
            ? 'image/webp'
            : 'application/octet-stream';
  const b64 = readFileSync(filePath).toString('base64');
  return `data:${mime};base64,${b64}`;
}
