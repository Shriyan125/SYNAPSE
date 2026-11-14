import pg from 'pg';
import { env } from './env.js';
import { logger } from './logger.js';

const { Pool } = pg;

// When running on Vercel (or any cloud host) the DATABASE_URL will point to a
// hosted PostgreSQL that requires SSL. We enable SSL automatically whenever the
// connection string is not targeting localhost / 127.0.0.1.
const isLocalDb =
  env.databaseUrl.includes('localhost') || env.databaseUrl.includes('127.0.0.1');

// Clean connection string to prevent pg-connection-string from conflicting with custom SSL config
const connectionString = isLocalDb
  ? env.databaseUrl
  : env.databaseUrl.replace(/[?&]sslmode=[^&]+/g, '').replace(/\?$/, '');

export const pool = new Pool({
  connectionString,
  max: 10, // Vercel serverless: keep pool small (each invocation is short-lived)
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  logger.error(`Unexpected PostgreSQL client pool error: ${err.message}`);
});

/**
 * Primary helper for parameterized queries
 * @param {string} text - SQL query string
 * @param {Array} params - Array of parameterized values
 * @returns {Promise<pg.QueryResult>}
 */
export const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (env.nodeEnv === 'development') {
      logger.debug(`Executed query: ${text.slice(0, 80).replace(/\s+/g, ' ')}... (${duration}ms, rows: ${res.rowCount})`);
    }
    return res;
  } catch (error) {
    logger.error(`Database Query Error: ${error.message} \nQuery: ${text}`);
    throw error;
  }
};

/**
 * Check and verify the database connection
 */
export const testConnection = async () => {
  try {
    const res = await query('SELECT NOW() AS current_time, current_database() AS db_name');
    logger.info(`Connected to PostgreSQL database "${res.rows[0].db_name}" at ${res.rows[0].current_time}`);
    return true;
  } catch (error) {
    logger.error(`Failed to connect to PostgreSQL: ${error.message}`);
    return false;
  }
};

/**
 * Acquire a dedicated client from the pool for transactions
 * @returns {Promise<pg.PoolClient>}
 */
export const getClient = async () => {
  const client = await pool.connect();
  return client;
};
