import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pino from 'pino';
import { connectDB } from './config/db.js';
import { interviewRoutes } from './routes/interview.routes.js';

const app = express();
const PORT = process.env.PORT || 8004;

const log = pino({
  name: 'interview-service',
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
});

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

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

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'interview' }));

// Gateway proxy replaces api/interview with /
app.use('/', interviewRoutes);

app.use((err, req, res, next) => {
  log.error({ err, msg: err.message });
  res.status(err.statusCode || 500).json({ error: err.message || 'Internal error' });
});

await connectDB();

app.listen(PORT, () => {
  log.info(`Interview Service running on port ${PORT}`);
});

export default app;
