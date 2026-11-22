import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Aurora } from '../components/motion';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [noticeMsg, setNoticeMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Check if redirect parameters exist
  const from = location.state?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    // If user is already logged in, redirect directly to dashboard
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }

    // Display session expired warning if redirected from interceptor
    if (searchParams.get('expired') === 'true') {
      setNoticeMsg('Your session has expired or is invalid. Please sign in again.');
    }
  }, [isAuthenticated, navigate, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setNoticeMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMsg(result.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden noise">
      <Aurora />
      <div className="absolute inset-0 bg-grid pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center space-y-4 animate-slide-up">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary-600 to-cyan-400 blur-xl opacity-70 animate-pulse-subtle" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-2xl animate-float">
              <Shield className="w-7 h-7" />
            </div>
          </div>
          <h2 className="font-display text-4xl font-bold tracking-tight text-white">
            Admin <span className="text-gradient">Portal</span>
          </h2>
          <p className="text-slate-400 text-sm">Sign in to manage items, page content, and inbox messages.</p>
        </div>

        <div className="relative rounded-3xl border-animated animate-scale-in" style={{ animationDelay: '120ms' }}>
          <div className="glass bg-[#0b0d1a]/80 p-8 rounded-3xl shadow-2xl space-y-6">
            {noticeMsg && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl flex items-start gap-2.5 text-xs font-semibold animate-slide-down">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{noticeMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl flex items-start gap-2.5 text-xs font-semibold animate-slide-down">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2 text-left">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Username or Email</label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-300 transition-colors" />
                  <input
                    type="text"
                    placeholder="shrabbi or admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoComplete="username"
                    className="input-modern pl-11 pr-4 py-3.5"
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-300 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="current-password"
                    className="input-modern pl-11 pr-12 py-3.5"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-white transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm">
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Secure Sign In'
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="text-center animate-fade-in" style={{ animationDelay: '300ms' }}>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors group">
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Return to store
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
