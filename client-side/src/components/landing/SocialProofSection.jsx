const stats = [
  { value: '8', label: 'AI Agents', icon: '🤖' },
  { value: '5-Axis', label: 'Cognitive Profiling', icon: '🧬' },
  { value: 'JD-Aware', label: 'Interviews', icon: '🎯' },
  { value: 'Zero', label: 'Generic Feedback', icon: '🚫' },
];

export default function SocialProofSection() {
  return (
    <section className="section-padding relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Badge */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass group hover:border-violet/30 transition-all duration-300">
            <span className="text-lg">🏆</span>
            <span className="text-sm text-text-muted">
              Built at{' '}
              <span className="text-violet-light font-semibold">HackMol 7.0</span>
              {' · '}
              <span className="text-text-primary font-medium">NIT Jalandhar</span>
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="glass-card p-6 text-center group hover:glass-card-hover"
            >
              <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </span>
              <p className="text-2xl lg:text-3xl font-bold text-gradient mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-text-muted uppercase tracking-wider font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
