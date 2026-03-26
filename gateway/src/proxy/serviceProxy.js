import { createProxyMiddleware } from 'http-proxy-middleware';

export function setupProxies(app, routes, authMiddleware) {
  routes.forEach(({ path, target, auth }) => {
    const middlewares = [];

    // Add JWT validation for protected routes
    if (auth) {
      middlewares.push(authMiddleware);
    }

    // Proxy middleware
    const proxy = createProxyMiddleware({
      target,
      changeOrigin: true,
      // Strip the /api prefix when forwarding to services
      pathRewrite: (reqPath) => reqPath.replace(/^\/api/, ''),
      on: {
        proxyReq: (proxyReq, req) => {
          // Forward user identity to downstream services
          if (req.user) {
            proxyReq.setHeader('X-User-ID', req.user.sub);
            proxyReq.setHeader('X-User-Email', req.user.email || '');
            proxyReq.setHeader('X-User-Role', req.user.role || 'student');
          }
          proxyReq.setHeader('X-Request-ID', req.id || '');
          proxyReq.setHeader('X-Forwarded-For', req.ip || '');
          proxyReq.setHeader('X-Internal-Key', process.env.INTERNAL_API_KEY || '');
        },
        error: (err, req, res) => {
          console.error(`[Proxy] Error forwarding to ${target}:`, err.message);
          if (!res.headersSent) {
            res.status(502).json({
              error: 'Service unavailable',
              code: 'SERVICE_DOWN',
              service: path,
            });
          }
        },
      },
    });

    middlewares.push(proxy);
    app.use(path, ...middlewares);
  });
}
