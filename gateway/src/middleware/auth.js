import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET;

export function validateJWT(req, res, next) {
  // Try cookie first, then Authorization header
  let token = req.cookies?.access_token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'NO_TOKEN',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // TODO: Check Redis blacklist when Redis is connected
    // const isBlacklisted = await redis.get(`blacklist:${decoded.jti}`);
    // if (isBlacklisted) return res.status(401).json({ error: 'Token revoked' });

    req.user = {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      deviceId: decoded.deviceId,
      jti: decoded.jti,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      error: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
  }
}
