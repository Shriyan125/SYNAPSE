import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, query } from '../config/db.js';
import { logger } from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedFilePath = path.resolve(__dirname, '../../../db/seed.sql');

export async function runSeed() {
  logger.info('Starting database seeding...');
  
  if (!fs.existsSync(seedFilePath)) {
    throw new Error(`Seed file not found at ${seedFilePath}`);
  }

  const sql = fs.readFileSync(seedFilePath, 'utf-8');

  try {
    await query(sql);
    logger.info('Database seeded successfully with initial data (users, providers, services, slots, appointments).');
  } catch (err) {
    logger.error(`Database seeding failed: ${err.message}`);
    throw err;
  }
}

// Run directly if invoked from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSeed()
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
