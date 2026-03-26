import { useEffect, useRef } from 'react';

const agents = [
  { id: 'jd', label: 'JD Parser', color: '#6B7280', group: 'input' },
  { id: 'transcriber', label: 'Transcriber', color: '#7C3AED', group: 'cogint' },
  { id: 'verifier', label: 'Verifier', color: '#7C3AED', group: 'cogint' },
  { id: 'profiler', label: 'Profiler', color: '#7C3AED', group: 'cogint' },
  { id: 'strategist', label: 'Strategist', color: '#7C3AED', group: 'cogint' },
  { id: 'kg', label: 'KG Navigator', color: '#06B6D4', group: 'socratic' },
  { id: 'pedagogy', label: 'Pedagogy Selector', color: '#06B6D4', group: 'socratic' },
  { id: 'teacher', label: 'Socratic Teacher', color: '#06B6D4', group: 'socratic' },
  { id: 'detector', label: 'Engagement Detector', color: '#06B6D4', group: 'socratic' },
  { id: 'fingerprint', label: 'Reasoning Fingerprint', color: '#10B981', group: 'output' },
];

const edges = [
  ['jd', 'transcriber'],
  ['transcriber', 'verifier'],
  ['verifier', 'profiler'],
  ['profiler', 'strategist'],
  ['profiler', 'fingerprint'],
  ['strategist', 'transcriber'],
  ['fingerprint', 'kg'],
  ['kg', 'pedagogy'],
  ['pedagogy', 'teacher'],
  ['teacher', 'detector'],
  ['detector', 'transcriber'],
];

export default function SolutionSection() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Layout positions
    const getPositions = (w, h) => {
      const mx = w * 0.5;
      return {
        jd:           { x: mx, y: h * 0.04 },
        transcriber:  { x: mx - w * 0.2, y: h * 0.14 },
        verifier:     { x: mx - w * 0.2, y: h * 0.26 },
        profiler:     { x: mx - w * 0.2, y: h * 0.38 },
        strategist:   { x: mx - w * 0.2, y: h * 0.50 },
        fingerprint:  { x: mx + w * 0.15, y: h * 0.38 },
        kg:           { x: mx + w * 0.2, y: h * 0.56 },
        pedagogy:     { x: mx + w * 0.2, y: h * 0.68 },
        teacher:      { x: mx + w * 0.2, y: h * 0.80 },
        detector:     { x: mx + w * 0.2, y: h * 0.92 },
      };
    };

    const draw = () => {
      time += 0.008;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const pos = getPositions(w, h);

      // Draw edges
      edges.forEach(([from, to], idx) => {
        const p1 = pos[from];
        const p2 = pos[to];
        if (!p1 || !p2) return;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        // Slight curve
        const cpx = (p1.x + p2.x) / 2 + (p2.y - p1.y) * 0.15;
        const cpy = (p1.y + p2.y) / 2;
        ctx.quadraticCurveTo(cpx, cpy, p2.x, p2.y);
        ctx.strokeStyle = `rgba(124, 58, 237, ${0.15 + Math.sin(time + idx) * 0.08})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.lineDashOffset = -time * 30 + idx * 5;
        ctx.stroke();
        ctx.setLineDash([]);

        // Traveling particle
        const t = (Math.sin(time * 1.5 + idx * 0.7) + 1) / 2;
        const px = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * cpx + t * t * p2.x;
        const py = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * cpy + t * t * p2.y;
        const isViolet = agents.find(a => a.id === from)?.group === 'cogint';
        const particleColor = isViolet ? '#7C3AED' : '#06B6D4';
        
        const grad = ctx.createRadialGradient(px, py, 0, px, py, 6);
        grad.addColorStop(0, particleColor);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw nodes
      agents.forEach((agent) => {
        const p = pos[agent.id];
        if (!p) return;

        const nodeW = 120;
        const nodeH = 30;
        const rx = 8;

        // Glow
        ctx.shadowColor = agent.color;
        ctx.shadowBlur = 12 + Math.sin(time * 2) * 4;

        // Background
        ctx.fillStyle = 'rgba(22, 22, 31, 0.9)';
        ctx.beginPath();
        ctx.roundRect(p.x - nodeW / 2, p.y - nodeH / 2, nodeW, nodeH, rx);
        ctx.fill();

        // Border
        ctx.strokeStyle = agent.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(p.x - nodeW / 2, p.y - nodeH / 2, nodeW, nodeH, rx);
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Text
        ctx.fillStyle = '#F9FAFB';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(agent.label, p.x, p.y);
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section className="section-padding relative" id="solution">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm text-cyan uppercase tracking-widest mb-3 font-medium">The Solution</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Two Systems.{' '}
            <span className="text-gradient">One Loop.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Description */}
          <div className="space-y-8">
            {/* CognitiveInt */}
            <div className="glass-card p-6 hover:glass-card-hover group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-violet/15 flex items-center justify-center">
                  <svg className="w-5 h-5 text-violet-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-violet-light">CognitiveInt</h3>
              </div>
              <p className="text-text-muted text-sm leading-relaxed">
                Interviews you through a <span className="text-text-primary font-medium">4-agent pipeline</span>. Builds your live Reasoning Fingerprint. Follows your uploaded JD, not a generic syllabus.
              </p>
            </div>

            {/* SocraticMind */}
            <div className="glass-card p-6 hover:glass-card-hover group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyan/15 flex items-center justify-center">
                  <svg className="w-5 h-5 text-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-cyan">SocraticMind</h3>
              </div>
              <p className="text-text-muted text-sm leading-relaxed">
                Receives your fingerprint directly. Teaches your exact weak spots through <span className="text-text-primary font-medium">questions and analogies</span> — never by handing you answers.
              </p>
            </div>

            {/* Tagline */}
            <div className="flex items-center gap-3 pl-2">
              {['Diagnose', 'Teach', 'Validate', 'Repeat'].map((step, i) => (
                <span key={step} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gradient">{step}</span>
                  {i < 3 && (
                    <svg className="w-4 h-4 text-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Animated pipeline diagram */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-violet/5 to-cyan/5 blur-xl pointer-events-none" />
            <div className="glass-card p-4 relative">
              <canvas
                ref={canvasRef}
                className="w-full rounded-xl"
                style={{ height: '520px', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
