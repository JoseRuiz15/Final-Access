// check-user-direct.ts - Check user using the backend's pool
import { db } from './src/db/pool.js';
import { users } from './src/db/schema.js';
import { eq, sql } from 'drizzle-orm';

async function check() {
  try {
    // Search with exact email (case-sensitive)
    const exact = await db.select().from(users).where(eq(users.email, 'jose.ruiz151101@gmail.com')).limit(1);
    console.log('Exact match (lowercase):', exact.length ? exact[0] : 'NOT FOUND');

    // Search case-insensitive using ILIKE
    const insensitive = await db.select().from(users).where(sql`${users.email} ILIKE 'jose.ruiz151101@gmail.com'`).limit(1);
    console.log('Case-insensitive match:', insensitive.length ? insensitive[0] : 'NOT FOUND');

    // Get all users to see emails
    const all = await db.select({ email: users.email, id: users.id, provider: users.provider, passwordHash: users.passwordHash }).from(users);
    console.log('\nAll users:');
    all.forEach(u => console.log(`  ID: ${u.id}, Email: "${u.email}", Provider: ${u.provider}, Hash: ${u.passwordHash ? 'YES' : 'NO'}`));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

check();