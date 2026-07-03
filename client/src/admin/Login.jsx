import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';

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
    <div className="bg-slate-950 min-h-screen text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] aspect-square rounded-full bg-primary-600/10 blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center space-y-3">
          {/* Logo brand icon */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/20 mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Admin Portal</h2>
          <p className="text-slate-400 text-sm">Sign in to manage items, pages content, and inbox messages.</p>
        </div>

        {/* Login Form Box */}
        <div className="bg-slate-900 border border-slate-800/80 p-8 rounded-3xl shadow-2xl space-y-6">
          {/* Notice & Error Banners */}
          {noticeMsg && (
            <div className="p-3 bg-amber-950/60 border border-amber-800 text-amber-400 rounded-xl flex items-start gap-2.5 text-xs font-semibold animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{noticeMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-400 rounded-xl flex items-start gap-2.5 text-xs font-semibold animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Username */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Username or Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="shrabbi or admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl text-slate-200 text-sm placeholder-slate-650 focus:outline-none transition-all duration-300"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl text-slate-200 text-sm placeholder-slate-650 focus:outline-none transition-all duration-300"
                />
              </div>
            </div>

            {/* Login Action Trigger */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl text-sm transition-all duration-300 shadow-lg shadow-primary-600/10 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                'Secure Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Back Link to Public Site */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-350 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Product Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
