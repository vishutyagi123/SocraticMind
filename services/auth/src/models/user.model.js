import db from '../config/db.js';

export const User = {
  async findById(id) {
    return db('users').where({ id }).first();
  },

  async findByEmail(email) {
    return db('users').where({ email: email.toLowerCase() }).first();
  },

  async create({ email, passwordHash, name, avatarUrl, role = 'student' }) {
    const [user] = await db('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        name,
        avatar_url: avatarUrl,
        role,
      })
      .returning(['id', 'email', 'name', 'avatar_url', 'role', 'is_verified', 'created_at']);

    return user;
  },

  async update(id, data) {
    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.avatarUrl) updateData.avatar_url = data.avatarUrl;
    if (data.passwordHash) updateData.password_hash = data.passwordHash;
    if (data.isVerified !== undefined) updateData.is_verified = data.isVerified;
    updateData.updated_at = db.fn.now();

    const [user] = await db('users')
      .where({ id })
      .update(updateData)
      .returning(['id', 'email', 'name', 'avatar_url', 'role', 'is_verified', 'updated_at']);

    return user;
  },

  sanitize(user) {
    if (!user) return null;
    const { password_hash, ...safe } = user;
    return safe;
  },
};
