import { Router } from 'express';
import { User } from '../models/user.model.js';
import { issueTokenPair } from '../services/token.service.js';

const router = Router();

/**
 * Verify internal API key for service-to-service calls
 */
function verifyInternalKey(req, res, next) {
  const key = req.headers['x-internal-key'];
  if (key !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({ error: 'Invalid internal key' });
  }
  next();
}

router.use(verifyInternalKey);

/**
 * POST /internal/users/find-or-create
 * Used by OAuth service to find or create a user during OAuth flow
 */
router.post('/users/find-or-create', async (req, res, next) => {
  try {
    const { email, name, avatarUrl } = req.body;

    let user = await User.findByEmail(email);
    if (!user) {
      user = await User.create({ email, name, avatarUrl, passwordHash: null });
    }

    res.json(User.sanitize(user));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /internal/users/:id
 * Used by other services to get user profile
 */
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(User.sanitize(user));
  } catch (err) {
    next(err);
  }
});

/**
 * POST /internal/tokens/generate
 * Used by OAuth service to generate tokens after OAuth flow
 */
router.post('/tokens/generate', async (req, res, next) => {
  try {
    const { userId, deviceInfo } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const deviceId = deviceInfo
      ? require('crypto').createHash('sha256').update(String(deviceInfo)).digest('hex').slice(0, 16)
      : 'unknown';

    const { accessToken, refreshToken } = await issueTokenPair(user, deviceId, { raw: deviceInfo });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
});

export { router as internalRoutes };
