import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onOpenAuth }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass py-3 shadow-lg shadow-black/20'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet to-cyan flex items-center justify-center text-sm font-bold">
            C×S
          </div>
          <span className="text-lg font-semibold text-text-primary hidden sm:inline">
            Cognitive<span className="text-violet-light">Int</span>
            <span className="text-text-muted mx-1">×</span>
            <span className="text-cyan">SocraticMind</span>
          </span>
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-text-muted hover:text-text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-text-muted hover:text-text-primary transition-colors">How It Works</a>
          <a href="https://youtu.be/qjmvTvoc8v4" target="_blank" rel="noreferrer" className="text-sm text-text-muted hover:text-text-primary transition-colors">Demo</a>
        </div>

        {/* Auth area */}
        <div className="flex items-center gap-4">
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2 bg-violet hover:bg-violet-light text-white text-sm font-medium rounded-lg transition-all duration-200 glow-violet"
            >
              Dashboard
            </button>
          ) : (
            <div className="hidden md:block">
              <button
                onClick={onOpenAuth}
                className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 text-sm font-medium rounded-lg transition-all duration-200"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-text-muted hover:text-text-primary"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass mt-2 mx-4 rounded-xl p-4 space-y-3 animate-fade-in">
          <a href="#features" className="block text-sm text-text-muted hover:text-text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="block text-sm text-text-muted hover:text-text-primary transition-colors">How It Works</a>
          <a href="https://youtu.be/qjmvTvoc8v4" target="_blank" rel="noreferrer" className="block text-sm text-text-muted hover:text-text-primary transition-colors">Demo</a>
          {!user && (
            <div className="pt-2">
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileOpen(false);
                }}
                className="w-full px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 text-sm font-medium rounded-lg transition-all duration-200"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
