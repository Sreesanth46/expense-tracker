import { db } from './index';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

async function runMigration() {
  const connectionString = process.env.DATABASE_URL!;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  try {
    await migrate(db, { migrationsFolder: './lib/db/migrations' });
    console.log('Completed migrations');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
