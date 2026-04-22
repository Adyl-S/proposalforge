/**
 * Jest setupFiles — runs before each test file is loaded.
 * Overrides DATABASE_URL to point at the isolated forge test Postgres so the
 * Prisma singleton in lib/db/client.ts connects there instead of dev.
 */

process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/proposal_forge_test?schema=proposals';
