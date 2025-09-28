import env from '@/lib/env';
import { connection, db } from './index';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import config from '@/drizzle.config';

if (!env.DB_MIGRATING) {
  throw new Error(
    'You must set DB_MIGRATING to "true" when running migrations'
  );
}

(async () => {
  await migrate(db, { migrationsFolder: config.out! });
  await connection.end();
})();
