import mongoose from 'mongoose';

const TranscriptTurnSchema = new mongoose.Schema({
  turn: Number,
  agent: String,
  text: String,
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});

const InterviewSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true }, // UUID from PostgreSQL
  jdTitle: String,
  status: { type: String, enum: ['in_progress', 'completed', 'abandoned'], default: 'in_progress' },
  duration: Number,
  overallScore: Number,
  transcript: [TranscriptTurnSchema],
  fingerprint: mongoose.Schema.Types.Mixed,
  weakSpots: [String],
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
});

export const Interview = mongoose.model('Interview', InterviewSchema);
