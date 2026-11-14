// Vercel serverless entry point for the Synapse Express API.
// Vercel invokes this handler per-request (no persistent process).
// node-cron background jobs do NOT run in this environment — they
// only run when the backend is started locally or in a Docker container.
import app from '../src/app.js';

// Export the Express app as the default Vercel handler.
// Vercel's @vercel/node runtime accepts an Express app directly.
export default app;
