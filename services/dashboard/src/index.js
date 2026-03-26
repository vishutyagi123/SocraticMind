import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pino from 'pino';
import { dashboardRoutes } from './routes/dashboard.routes.js';

const app = express();
const PORT = process.env.PORT || 8003;

const log = pino({
  name: 'dashboard-service',
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
      requestId: req.headers['x-request-id'],
      userId: req.headers['x-user-id']
    });
  });
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'dashboard' }));

// Note: gateway proxies with removing /api, so the base is / here
// But we actually proxied `/api/dashboard` to `/`, so let's stick to base `/`.
app.use('/', dashboardRoutes);

app.use((err, req, res, next) => {
  log.error({ err, msg: err.message });
  res.status(err.statusCode || 500).json({ error: err.message || 'Internal error' });
});

app.listen(PORT, () => {
  log.info(`Dashboard Service running on port ${PORT}`);
});

export default app;
