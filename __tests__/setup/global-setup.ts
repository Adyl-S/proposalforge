/**
 * Jest globalSetup — runs once before any test. Applies Prisma migrations to
 * the forge test Postgres so proposals.proposals exists.
 */

import { execSync } from 'node:child_process';

export default async function globalSetup(): Promise<void> {
  const url =
    process.env.TEST_DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/proposal_forge_test?schema=proposals';

  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
  });
}
