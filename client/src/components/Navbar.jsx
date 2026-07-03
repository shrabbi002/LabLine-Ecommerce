import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { Menu, X, Shield, LogOut, Compass, Home, Info, Mail, ChevronRight } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { websiteName } = useSite();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Track scroll for navbar glass effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Products', path: '/items', icon: Compass },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/60 shadow-lg shadow-slate-950/50'
            : 'bg-slate-950/60 backdrop-blur-md border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 group-hover:scale-105 transition-all duration-300">
                {websiteName ? websiteName.charAt(0).toUpperCase() : 'S'}
              </div>
              <span className="text-lg sm:text-xl font-bold text-white group-hover:text-primary-400 transition-colors duration-300">
                {websiteName}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive(link.path)
                      ? 'bg-primary-500/10 text-primary-400 shadow-sm border border-primary-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Desktop Right Section */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-2 border-l border-slate-800/60 pl-4 ml-2">
                  <Link
                    to="/admin/dashboard"
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      location.pathname.startsWith('/admin')
                        ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-500/20'
                        : 'border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 bg-slate-900/30'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-all duration-300"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/admin/login"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl border border-slate-800/60 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-white/5 transition-all duration-300"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300"
              aria-label="Toggle menu"
            >
              <span className={`absolute transition-all duration-300 ${isOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}>
                <Menu className="w-5 h-5" />
              </span>
              <span className={`absolute transition-all duration-300 ${isOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`}>
                <X className="w-5 h-5" />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay + Drawer */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${
          isOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsOpen(false)}
        />

        {/* Slide-in Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-slate-900 border-l border-slate-800/60 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800/60">
            <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                {websiteName ? websiteName.charAt(0).toUpperCase() : 'S'}
              </div>
              <span className="text-lg font-bold text-white">
                {websiteName}
              </span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Navigation Links */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </Link>
            ))}
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-slate-800/60 space-y-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-500/20 transition-all duration-300"
                >
                  <Shield className="w-5 h-5" />
                  Admin Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold bg-rose-950/30 border border-rose-900/50 text-rose-400 hover:text-rose-300 transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out ({user?.name})
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 bg-slate-800/30 transition-all duration-200"
              >
                <Shield className="w-5 h-5" />
                Admin Portal
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
