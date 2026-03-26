import { Router } from 'express';
import {
  signup,
  login,
  refresh,
  logout,
  logoutAll,
  getMe,
  updateMe,
  getDevices,
  revokeDevice,
} from '../controllers/auth.controller.js';
import { validate, signupSchema, loginSchema, updateProfileSchema } from '../middleware/validate.js';

const router = Router();

// Public routes
router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);

// Protected routes (JWT validated by gateway, user ID in X-User-ID header)
router.post('/logout', logout);
router.post('/logout-all', logoutAll);
router.get('/me', getMe);
router.put('/me', validate(updateProfileSchema), updateMe);
router.get('/devices', getDevices);
router.delete('/devices/:id', revokeDevice);

export { router as authRoutes };
