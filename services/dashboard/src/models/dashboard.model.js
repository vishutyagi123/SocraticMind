import db from '../config/db.js';

export const DashboardModel = {
  async getLatestFingerprint(userId) {
    return db('fingerprint_snapshots').where({ user_id: userId }).orderBy('created_at', 'desc').first();
  },
  
  async getFingerprintHistory(userId) {
    return db('fingerprint_snapshots').where({ user_id: userId }).orderBy('created_at', 'asc');
  },

  async getJDCoverage(userId) {
    return db('jd_coverage').where({ user_id: userId }).orderBy('created_at', 'desc');
  },

  async getLearningProgress(userId) {
     return db('learning_progress').where({ user_id: userId });
  },

  async insertFingerprint(data) {
    return db('fingerprint_snapshots').insert(data).returning('*');
  }
};
