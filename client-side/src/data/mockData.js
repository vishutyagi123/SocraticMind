export const radarData = [
  { axis: 'Conceptual Depth', value: 72, fullMark: 100 },
  { axis: 'Confidence Accuracy', value: 58, fullMark: 100 },
  { axis: 'Consistency', value: 85, fullMark: 100 },
  { axis: 'Technical Accuracy', value: 64, fullMark: 100 },
  { axis: 'Surface Knowledge', value: 91, fullMark: 100 },
];

export const radarDataPrevious = [
  { axis: 'Conceptual Depth', value: 48, fullMark: 100 },
  { axis: 'Confidence Accuracy', value: 35, fullMark: 100 },
  { axis: 'Consistency', value: 62, fullMark: 100 },
  { axis: 'Technical Accuracy', value: 41, fullMark: 100 },
  { axis: 'Surface Knowledge', value: 78, fullMark: 100 },
];

export const jdCoverage = [
  { topic: 'Data Structures', covered: 85, total: 100 },
  { topic: 'System Design', covered: 42, total: 100 },
  { topic: 'Operating Systems', covered: 68, total: 100 },
  { topic: 'Networking', covered: 30, total: 100 },
  { topic: 'DBMS', covered: 75, total: 100 },
  { topic: 'OOP Concepts', covered: 90, total: 100 },
];

export const interviewHistory = [
  {
    id: 1,
    date: '2026-03-25',
    role: 'SDE Intern - Google',
    duration: '32 min',
    overallScore: 72,
    topicsAsked: ['Arrays', 'Trees', 'System Design'],
    weakSpots: ['Confidence vs Accuracy gap', 'System Design depth'],
    status: 'completed',
  },
  {
    id: 2,
    date: '2026-03-23',
    role: 'Backend Engineer - Razorpay',
    duration: '28 min',
    overallScore: 65,
    topicsAsked: ['DBMS', 'REST APIs', 'Caching'],
    weakSpots: ['Normalization understanding', 'Cache invalidation'],
    status: 'completed',
  },
  {
    id: 3,
    date: '2026-03-20',
    role: 'Full Stack - Flipkart',
    duration: '35 min',
    overallScore: 58,
    topicsAsked: ['React', 'Node.js', 'SQL'],
    weakSpots: ['State management reasoning', 'Query optimization'],
    status: 'completed',
  },
];

export const learningProgress = [
  {
    id: 1,
    topic: 'Binary Search Trees',
    sessions: 3,
    masteryLevel: 82,
    lastSession: '2026-03-25',
    status: 'mastered',
  },
  {
    id: 2,
    topic: 'Cache Invalidation',
    sessions: 2,
    masteryLevel: 45,
    lastSession: '2026-03-24',
    status: 'in_progress',
  },
  {
    id: 3,
    topic: 'System Design Basics',
    sessions: 4,
    masteryLevel: 61,
    lastSession: '2026-03-23',
    status: 'in_progress',
  },
  {
    id: 4,
    topic: 'Dynamic Programming',
    sessions: 1,
    masteryLevel: 28,
    lastSession: '2026-03-22',
    status: 'needs_work',
  },
];

export const dashboardStats = {
  totalInterviews: 12,
  avgScore: 68,
  topicsImproved: 7,
  totalLearningHours: 14.5,
  improvementRate: 23,
  streakDays: 5,
};
