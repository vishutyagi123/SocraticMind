const steps = [
  {
    num: '1',
    title: 'Upload JD PDF',
    desc: 'Drop your target Job Description — the system extracts required topics.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    num: '2',
    title: 'Get Interviewed by AI',
    desc: 'CognitiveInt runs a realistic 4-agent interview with follow-ups and probes.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
  },
  {
    num: '3',
    title: 'Receive Fingerprint',
    desc: 'Get your 5-axis Reasoning Fingerprint with weak spots identified.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a48.667 48.667 0 00-1.221 8.023M14.122 4.975A7.5 7.5 0 004.5 10.5c0 2.396.42 4.698 1.19 6.836M16.016 6.098a7.464 7.464 0 011.484 4.402c0 2.138-.38 4.19-1.076 6.091M12 10.5a2.25 2.25 0 10-4.5 0 2.25 2.25 0 004.5 0z" />
      </svg>
    ),
  },
  {
    num: '4',
    title: 'SocraticMind Teaches',
    desc: 'Targeted Socratic teaching on your exact weak spots — never gives answers.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
      </svg>
    ),
  },
  {
    num: '5',
    title: 'Retest & Grow',
    desc: 'Re-interview on the same topics. Watch your radar chart evolve.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
];

export default function StepFlowSection() {
  return (
    <section className="section-padding relative" id="how-it-works">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm text-cyan uppercase tracking-widest mb-3 font-medium">The Flow</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            How It <span className="text-gradient">Works</span>
          </h2>
        </div>

        {/* Desktop: horizontal flow */}
        <div className="hidden lg:block">
          <div className="relative flex items-start justify-between">
            {/* Connecting line */}
            <div className="absolute top-10 left-[10%] right-[10%] h-px">
              <div className="w-full h-full bg-gradient-to-r from-violet via-cyan to-violet opacity-30" />
              {/* Animated pulse traveling along the line */}
              <div
                className="absolute top-0 h-px w-24 bg-gradient-to-r from-transparent via-violet-light to-transparent"
                style={{
                  animation: 'flowPulse 4s ease-in-out infinite',
                }}
              />
            </div>

            {steps.map((step, i) => (
              <div
                key={step.num}
                className="relative flex flex-col items-center text-center w-1/5 group"
              >
                {/* Step circle */}
                <div className="relative z-10 w-20 h-20 rounded-2xl glass-card flex items-center justify-center mb-6 group-hover:glass-card-hover transition-all duration-300">
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-violet text-white text-xs font-bold flex items-center justify-center">
                    {step.num}
                  </div>
                  <div className="text-violet-light group-hover:text-cyan-light transition-colors">
                    {step.icon}
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-text-primary mb-2 group-hover:text-violet-light transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed max-w-[160px]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: vertical flow */}
        <div className="lg:hidden space-y-6">
          {steps.map((step, i) => (
            <div key={step.num} className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-xl glass-card flex items-center justify-center">
                  <div className="text-violet-light">{step.icon}</div>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-violet text-white text-xs font-bold flex items-center justify-center">
                  {step.num}
                </div>
                {i < steps.length - 1 && (
                  <div className="absolute top-14 left-1/2 -translate-x-1/2 w-px h-6 bg-gradient-to-b from-violet/40 to-transparent" />
                )}
              </div>
              <div className="pt-2">
                <h3 className="text-sm font-semibold text-text-primary mb-1">{step.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes flowPulse {
          0% { left: -10%; }
          100% { left: 110%; }
        }
      `}</style>
    </section>
  );
}
