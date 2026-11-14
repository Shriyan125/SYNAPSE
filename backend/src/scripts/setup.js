import { pool, testConnection } from '../config/db.js';
import { runMigrations } from './migrate.js';
import { runSeed } from './seed.js';
import { logger } from '../config/logger.js';

async function setup() {
  logger.info('=== Synapse Database Setup Started ===');
  
  const connected = await testConnection();
  if (!connected) {
    logger.error('Cannot proceed with setup: PostgreSQL is not reachable.');
    process.exit(1);
  }

  await runMigrations();
  await runSeed();

  logger.info('=== Synapse Database Setup Completed Successfully ===');
  await pool.end();
}

setup().catch((err) => {
  logger.error(`Setup process encountered a fatal error: ${err.message}`);
  process.exit(1);
});
