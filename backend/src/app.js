import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import apiRouter from './routes/index.js';
import { swaggerDocument } from './config/swagger.js';

const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Swagger UI to load its CDN assets in dev
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration with credentials allowlist
const allowedOrigins = [
  env.cors.origin,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, mobile apps)
      if (!origin) return callback(null, true);
      // Allow any vercel.app subdomain (covers preview deployments)
      if (origin.endsWith('.vercel.app')) return callback(null, true);
      // Allow explicit allowlist
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Standard parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Request logging (Morgan via Winston stream, disabled during automated tests)
if (env.nodeEnv !== 'test') {
  app.use(
    morgan('short', {
      stream: {
        write: (message) => logger.http(message.trim()),
      },
    })
  );
}

// Global rate limiting
app.use('/api/', generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Swagger / OpenAPI documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount Versioned API routes
app.use('/api/v1', apiRouter);

// 404 handler
app.use(notFound);

// Centralized error handling
app.use(errorHandler);

export default app;
