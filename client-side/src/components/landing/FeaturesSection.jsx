import { useState } from 'react';

const tabs = [
  {
    id: 'cognitiveint',
    label: 'CognitiveInt',
    accent: 'violet',
    features: [
      {
        title: 'Reasoning Fingerprint',
        desc: 'A live 5-axis radar chart that evolves with every answer — Conceptual Depth, Confidence Accuracy, Consistency, Technical Accuracy, Surface Knowledge.',
        icon: '🧬',
      },
      {
        title: 'JD-Aware Questioning',
        desc: "Upload your JD PDF. The AI parses required topics and steers the interview accordingly — no generic question banks.",
        icon: '🎯',
      },
      {
        title: 'Realistic Interviewer Behavior',
        desc: "Follow-ups, clarification requests, silence — the AI mirrors how real interviewers probe for depth, not just correctness.",
        icon: '🎭',
      },
      {
        title: 'JD Coverage Map',
        desc: 'End-of-session visual breakdown of which JD topics were covered and where your gaps remain.',
        icon: '📊',
      },
    ],
  },
  {
    id: 'socraticmind',
    label: 'SocraticMind',
    accent: 'cyan',
    features: [
      {
        title: 'Zero Cold-Start',
        desc: 'SocraticMind receives the Reasoning Fingerprint directly, skipping re-diagnosis. It knows your gaps before the first question.',
        icon: '⚡',
      },
      {
        title: 'Never Gives Direct Answers',
        desc: 'Enforced at the system prompt level. Teaches through questions, analogies, and counter-examples — Socratic method, not spoon-feeding.',
        icon: '🔒',
      },
      {
        title: 'Engagement Detection',
        desc: "A fine-tuned DistilBERT model detects whether you're genuinely understanding or just saying 'got it' to move on.",
        icon: '🧠',
      },
      {
        title: 'Adaptive Teaching Strategy',
        desc: 'Contextual Bandit RL selects the optimal pedagogy (analogy, worked example, leading question) based on your cognitive profile.',
        icon: '🔄',
      },
    ],
  },
];

export default function FeaturesSection() {
  const [activeTab, setActiveTab] = useState('cognitiveint');
  const currentTab = tabs.find((t) => t.id === activeTab);

  return (
    <section className="section-padding relative" id="features">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm text-violet-light uppercase tracking-widest mb-3 font-medium">Capabilities</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            What's <span className="text-gradient">Inside</span>
          </h2>
        </div>

        {/* Tab buttons */}
        <div className="flex justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? tab.accent === 'violet'
                    ? 'bg-violet/20 text-violet-light border border-violet/30 glow-violet'
                    : 'bg-cyan/20 text-cyan-light border border-cyan/30 glow-cyan'
                  : 'text-text-muted hover:text-text-primary border border-transparent hover:border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-2 gap-6" key={activeTab}>
          {currentTab.features.map((f, i) => (
            <div
              key={f.title}
              className="glass-card p-6 hover:glass-card-hover group animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </span>
                <div>
                  <h3 className={`text-lg font-semibold mb-2 transition-colors ${
                    currentTab.accent === 'violet' ? 'group-hover:text-violet-light' : 'group-hover:text-cyan-light'
                  }`}>
                    {f.title}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
