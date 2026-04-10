import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL env var is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const passwordHash = await bcrypt.hash('password123', 10);
const now = new Date().toISOString();

// CUIDs générés en dur (déterministes)
const parentId = 'cmpreview_parent_01';
const childId = 'cmpreview_child_01';

// Enfant de 7 ans → parcours EXPLORATEURS
const birthYear = new Date().getFullYear() - 7;
const birthdate = new Date(`${birthYear}-04-10`).toISOString();

console.log('Seeding parent...');
await sql.query(
  `INSERT INTO "User" (id, email, "passwordHash", name, role, "createdAt", "updatedAt")
   VALUES ($1, $2, $3, $4, 'PARENT', $5, $5)
   ON CONFLICT (email) DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash"`,
  [parentId, 'test@elevo.local', passwordHash, 'Parent Test', now],
);
console.log(`  ✓ parent: ${parentId}`);

console.log('Seeding child Léa...');
const existing = await sql.query(
  `SELECT id FROM "Child" WHERE "parentId" = $1 AND "firstName" = 'Léa'`,
  [parentId],
);
if (existing.length === 0) {
  await sql.query(
    `INSERT INTO "Child" (id, "parentId", "firstName", birthdate, parcours, xp, level, "planetsVisited", "createdAt", "updatedAt")
     VALUES ($1, $2, 'Léa', $3, 'EXPLORATEURS', 0, 1, ARRAY[]::text[], $4, $4)`,
    [childId, parentId, birthdate, now],
  );
  console.log(`  ✓ child: ${childId} Léa EXPLORATEURS`);
} else {
  console.log(`  ✓ child already exists: ${existing[0].id}`);
}

console.log('\nDone. Login with test@elevo.local / password123');
