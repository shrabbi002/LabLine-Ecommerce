import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  FolderOpen,
  Mail,
  Edit,
  Settings,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle,
  FileText,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalItems: 0,
    activeItems: 0,
    draftItems: 0,
    totalMessages: 0,
    unreadMessages: 0,
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Fetch all items (to count status categories)
        const itemsRes = await api.get('/items?limit=100'); // fetch a batch to parse counts
        let totalItems = 0;
        let activeItems = 0;
        let draftItems = 0;
        
        if (itemsRes.data.success) {
          const items = itemsRes.data.data || [];
          totalItems = itemsRes.data.pagination?.total || items.length;
          // Count active vs drafts in the current fetch (approximate or precise if under limit)
          items.forEach((item) => {
            if (item.status === 'active') activeItems++;
            else if (item.status === 'draft') draftItems++;
          });
          // If total is larger than limit, we adjust counts
          if (itemsRes.data.pagination?.total > items.length) {
            // Retrieve actual counts via separate query if database gets large
            const activeRes = await api.get('/items?status=active&limit=1');
            const draftRes = await api.get('/items?status=draft&limit=1');
            activeItems = activeRes.data.pagination?.total || 0;
            draftItems = draftRes.data.pagination?.total || 0;
          }
        }

        // Fetch contact messages
        const msgRes = await api.get('/contact?limit=5');
        let totalMessages = 0;
        let unreadMessages = 0;
        let msgList = [];

        if (msgRes.data.success) {
          totalMessages = msgRes.data.pagination?.total || 0;
          unreadMessages = msgRes.data.unreadCount || 0;
          msgList = msgRes.data.data || [];
        }

        setStats({
          totalItems,
          activeItems,
          draftItems,
          totalMessages,
          unreadMessages,
        });
        setRecentMessages(msgList.slice(0, 3)); // show top 3
      } catch (err) {
        console.error('Error fetching dashboard stats:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  const shortcuts = [
    {
      title: 'Item Manager',
      desc: 'Create, update, toggle statuses, and delete product listings.',
      path: '/admin/items',
      icon: FolderOpen,
      color: 'from-blue-600 to-sky-500 shadow-blue-500/10',
    },
    {
      title: 'Content Editor',
      desc: 'Edit dynamic sections for Home, About, and Contact layouts.',
      path: '/admin/content',
      icon: Edit,
      color: 'from-violet-600 to-fuchsia-500 shadow-violet-500/10',
    },
    {
      title: 'Messages Inbox',
      desc: 'Review, delete, and mark read client form submissions.',
      path: '/admin/messages',
      icon: Mail,
      color: 'from-emerald-600 to-teal-500 shadow-emerald-500/10',
      badge: stats.unreadMessages > 0 ? stats.unreadMessages : null,
    },
    {
      title: 'Site Settings',
      desc: 'Alter titles, branding graphics, and update passwords.',
      path: '/admin/settings',
      icon: Settings,
      color: 'from-amber-600 to-orange-500 shadow-amber-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium tracking-wide">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard Overview</h1>
            <p className="text-slate-400 text-sm mt-1">
              Welcome back, <span className="text-primary-400 font-semibold">{user?.name}</span>. Manage your platform contents here.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl font-medium self-start md:self-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Platform Connected
          </div>
        </div>

        {/* Stats Grid cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total items count */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex items-center gap-4 shadow-lg shadow-slate-950/20">
            <div className="w-12 h-12 rounded-xl bg-blue-950/50 border border-blue-900/30 flex items-center justify-center text-blue-400">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Items</div>
              <div className="text-2xl font-extrabold text-white mt-0.5">{stats.totalItems}</div>
            </div>
          </div>

          {/* Active listings count */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex items-center gap-4 shadow-lg shadow-slate-950/20">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/50 border border-emerald-900/30 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Active Listings</div>
              <div className="text-2xl font-extrabold text-white mt-0.5">{stats.activeItems}</div>
            </div>
          </div>

          {/* Draft listings count */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex items-center gap-4 shadow-lg shadow-slate-950/20">
            <div className="w-12 h-12 rounded-xl bg-amber-950/50 border border-amber-900/30 flex items-center justify-center text-amber-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Draft Catalog</div>
              <div className="text-2xl font-extrabold text-white mt-0.5">{stats.draftItems}</div>
            </div>
          </div>

          {/* Unread inbox count */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex items-center gap-4 shadow-lg shadow-slate-950/20">
            <div className="w-12 h-12 rounded-xl bg-violet-950/50 border border-violet-900/30 flex items-center justify-center text-violet-400">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Unread Messages</div>
              <div className="text-2xl font-extrabold text-white mt-0.5">
                {stats.unreadMessages} <span className="text-slate-500 text-sm font-normal">/ {stats.totalMessages}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mid-Row split: Shortcut Cards & Recent Inquiries */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left panel: Quick Actions Grid */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-xl font-bold text-white border-b border-slate-900 pb-3">Administrative Hub</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {shortcuts.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={idx}
                    to={card.path}
                    className="group bg-slate-900 border border-slate-850 hover:border-slate-700/50 p-6 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl flex flex-col justify-between h-48 relative overflow-hidden"
                  >
                    {/* Background icon glow decoration */}
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-5 text-slate-500 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                      <Icon className="w-36 h-36" />
                    </div>

                    <div className="space-y-3 relative z-10">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-md relative`}>
                        <Icon className="w-5 h-5" />
                        {card.badge && (
                          <div className="absolute -top-1.5 -right-1.5 px-2 py-0.5 bg-rose-500 text-white rounded-full text-[9px] font-black border border-slate-900 animate-pulse">
                            {card.badge}
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-100 group-hover:text-primary-400 transition-colors duration-300">
                        {card.title}
                      </h3>
                      <p className="text-slate-400 text-xs leading-relaxed max-w-sm">{card.desc}</p>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-primary-400 group-hover:text-primary-300 mt-4">
                      <span>Open Workspace</span> <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right panel: Recent messages inbox quick look */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h2 className="text-xl font-bold text-white">Recent Feedback</h2>
              <Link to="/admin/messages" className="text-xs text-primary-400 hover:text-primary-300 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {recentMessages.length > 0 ? (
                recentMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`bg-slate-900/60 border ${
                      msg.read ? 'border-slate-850' : 'border-primary-500/20 shadow-sm shadow-primary-500/5'
                    } p-4 rounded-xl space-y-2 relative overflow-hidden`}
                  >
                    {!msg.read && (
                      <div className="absolute top-0 right-0 w-2 h-full bg-primary-500"></div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200 line-clamp-1">{msg.name}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-400 line-clamp-1">{msg.subject}</div>
                    <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed">{msg.message}</p>
                  </div>
                ))
              ) : (
                <div className="bg-slate-900/30 border border-slate-850 p-8 rounded-xl text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                  <Mail className="w-8 h-8 text-slate-700" />
                  <span>No messages received yet.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
