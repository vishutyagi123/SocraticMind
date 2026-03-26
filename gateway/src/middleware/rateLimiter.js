// Simple in-memory rate limiter (swap to Redis in production)
const ipHits = new Map();

const WINDOW_MS = 60 * 1000;  // 1 minute default
const MAX_HITS = 100;          // 100 requests per minute default

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of ipHits) {
    if (now - data.windowStart > WINDOW_MS * 2) {
      ipHits.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function rateLimiter(req, res, next) {
  // Skip health checks
  if (req.path === '/health') return next();

  const key = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const record = ipHits.get(key);

  if (!record || now - record.windowStart > WINDOW_MS) {
    ipHits.set(key, { windowStart: now, hits: 1 });
    setRateLimitHeaders(res, MAX_HITS, MAX_HITS - 1, WINDOW_MS);
    return next();
  }

  record.hits++;

  if (record.hits > MAX_HITS) {
    const retryAfter = Math.ceil((record.windowStart + WINDOW_MS - now) / 1000);
    res.setHeader('Retry-After', retryAfter);
    setRateLimitHeaders(res, MAX_HITS, 0, 0);
    return res.status(429).json({
      error: 'Too many requests',
      code: 'RATE_LIMITED',
      retryAfter,
    });
  }

  setRateLimitHeaders(res, MAX_HITS, MAX_HITS - record.hits, WINDOW_MS - (now - record.windowStart));
  next();
}

function setRateLimitHeaders(res, limit, remaining, resetMs) {
  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));
  res.setHeader('X-RateLimit-Reset', Math.ceil(resetMs / 1000));
}
