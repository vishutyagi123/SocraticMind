import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import argon2 from 'argon2';
import { RefreshToken } from '../models/refreshToken.model.js';
import { User } from '../models/user.model.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Generate short-lived access token
 */
export function generateAccessToken(user, deviceId) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      deviceId,
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRY, jwtid: uuidv4() }
  );
}

/**
 * Generate long-lived refresh token
 */
export function generateRefreshToken(userId, tokenFamily, deviceId) {
  return jwt.sign(
    { sub: userId, tokenFamily, deviceId },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRY, jwtid: uuidv4() }
  );
}

/**
 * Create a full token pair and store refresh token
 */
export async function issueTokenPair(user, deviceId, deviceInfo) {
  const tokenFamily = uuidv4();
  const accessToken = generateAccessToken(user, deviceId);
  const refreshToken = generateRefreshToken(user.id, tokenFamily, deviceId);

  // Hash and store refresh token
  const tokenHash = await argon2.hash(refreshToken, { type: argon2.argon2id });
  await RefreshToken.create({
    userId: user.id,
    tokenHash,
    tokenFamily,
    deviceId,
    deviceInfo,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken };
}

/**
 * Rotate refresh token — implements reuse detection
 */
export async function rotateRefreshToken(oldRefreshToken) {
  let decoded;
  try {
    decoded = jwt.verify(oldRefreshToken, REFRESH_SECRET);
  } catch (err) {
    throw Object.assign(new Error('Invalid or expired refresh token'), {
      statusCode: 401,
      code: 'INVALID_REFRESH_TOKEN',
    });
  }

  const { sub: userId, tokenFamily, deviceId } = decoded;

  // Find active (non-revoked) token in this family
  const activeToken = await RefreshToken.findActiveByFamily(tokenFamily);

  if (!activeToken) {
    // No active token found — possible token reuse attack
    // Revoke ALL tokens in this family as a safety measure
    await RefreshToken.revokeFamily(tokenFamily);
    throw Object.assign(new Error('Token reuse detected — all sessions in this family revoked'), {
      statusCode: 401,
      code: 'TOKEN_REUSE_DETECTED',
    });
  }

  // Verify the presented token matches the stored hash
  const hashValid = await argon2.verify(activeToken.token_hash, oldRefreshToken);
  if (!hashValid) {
    await RefreshToken.revokeFamily(tokenFamily);
    throw Object.assign(new Error('Token mismatch — family revoked'), {
      statusCode: 401,
      code: 'TOKEN_MISMATCH',
    });
  }

  // Revoke the old token
  await RefreshToken.revoke(activeToken.id);

  // Get user for new access token claims
  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { statusCode: 401, code: 'USER_NOT_FOUND' });
  }

  // Issue new pair in the same family
  const newAccessToken = generateAccessToken(user, deviceId);
  const newRefreshToken = generateRefreshToken(userId, tokenFamily, deviceId);

  const newHash = await argon2.hash(newRefreshToken, { type: argon2.argon2id });
  await RefreshToken.create({
    userId,
    tokenHash: newHash,
    tokenFamily,
    deviceId,
    deviceInfo: activeToken.device_info,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

/**
 * Set auth cookies on the response
 */
export function setAuthCookies(res, accessToken, refreshToken) {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/auth/refresh', // only sent to refresh endpoint
  });
}

/**
 * Clear auth cookies
 */
export function clearAuthCookies(res) {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/auth/refresh' });
}
