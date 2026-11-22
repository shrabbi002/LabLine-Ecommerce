import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import api from '../api';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FileText,
  Mail,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
  ChevronRight,
  Bell
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { websiteName } = useSite();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Fetch unread messages count for the badge
  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/contact?limit=1');
      if (res.data.success) {
        setUnreadMessages(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Silently fail if network/auth issue
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Poll unread messages periodically
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    {
      title: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      match: ['/admin', '/admin/dashboard'],
    },
    {
      title: 'Products / Items',
      path: '/admin/items',
      icon: Package,
      match: ['/admin/items'],
    },
    {
      title: 'Add New Product',
      path: '/admin/items/new',
      icon: PlusCircle,
      match: ['/admin/items/new'],
    },
    {
      title: 'Page Content',
      path: '/admin/content',
      icon: FileText,
      match: ['/admin/content'],
    },
    {
      title: 'Inbox Messages',
      path: '/admin/messages',
      icon: Mail,
      badge: unreadMessages > 0 ? unreadMessages : null,
      match: ['/admin/messages'],
    },
    {
      title: 'Settings',
      path: '/admin/settings',
      icon: Settings,
      match: ['/admin/settings'],
    },
  ];

  const isCurrentActive = (item) => {
    if (item.match) {
      return item.match.some((m) => location.pathname === m);
    }
    return location.pathname === item.path;
  };

  // Determine current page title
  const getCurrentTitle = () => {
    if (location.pathname === '/admin' || location.pathname === '/admin/dashboard') return 'Dashboard';
    if (location.pathname === '/admin/items/new') return 'New Product';
    if (location.pathname.includes('/edit')) return 'Edit Product';
    if (location.pathname.startsWith('/admin/items')) return 'Product Inventory';
    if (location.pathname.startsWith('/admin/content')) return 'Page Content Editor';
    if (location.pathname.startsWith('/admin/messages')) return 'Customer Messages';
    if (location.pathname.startsWith('/admin/settings')) return 'System Settings';
    return 'Admin Portal';
  };

  return (
    <div className="admin-shell h-screen bg-slate-950 text-slate-100 flex overflow-hidden relative">
      <div className="pointer-events-none fixed -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary-600/10 blur-[140px] animate-aurora" />
      <div className="pointer-events-none fixed -bottom-40 left-40 w-[500px] h-[500px] rounded-full bg-cyan-500/[0.06] blur-[140px] animate-aurora" style={{ animationDelay: '-9s' }} />
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── SIDEBAR ─── */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#080a16]/90 backdrop-blur-2xl border-r border-white/[0.06] flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 md:h-18 flex items-center justify-between px-6 border-b border-white/[0.06]">
          <Link to="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-600/40 group-hover:scale-110 group-hover:rotate-[8deg] transition-transform duration-500">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white tracking-wide block leading-tight text-base group-hover:text-primary-400 transition-colors">
                {websiteName || 'Store'}
              </span>
              <span className="text-[11px] font-semibold tracking-wider text-primary-400 uppercase">
                Admin Panel
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Management
          </div>
          {navItems.map((item, idx) => {
            const active = isCurrentActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{ animationDelay: `${idx * 50}ms` }}
                className={`relative flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-300 group animate-slide-up ${
                  active
                    ? 'bg-gradient-to-r from-primary-600/90 to-indigo-600/70 text-white font-semibold shadow-lg shadow-primary-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] hover:translate-x-1'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      active ? 'text-white' : 'text-slate-400 group-hover:text-primary-400'
                    }`}
                  />
                  <span>{item.title}</span>
                </div>
                {item.badge ? (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white shadow-sm animate-pulse">
                    {item.badge}
                  </span>
                ) : active ? (
                  <ChevronRight className="w-4 h-4 text-white/70" />
                ) : null}
              </Link>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Live Preview
          </div>
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] transition-all duration-300 group border border-dashed border-white/10 hover:border-emerald-400/40"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              <span>View Public Store</span>
            </div>
            <span className="text-xs text-slate-500 group-hover:text-slate-400">Open ↗</span>
          </Link>
        </div>

        {/* Sidebar Footer / User Profile */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center justify-between gap-3 p-2 rounded-xl glass">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate leading-tight">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email || 'admin'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors flex-shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN APP AREA ─── */}
      <div className="relative flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 md:h-18 bg-[#080a16]/60 backdrop-blur-2xl border-b border-white/[0.06] px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 key={location.pathname} className="text-base sm:text-lg font-bold text-white tracking-tight animate-slide-down">
                {getCurrentTitle()}
              </h1>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
                <span>Admin</span>
                <span>/</span>
                <span className="text-primary-400 font-medium">{getCurrentTitle()}</span>
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/admin/messages"
              className="relative p-2.5 rounded-xl glass text-slate-300 hover:text-white hover:-translate-y-0.5 transition-all duration-300"
              title="Inbox Messages"
            >
              <Bell className="w-4 h-4" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 ring-2 ring-[#080a16] animate-bounce text-white text-[10px] font-bold flex items-center justify-center shadow">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </Link>

            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold glass text-slate-300 hover:text-white hover:-translate-y-0.5 transition-all duration-300"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Store</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-950/40 border border-rose-900/60 text-rose-300 hover:bg-rose-900/50 transition-colors duration-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto">
          <div key={location.pathname} className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 page-enter">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
