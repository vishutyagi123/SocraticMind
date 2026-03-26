import { Interview } from '../models/interview.model.js';

export async function startInterview(req, res, next) {
    try {
        const userId = req.headers['x-user-id'];
        const { jdTitle } = req.body;

        const interview = new Interview({
            userId,
            jdTitle,
            status: 'in_progress',
            transcript: [{
                turn: 1,
                agent: 'system',
                text: `Welcome to the interview for ${jdTitle || 'General Software Engineering'}.`,
                metadata: {}
            }]
        });

        await interview.save();
        res.status(201).json({ id: interview._id, message: 'Interview started' });
    } catch(err) { next(err); }
}

export async function answerQuestion(req, res, next) {
    try {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;
        const { text } = req.body;

        const interview = await Interview.findOne({ _id: id, userId });
        if (!interview) return res.status(404).json({ error: 'Interview not found' });

        const turnNum = interview.transcript.length + 1;
        interview.transcript.push({
            turn: turnNum,
            agent: 'student',
            text
        });

        // Simulate AI agent response
        interview.transcript.push({
            turn: turnNum + 1,
            agent: 'cognitive_int',
            text: 'Interesting approach. Could you elaborate on the time complexity?',
            metadata: { analysis: 'Checking fundamental depth' }
        });

        await interview.save();
        res.json({ success: true, newTurn: interview.transcript[interview.transcript.length - 1] });

    } catch(err) { next(err); }
}

export async function finishInterview(req, res, next) {
    try {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;

        const interview = await Interview.findOne({ _id: id, userId });
        if (!interview) return res.status(404).json({ error: 'Interview not found' });

        interview.status = 'completed';
        interview.completedAt = new Date();
        interview.duration = (interview.completedAt - interview.createdAt) / 1000;
        
        // Mock computation of fingerprint
        interview.fingerprint = {
            conceptualDepth: 75,
            confidenceAccuracy: 60,
            consistency: 80,
            technicalAccuracy: 70,
            surfaceKnowledge: 90
        };
        interview.overallScore = 75;
        interview.weakSpots = ['Algorithm Complexity Analysis'];

        await interview.save();

        // Normally, we'd emit a RabbitMQ event here for the Dashboard service to update PostgreSQL
        // eventBus.publish('interviews', 'interview.completed', { ...interview.toJSON() });

        res.json({ message: 'Interview completed', results: interview });
    } catch(err) { next(err); }
}

export async function getInterview(req, res, next) {
    try {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;

        const interview = await Interview.findOne({ _id: id, userId });
        if (!interview) return res.status(404).json({ error: 'Interview not found' });

        res.json({ interview });
    } catch(err) { next(err); }
}
