import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from './logger.js';
import { validateJWT } from './middleware/auth.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { setupProxies } from './proxy/serviceProxy.js';
import { serviceRoutes } from './config/routes.js';

const app = express();
const log = createLogger('gateway');
const PORT = process.env.PORT || 8000;

// ─── Security ───
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Request-ID'],
}));
app.use(cookieParser());

// ─── Request ID injection ───
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// ─── Request logging ───
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    log.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: Date.now() - start,
      requestId: req.id,
    });
  });
  next();
});

// ─── Rate limiting ───
app.use(rateLimiter);

// ─── Health check ───
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'gateway', timestamp: new Date().toISOString() });
});

// ─── Service proxies ───
setupProxies(app, serviceRoutes, validateJWT);

// ─── 404 handler ───
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// ─── Error handler ───
app.use((err, req, res, next) => {
  log.error({ err, requestId: req.id }, 'Unhandled error');
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
    requestId: req.id,
  });
});

app.listen(PORT, () => {
  log.info(`API Gateway running on port ${PORT}`);
});

export default app;
