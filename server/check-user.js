// check-user.js - Check user in database directly
import { config } from 'dotenv';
config();

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from './src/db/schema.js';
import { eq, sql } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const client = postgres(DATABASE_URL);
const db = drizzle(client);

async function check() {
  try {
    // Search with exact email (case-sensitive)
    const exact = await db.select().from(users).where(eq(users.email, 'jose.ruiz151101@gmail.com')).limit(1);
    console.log('Exact match (lowercase):', exact.length ? exact[0] : 'NOT FOUND');

    // Search case-insensitive using ILIKE
    const insensitive = await db.select().from(users).where(sql`${users.email} ILIKE 'jose.ruiz151101@gmail.com'`).limit(1);
    console.log('Case-insensitive match:', insensitive.length ? insensitive[0] : 'NOT FOUND');

    // Get all users to see emails
    const all = await db.select({ email: users.email, id: users.id, provider: users.provider }).from(users);
    console.log('\nAll users:');
    all.forEach(u => console.log(`  ID: ${u.id}, Email: "${u.email}", Provider: ${u.provider}`));

    await client.end();
  } catch (err) {
    console.error('Error:', err);
    await client.end();
    process.exit(1);
  }
}

check();