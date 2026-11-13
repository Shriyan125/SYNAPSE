import app from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { testConnection, pool } from './config/db.js';
import { initReminderCron } from './jobs/reminderCron.js';

let cronTask = null;

async function startServer() {
  try {
    // 1. Verify database connectivity
    const dbOk = await testConnection();
    if (!dbOk) {
      logger.error('Database connection failed. Express server cannot start.');
      process.exit(1);
    }

    // 2. Start scheduled reminder background job
    cronTask = initReminderCron();

    // 3. Start Express HTTP server
    const server = app.listen(env.port, () => {
      logger.info(`🚀 Synapse API Server running in [${env.nodeEnv}] mode on port ${env.port}`);
      logger.info(`📚 Swagger Documentation available at: http://localhost:${env.port}/api/docs`);
      logger.info(`🩺 Health check available at: http://localhost:${env.port}/health`);
    });

    // 4. Graceful termination handling
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Gracefully stopping server and background workers...`);
      if (cronTask) cronTask.stop();
      server.close(async () => {
        logger.info('HTTP server closed. Releasing database connection pool...');
        await pool.end();
        logger.info('PostgreSQL connection pool drained. Exiting process.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error(`Fatal server startup failure: ${err.message}`);
    process.exit(1);
  }
}

startServer();
