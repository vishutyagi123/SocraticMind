const problems = [
  {
    num: '01',
    title: 'Nobody maps how you think',
    copy: 'Tools tell you what was wrong. Nobody shows you the structural gap in your reasoning.',
    icon: (
      <svg className="w-6 h-6"  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Tools ignore your Job Description',
    copy: 'You can ace 50 DSA mocks and still bomb a role that needed System Design and OS.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9.75m3 3H9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Feedback without learning is useless',
    copy: 'You get a report. You close the tab. Nothing changes.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
];

export default function ProblemSection() {
  return (
    <section className="section-padding relative" id="problem">
      {/* Background accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm text-violet-light uppercase tracking-widest mb-3 font-medium">The Painful Cycle</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Why current tools{' '}
            <span className="text-gradient">fail you</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {problems.map((p, i) => (
            <div
              key={p.num}
              className="glass-card p-8 hover:glass-card-hover group cursor-default"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              {/* Number badge */}
              <div className="flex items-center gap-4 mb-5">
                <span className="text-5xl font-black text-gradient opacity-30 group-hover:opacity-60 transition-opacity select-none">
                  {p.num}
                </span>
                <div className="w-10 h-10 rounded-lg bg-violet/10 flex items-center justify-center text-violet-light group-hover:bg-violet/20 transition-colors">
                  {p.icon}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-text-primary mb-3 group-hover:text-violet-light transition-colors">
                {p.title}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {p.copy}
              </p>

              {/* Bottom accent line */}
              <div className="mt-6 h-px bg-gradient-to-r from-violet/30 to-transparent w-0 group-hover:w-full transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
