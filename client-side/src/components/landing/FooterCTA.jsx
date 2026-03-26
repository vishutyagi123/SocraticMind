import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';

export default function FooterCTA() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const handleSuccess = (cred) => {
    login(cred);
    navigate('/dashboard');
  };

  return (
    <footer className="relative">
      {/* CTA Section */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Your next interviewer won't just check your answer.{' '}
            <span className="text-gradient">Neither do we.</span>
          </h2>

          <p className="text-text-muted mb-10 text-lg">
            Stop guessing. Start understanding how you think.
          </p>

          <div className="flex justify-center">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-10 py-4 bg-violet hover:bg-violet-light text-white font-semibold rounded-xl transition-all duration-200 glow-violet hover:scale-105 text-lg"
              >
                Go to Dashboard →
              </button>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={() => console.log('Login failed')}
                  theme="filled_black"
                  shape="pill"
                  size="large"
                  text="continue_with"
                  width="280"
                />
                <span className="text-text-dim text-sm">Start your free interview</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom footer */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet to-cyan flex items-center justify-center text-[10px] font-bold">
              C×S
            </div>
            <span className="text-sm text-text-muted">
              CognitiveInt × SocraticMind
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://youtu.be/qjmvTvoc8v4"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-text-dim hover:text-text-muted transition-colors"
            >
              Demo
            </a>
            <a
              href="https://github.com/Neelabh-Sharma/SocraticMind"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-text-dim hover:text-text-muted transition-colors"
            >
              GitHub
            </a>
            <span className="text-xs text-text-dim">
              © 2026 All rights reserved
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
