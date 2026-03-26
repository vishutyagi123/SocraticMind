export const serviceRoutes = [
  {
    path: '/api/auth',
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:8001',
    auth: false,
    rateLimit: { window: 900, max: 20 }, // 20 req / 15 min for auth endpoints
  },
  {
    path: '/api/oauth',
    target: process.env.OAUTH_SERVICE_URL || 'http://localhost:8002',
    auth: false,
    rateLimit: { window: 900, max: 30 },
  },
  {
    path: '/api/dashboard',
    target: process.env.DASHBOARD_SERVICE_URL || 'http://localhost:8003',
    auth: true,
    rateLimit: { window: 60, max: 100 },
  },
  {
    path: '/api/interview',
    target: process.env.INTERVIEW_SERVICE_URL || 'http://localhost:8004',
    auth: true,
    rateLimit: { window: 60, max: 60 },
  },
  {
    path: '/api/socratic',
    target: process.env.INTERVIEW_SERVICE_URL || 'http://localhost:8004',
    auth: true,
    rateLimit: { window: 60, max: 60 },
  },
];
