const audiences = [
  {
    emoji: '🎓',
    title: 'Engineering Students',
    desc: 'Placement season prep that actually works. A direct upgrade from mock tools that just score — this one teaches you to think differently.',
    accent: 'violet',
    features: ['Personalized reasoning diagnosis', 'JD-specific preparation', 'Measurable cognitive growth'],
  },
  {
    emoji: '🏫',
    title: 'Bootcamps & Institutes',
    desc: 'Cognitive profiles for every student, not just completion rates. Understand how each learner reasons, not just what they memorized.',
    accent: 'cyan',
    features: ['Per-student reasoning fingerprints', 'Cohort-level analytics', 'Automated learning loops'],
  },
];

export default function AudienceSection() {
  return (
    <section className="section-padding relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm text-violet-light uppercase tracking-widest mb-3 font-medium">Who It's For</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Built for people who{' '}
            <span className="text-gradient">want to improve</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {audiences.map((a) => (
            <div
              key={a.title}
              className="glass-card p-8 hover:glass-card-hover group relative overflow-hidden"
            >
              {/* Accent glow */}
              <div
                className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${
                  a.accent === 'violet' ? 'bg-violet' : 'bg-cyan'
                }`}
              />

              <div className="relative z-10">
                <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform duration-300 origin-left">
                  {a.emoji}
                </span>
                <h3 className={`text-xl font-bold mb-3 transition-colors ${
                  a.accent === 'violet' ? 'group-hover:text-violet-light' : 'group-hover:text-cyan-light'
                }`}>
                  {a.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed mb-5">
                  {a.desc}
                </p>

                <ul className="space-y-2">
                  {a.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-text-muted">
                      <svg
                        className={`w-4 h-4 flex-shrink-0 ${
                          a.accent === 'violet' ? 'text-violet-light' : 'text-cyan'
                        }`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
