import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';

const AXES = [
  'Conceptual Depth',
  'Confidence Accuracy',
  'Consistency',
  'Technical Accuracy',
  'Surface Knowledge',
];

export default function HeroSection() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const handleCTA = (cred) => {
    if (cred) {
      login(cred);
      navigate('/dashboard');
    }
  };

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

    const draw = () => {
      time += 0.005;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(w, h) * 0.38;

      ctx.clearRect(0, 0, w, h);

      // Grid rings
      for (let ring = 1; ring <= 5; ring++) {
        const r = (maxR / 5) * ring;
        ctx.beginPath();
        for (let i = 0; i <= 5; i++) {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(124, 58, 237, ${0.06 + ring * 0.03})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Axis lines
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + maxR * Math.cos(angle), cy + maxR * Math.sin(angle));
        ctx.strokeStyle = 'rgba(124, 58, 237, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Axis labels
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = 'rgba(107, 114, 128, 0.8)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const labelR = maxR + 24;
        const x = cx + labelR * Math.cos(angle);
        const y = cy + labelR * Math.sin(angle);
        ctx.fillText(AXES[i], x, y);
      }

      // Morphing data polygon
      const baseValues = [0.72, 0.58, 0.85, 0.64, 0.91];
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const morph = Math.sin(time * 2 + i * 1.3) * 0.12;
        const val = baseValues[i] + morph;
        const r = maxR * Math.max(0.15, Math.min(1, val));
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(124, 58, 237, 0.12)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(124, 58, 237, 0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Second overlay polygon (cyan)
      ctx.beginPath();
      const secondValues = [0.55, 0.75, 0.62, 0.80, 0.48];
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const morph = Math.sin(time * 1.5 + i * 0.9 + 2) * 0.1;
        const val = secondValues[i] + morph;
        const r = maxR * Math.max(0.15, Math.min(1, val));
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Data points glow
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const morph = Math.sin(time * 2 + i * 1.3) * 0.12;
        const val = baseValues[i] + morph;
        const r = maxR * Math.max(0.15, Math.min(1, val));
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);

        // Glow
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 8);
        grad.addColorStop(0, 'rgba(124, 58, 237, 0.8)');
        grad.addColorStop(1, 'rgba(124, 58, 237, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Dot
        ctx.fillStyle = '#7C3AED';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/10 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan/8 rounded-full blur-3xl animate-pulse-glow pointer-events-none" style={{ animationDelay: '1.5s' }} />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left: Text */}
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs text-violet-light mb-6 tracking-wide">
            <span className="w-2 h-2 bg-violet rounded-full animate-pulse" />
            AI-Powered Interview Intelligence
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight">
            Most interview tools score your answers.{' '}
            <span className="text-gradient">We map how you think.</span>
          </h1>

          <p className="text-lg text-text-muted leading-relaxed mb-10 max-w-xl">
            AI-powered interview intelligence that diagnoses your reasoning gaps,
            teaches you through Socratic dialogue, and retests until you actually
            improve.
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3.5 bg-violet hover:bg-violet-light text-white font-semibold rounded-xl transition-all duration-200 glow-violet hover:scale-105"
              >
                Go to Dashboard →
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <GoogleLogin
                  onSuccess={handleCTA}
                  onError={() => console.log('Login failed')}
                  theme="filled_black"
                  shape="pill"
                  size="large"
                  text="continue_with"
                  width="240"
                />
                <span className="text-text-dim text-sm">to start a free interview</span>
              </div>
            )}
            <a
              href="https://youtu.be/qjmvTvoc8v4"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-3.5 border border-border hover:border-violet/40 text-text-muted hover:text-text-primary rounded-xl transition-all duration-200 flex items-center gap-2 group"
            >
              <svg className="w-5 h-5 text-violet-light group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch Demo
            </a>
          </div>
        </div>

        {/* Right: Animated radar chart */}
        <div className="relative flex justify-center animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
          <div className="relative w-full aspect-square max-w-lg">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet/5 to-cyan/5 blur-xl" />
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ display: 'block' }}
            />
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-xs text-text-dim uppercase tracking-widest">Live</p>
                <p className="text-sm font-semibold text-gradient">Reasoning Fingerprint</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-primary to-transparent pointer-events-none" />
    </section>
  );
}
