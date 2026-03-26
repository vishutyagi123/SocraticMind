import { DashboardModel } from '../models/dashboard.model.js';

export async function getOverview(req, res, next) {
   try {
     const userId = req.headers['x-user-id'];
     if (!userId) {
         return res.status(401).json({ error: 'Unauthorized' });
     }
     
     // Simulated stats retrieval, normally you'd aggregate this from interviews
     const stats = {
         totalInterviews: 12,
         avgScore: 85,
         topicsImproved: 4,
         totalLearningHours: 15.5,
         streakDays: 3,
     };

     res.json({ stats });
   } catch(err) { next(err); }
}

export async function getFingerprint(req, res, next) {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const history = await DashboardModel.getFingerprintHistory(userId);
        
        let previous = null;
        let current = null;

        if (history.length > 0) {
            current = history[history.length - 1];
        }
        if (history.length > 1) {
            previous = history[history.length - 2];
        } else {
            previous = current; // Fallback
        }

        res.json({ current, previous, history });
    } catch(err) { next(err); }
}

export async function getJDCoverage(req, res, next) {
    try {
        const userId = req.headers['x-user-id'];
        const coverage = await DashboardModel.getJDCoverage(userId);
        res.json({ coverage });
    } catch (err) { next(err); }
}

export async function getLearningProgress(req, res, next) {
    try {
        const userId = req.headers['x-user-id'];
        const progress = await DashboardModel.getLearningProgress(userId);
        res.json({ progress });
    } catch (err) { next(err); }
}
