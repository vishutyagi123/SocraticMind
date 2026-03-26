import db from '../config/db.js';

export const RefreshToken = {
  async create({ userId, tokenHash, tokenFamily, deviceId, deviceInfo, expiresAt }) {
    const [token] = await db('refresh_tokens')
      .insert({
        user_id: userId,
        token_hash: tokenHash,
        token_family: tokenFamily,
        device_id: deviceId,
        device_info: deviceInfo ? JSON.stringify(deviceInfo) : null,
        expires_at: expiresAt,
      })
      .returning('*');

    return token;
  },

  async findActiveByFamily(tokenFamily) {
    return db('refresh_tokens')
      .where({ token_family: tokenFamily })
      .whereNull('revoked_at')
      .where('expires_at', '>', new Date())
      .first();
  },

  async findAllByFamily(tokenFamily) {
    return db('refresh_tokens')
      .where({ token_family: tokenFamily })
      .orderBy('created_at', 'desc');
  },

  async revoke(id) {
    return db('refresh_tokens')
      .where({ id })
      .update({ revoked_at: db.fn.now() });
  },

  async revokeFamily(tokenFamily) {
    return db('refresh_tokens')
      .where({ token_family: tokenFamily })
      .whereNull('revoked_at')
      .update({ revoked_at: db.fn.now() });
  },

  async revokeAllForUser(userId) {
    return db('refresh_tokens')
      .where({ user_id: userId })
      .whereNull('revoked_at')
      .update({ revoked_at: db.fn.now() });
  },

  async revokeDevice(userId, deviceId) {
    return db('refresh_tokens')
      .where({ user_id: userId, device_id: deviceId })
      .whereNull('revoked_at')
      .update({ revoked_at: db.fn.now() });
  },

  async getActiveDevices(userId) {
    return db('refresh_tokens')
      .where({ user_id: userId })
      .whereNull('revoked_at')
      .where('expires_at', '>', new Date())
      .select('id', 'device_id', 'device_info', 'created_at', 'expires_at')
      .orderBy('created_at', 'desc');
  },

  async cleanup() {
    // Remove expired tokens older than 30 days
    return db('refresh_tokens')
      .where('expires_at', '<', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .delete();
  },
};
