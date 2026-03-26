import { dashboardStats } from '../../data/mockData';

const cards = [
  {
    label: 'Total Interviews',
    value: dashboardStats.totalInterviews,
    icon: '🎤',
    change: '+3 this week',
    accent: 'violet',
  },
  {
    label: 'Avg Score',
    value: `${dashboardStats.avgScore}%`,
    icon: '📊',
    change: `+${dashboardStats.improvementRate}% improvement`,
    accent: 'cyan',
  },
  {
    label: 'Topics Improved',
    value: dashboardStats.topicsImproved,
    icon: '📈',
    change: '2 new this week',
    accent: 'violet',
  },
  {
    label: 'Learning Hours',
    value: `${dashboardStats.totalLearningHours}h`,
    icon: '⏱️',
    change: `${dashboardStats.streakDays} day streak 🔥`,
    accent: 'cyan',
  },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="glass-card p-5 group hover:glass-card-hover"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
              {card.icon}
            </span>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              card.accent === 'violet'
                ? 'bg-violet/15 text-violet-light'
                : 'bg-cyan/15 text-cyan-light'
            }`}>
              {card.change}
            </span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{card.value}</p>
          <p className="text-xs text-text-dim mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
