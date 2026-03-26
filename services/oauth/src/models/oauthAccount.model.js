import db from '../config/db.js';

export const OAuthAccount = {
  async findByProvider(provider, providerId) {
    return db('oauth_accounts').where({ provider, provider_id: providerId }).first();
  },

  async create({ userId, provider, providerId, accessToken, refreshToken, email, profileData }) {
    const [account] = await db('oauth_accounts').insert({
      user_id: userId,
      provider,
      provider_id: providerId,
      access_token: accessToken,
      refresh_token: refreshToken,
      email,
      profile_data: profileData ? JSON.stringify(profileData) : null,
    }).returning('*');
    return account;
  },

  async findByUserId(userId) {
    return db('oauth_accounts').where({ user_id: userId });
  },

  async remove(provider, userId) {
    return db('oauth_accounts').where({ provider, user_id: userId }).del();
  }
};
