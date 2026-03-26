import argon2 from 'argon2';
import crypto from 'crypto';
import { User } from '../models/user.model.js';
import { RefreshToken } from '../models/refreshToken.model.js';
import {
  issueTokenPair,
  rotateRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from '../services/token.service.js';

/**
 * Generate a device fingerprint from request info
 */
function getDeviceId(req) {
  const ua = req.headers['user-agent'] || 'unknown';
  const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
  return crypto.createHash('sha256').update(`${ua}:${ip}`).digest('hex').slice(0, 16);
}

function getDeviceInfo(req) {
  return {
    userAgent: req.headers['user-agent'],
    ip: req.headers['x-forwarded-for'] || req.ip,
  };
}

/**
 * POST /auth/signup
 */
export async function signup(req, res, next) {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered', code: 'EMAIL_EXISTS' });
    }

    // Hash password with Argon2id
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const user = await User.create({ email, passwordHash, name });

    // Issue tokens
    const deviceId = getDeviceId(req);
    const deviceInfo = getDeviceInfo(req);
    const { accessToken, refreshToken } = await issueTokenPair(user, deviceId, deviceInfo);

    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      message: 'Account created successfully',
      user: User.sanitize(user),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    const validPassword = await argon2.verify(user.password_hash, password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    const deviceId = getDeviceId(req);
    const deviceInfo = getDeviceInfo(req);
    const { accessToken, refreshToken } = await issueTokenPair(user, deviceId, deviceInfo);

    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      message: 'Login successful',
      user: User.sanitize(user),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/refresh
 */
export async function refresh(req, res, next) {
  try {
    const oldRefreshToken = req.cookies?.refresh_token;
    if (!oldRefreshToken) {
      return res.status(401).json({ error: 'No refresh token', code: 'NO_REFRESH_TOKEN' });
    }

    const { accessToken, refreshToken } = await rotateRefreshToken(oldRefreshToken);
    setAuthCookies(res, accessToken, refreshToken);

    res.json({ message: 'Tokens refreshed' });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message, code: err.code });
    }
    next(err);
  }
}

/**
 * POST /auth/logout
 */
export async function logout(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    const deviceId = getDeviceId(req);

    if (userId) {
      await RefreshToken.revokeDevice(userId, deviceId);
    }

    clearAuthCookies(res);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/logout-all
 */
export async function logoutAll(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    if (userId) {
      await RefreshToken.revokeAllForUser(userId);
    }

    clearAuthCookies(res);
    res.json({ message: 'Logged out from all devices' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /auth/me
 */
export async function getMe(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated', code: 'UNAUTHORIZED' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
    }

    res.json({ user: User.sanitize(user) });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /auth/me
 */
export async function updateMe(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    const { name, avatarUrl } = req.body;

    const user = await User.update(userId, { name, avatarUrl });
    res.json({ user: User.sanitize(user) });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /auth/devices
 */
export async function getDevices(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    const devices = await RefreshToken.getActiveDevices(userId);

    res.json({
      devices: devices.map((d) => ({
        id: d.id,
        deviceId: d.device_id,
        info: d.device_info,
        createdAt: d.created_at,
        expiresAt: d.expires_at,
        isCurrent: d.device_id === getDeviceId(req),
      })),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /auth/devices/:id
 */
export async function revokeDevice(req, res, next) {
  try {
    await RefreshToken.revoke(req.params.id);
    res.json({ message: 'Device session revoked' });
  } catch (err) {
    next(err);
  }
}
