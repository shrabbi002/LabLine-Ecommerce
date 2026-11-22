import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { Menu, X, Shield, LogOut, Compass, Home, Info, Mail, ArrowUpRight, Sparkles } from 'lucide-react';

const navLinks = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Products', path: '/items', icon: Compass },
  { name: 'About', path: '/about', icon: Info },
  { name: 'Contact', path: '/contact', icon: Mail },
];

const Logo = ({ websiteName, size = 'md' }) => (
  <span className="flex items-center gap-2.5 group">
    <span
      className={`relative ${size === 'md' ? 'w-9 h-9' : 'w-8 h-8'} rounded-xl bg-gradient-to-tr from-primary-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-600/30 transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110`}
    >
      <span className="absolute inset-0 rounded-xl bg-gradient-to-tr from-primary-600 to-cyan-400 blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
      <span className="relative font-display">{websiteName ? websiteName.charAt(0).toUpperCase() : 'S'}</span>
    </span>
    <span className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">{websiteName}</span>
  </span>
);

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { websiteName } = useSite();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });
  const linkRefs = useRef({});
  const location = useLocation();
  const navigate = useNavigate();

  const activePath = navLinks.find((l) =>
    l.path === '/' ? location.pathname === '/' : location.pathname.startsWith(l.path)
  )?.path;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 20);
      setProgress(max > 0 ? Math.min(y / max, 1) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Slide the active pill under the current link
  useLayoutEffect(() => {
    const update = () => {
      const el = activePath && linkRefs.current[activePath];
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth, visible: true });
      else setIndicator((s) => ({ ...s, visible: false }));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [activePath, websiteName]);

  useEffect(() => setIsOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-50 px-3 sm:px-6 pt-3 animate-slide-down">
        <nav
          className={`relative max-w-7xl mx-auto rounded-2xl transition-all duration-500 ${
            scrolled
              ? 'glass shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)]'
              : 'bg-transparent border border-transparent'
          }`}
        >
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-5">
            <Link to="/" className="flex-shrink-0">
              <Logo websiteName={websiteName} />
            </Link>

            {/* Desktop links with sliding indicator */}
            <div className="hidden md:flex relative items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span
                className="absolute top-1 bottom-1 rounded-lg bg-gradient-to-r from-primary-600/80 to-indigo-600/80 shadow-lg shadow-primary-600/30 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ left: indicator.left, width: indicator.width, opacity: indicator.visible ? 1 : 0 }}
              />
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  ref={(el) => (linkRefs.current[link.path] = el)}
                  to={link.path}
                  className={`relative z-10 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                    activePath === link.path ? 'text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Link to="/admin/dashboard" className="btn-primary px-4 py-2 text-sm">
                    <Shield className="w-4 h-4" /> Admin
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-300"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <Link to="/contact" className="btn-ghost px-4 py-2 text-sm group">
                  Let's talk
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
              aria-label="Toggle menu"
            >
              <span className={`absolute transition-all duration-300 ${isOpen ? 'rotate-90 opacity-0 scale-50' : 'opacity-100'}`}>
                <Menu className="w-5 h-5" />
              </span>
              <span className={`absolute transition-all duration-300 ${isOpen ? 'opacity-100' : '-rotate-90 opacity-0 scale-50'}`}>
                <X className="w-5 h-5" />
              </span>
            </button>
          </div>

          {/* Scroll progress */}
          <div className="absolute left-4 right-4 -bottom-px h-px overflow-hidden rounded-full">
            <div
              className="h-full bg-gradient-to-r from-primary-500 via-cyan-400 to-fuchsia-500 origin-left transition-transform duration-150"
              style={{ transform: `scaleX(${progress})`, opacity: scrolled ? 1 : 0 }}
            />
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <div className={`md:hidden fixed inset-0 z-[60] ${isOpen ? 'visible' : 'invisible'}`}>
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsOpen(false)}
        />
        <div
          className={`absolute top-3 right-3 left-3 rounded-3xl glass bg-[#0b0d1a]/90 p-5 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top-right ${
            isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <Link to="/" onClick={() => setIsOpen(false)}>
              <Logo websiteName={websiteName} size="sm" />
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white bg-white/5 border border-white/10"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1.5">
            {navLinks.map((link, i) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-4 rounded-2xl text-base font-medium transition-all duration-500 ${
                  isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'
                } ${
                  activePath === link.path
                    ? 'bg-gradient-to-r from-primary-600/30 to-indigo-600/10 text-white border border-primary-500/30'
                    : 'text-slate-300 hover:bg-white/5 border border-transparent'
                }`}
                style={{ transitionDelay: isOpen ? `${120 + i * 60}ms` : '0ms' }}
              >
                <span className="flex items-center gap-3">
                  <link.icon className="w-5 h-5 text-primary-400" />
                  {link.name}
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </Link>
            ))}
          </div>

          <div className="mt-5 pt-5 border-t border-white/10 space-y-2.5">
            {isAuthenticated ? (
              <>
                <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="btn-primary w-full py-3 text-sm">
                  <Shield className="w-4 h-4" /> Admin Panel
                </Link>
                <button
                  onClick={() => { setIsOpen(false); handleLogout(); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/20"
                >
                  <LogOut className="w-4 h-4" /> Sign out ({user?.name})
                </button>
              </>
            ) : (
              <Link to="/contact" onClick={() => setIsOpen(false)} className="btn-primary w-full py-3 text-sm">
                <Sparkles className="w-4 h-4" /> Start a project
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
