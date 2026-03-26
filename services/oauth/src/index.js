import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pino from 'pino';
import { oauthRoutes } from './routes/oauth.routes.js';

const app = express();
const PORT = process.env.PORT || 8002;

const log = pino({
  name: 'oauth-service',
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
});

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    log.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: Date.now() - start,
      requestId: req.headers['x-request-id']
    });
  });
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'oauth' }));

app.use('/', oauthRoutes);

// Error handling
app.use((err, req, res, next) => {
  log.error({ err, msg: err.message });
  res.status(err.statusCode || 500).json({ error: err.message || 'Internal error' });
});

app.listen(PORT, () => {
  log.info(`OAuth Service running on port ${PORT}`);
});

export default app;
