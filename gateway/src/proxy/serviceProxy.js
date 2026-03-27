import { createProxyMiddleware } from 'http-proxy-middleware';

export function setupProxies(app, routes, authMiddleware) {
  routes.forEach(({ path, target, auth }) => {
    const middlewares = [];

    // Add JWT validation for protected routes
    if (auth) {
      middlewares.push(authMiddleware);
    }

    const proxy = createProxyMiddleware({
      target,
      changeOrigin: true,
      pathFilter: path,
      pathRewrite: {
        '^/api': '' // strip /api, keep the rest (e.g. /auth/signup)
      },
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

    if (auth) {
      app.use(path, authMiddleware);
    } else if (path === '/api/auth') {
      // Selective auth for the auth service
      app.use(path, (req, res, next) => {
        const publicRoutes = ['/signup', '/login', '/refresh', '/google'];
        const isPublic = publicRoutes.some(r => req.path.startsWith(r));
        if (isPublic) {
          return next();
        }
        return authMiddleware(req, res, next);
      });
    }

    app.use(proxy);
  });
}
