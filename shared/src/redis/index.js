import Redis from 'ioredis';

export function createRedisClient(options = {}) {
  const client = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 200, 5000),
    ...options,
  });

  client.on('error', (err) => console.error('[Redis] Connection error:', err.message));
  client.on('connect', () => console.log('[Redis] Connected'));

  return client;
}
