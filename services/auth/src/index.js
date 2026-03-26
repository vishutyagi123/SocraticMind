import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pino from 'pino';
import { authRoutes } from './routes/auth.routes.js';
import { internalRoutes } from './routes/internal.routes.js';

const app = express();
const PORT = process.env.PORT || 8001;

const log = pino({
  name: 'auth-service',
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
});

// ─── Middleware ───
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// ─── Request logging ───
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    log.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: Date.now() - start,
      requestId: req.headers['x-request-id'],
      userId: req.headers['x-user-id'],
    });
  });
  next();
});

// ─── Health check ───
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth', timestamp: new Date().toISOString() });
});

// ─── Routes ───
app.use('/auth', authRoutes);
app.use('/internal', internalRoutes);

// ─── Error handler ───
app.use((err, req, res, next) => {
  log.error({ err, requestId: req.headers['x-request-id'] }, err.message);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
    ...(err.details && { details: err.details }),
  });
});

app.listen(PORT, () => {
  log.info(`Auth Service running on port ${PORT}`);
});

export default app;
