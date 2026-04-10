import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL env var is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const schemaSql = readFileSync('/tmp/refonte-schema.sql', 'utf8');

// Remove SQL line comments, then split on `;` at end of line
const cleaned = schemaSql
  .split('\n')
  .filter((line) => !line.trim().startsWith('--'))
  .join('\n');

const statements = cleaned
  .split(/;\s*\n/)
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

console.log(`Applying ${statements.length} SQL statements...`);

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];
  try {
    await sql.query(stmt);
    console.log(`  ✓ [${i + 1}/${statements.length}] ${stmt.split('\n')[0].slice(0, 80)}`);
  } catch (err) {
    console.error(`  ✗ [${i + 1}/${statements.length}] failed:`, err.message);
    console.error(`     statement: ${stmt.slice(0, 300)}`);
    process.exit(1);
  }
}

console.log('All statements applied successfully.');
