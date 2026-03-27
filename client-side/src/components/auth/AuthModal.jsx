import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }) {
  const [mode, setMode] = useState(defaultMode); // 'login' or 'signup'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  const passwordLengthValid = formData.password.length >= 8;
  const passwordHasUpper = /[A-Z]/.test(formData.password);
  const passwordHasNumber = /[0-9]/.test(formData.password);
  const isPasswordValid = passwordLengthValid && passwordHasUpper && passwordHasNumber;

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        await signup(formData.name, formData.email, formData.password);
      } else {
        await login(formData.email, formData.password);
      }
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (cred) => {
    try {
      await googleLogin(cred.credential);
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError('Google authentication failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-bg-primary/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Glow decoration */}
        <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-violet to-transparent opacity-50" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan/20 rounded-full blur-3xl pointer-events-none" />

        <div className="p-8 relative z-10">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-2xl font-bold text-white mb-2 text-center">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-text-muted text-sm text-center mb-8">
            {mode === 'login' 
              ? 'Enter your details to access your dashboard.' 
              : 'Start your journey with Cognitive Intelligence.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-text-dim focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/50 transition-all"
                  placeholder="John Doe"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-text-dim focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/50 transition-all"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-text-dim focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/50 transition-all"
                placeholder="••••••••"
              />
              {mode === 'signup' && formData.password.length > 0 && (
                <div className="mt-3 space-y-1.5 p-3 bg-black/20 rounded-lg border border-white/5">
                  <div className={`text-xs flex items-center gap-2 transition-colors ${passwordLengthValid ? 'text-green-400' : 'text-text-muted'}`}>
                    <span>{passwordLengthValid ? '✓' : '○'}</span> At least 8 characters
                  </div>
                  <div className={`text-xs flex items-center gap-2 transition-colors ${passwordHasUpper ? 'text-green-400' : 'text-text-muted'}`}>
                    <span>{passwordHasUpper ? '✓' : '○'}</span> One uppercase letter
                  </div>
                  <div className={`text-xs flex items-center gap-2 transition-colors ${passwordHasNumber ? 'text-green-400' : 'text-text-muted'}`}>
                    <span>{passwordHasNumber ? '✓' : '○'}</span> One number
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (mode === 'signup' && !isPasswordValid)}
              className="w-full py-3 px-4 bg-violet hover:bg-violet-light text-white font-semibold rounded-xl transition-all duration-200 glow-violet disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-bg-primary text-text-dim">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center flex-col items-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign in failed')}
              theme="filled_black"
              shape="rectangular"
              size="large"
              text={mode === 'login' ? 'signin_with' : 'signup_with'}
              width="100%"
            />
          </div>

          <p className="mt-8 text-center text-sm text-text-muted">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
              className="text-violet-light hover:text-white font-medium transition-colors"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
