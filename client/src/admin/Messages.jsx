import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  Mail,
  MailOpen,
  Trash2,
  CheckCircle,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  User,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Filtering and navigation states
  const [readFilter, setReadFilter] = useState(''); // '', 'true', 'false'
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [expandedId, setExpandedId] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        sort: '-createdAt', // newest messages first
      });

      if (readFilter) {
        queryParams.append('read', readFilter);
      }

      const res = await api.get(`/contact?${queryParams.toString()}`);
      if (res.data.success) {
        setMessages(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setErrorMsg('Failed to download inbox messages.');
      console.error('Messages fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page, readFilter]);

  // Mark read/unread click
  const handleToggleReadStatus = async (msg, e) => {
    if (e) e.stopPropagation(); // prevent modal trigger
    const targetStatus = !msg.read;
    try {
      const res = await api.put(`/contact/${msg._id}/read`, { read: targetStatus });
      if (res.data.success) {
        setMessages((prev) =>
          prev.map((m) => (m._id === msg._id ? { ...m, read: targetStatus } : m))
        );
      }
    } catch (err) {
      console.error('Failed to change message status:', err.message);
    }
  };

  // Expand and read message (auto-marks read)
  const handleExpandMessage = async (msg) => {
    if (expandedId === msg._id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(msg._id);

    // Auto mark read if unread
    if (!msg.read) {
      try {
        const res = await api.put(`/contact/${msg._id}/read`, { read: true });
        if (res.data.success) {
          setMessages((prev) =>
            prev.map((m) => (m._id === msg._id ? { ...m, read: true } : m))
          );
        }
      } catch (err) {
        console.error('Failed to auto mark message read:', err.message);
      }
    }
  };

  // Delete message click
  const handleDeleteMessage = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this contact inquiry?')) return;
    
    try {
      const res = await api.delete(`/contact/${id}`);
      if (res.data.success) {
        setMessages((prev) => prev.filter((m) => m._id !== id));
        if (expandedId === id) setExpandedId(null);
      }
    } catch (err) {
      console.error('Delete message failure:', err.message);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-5 gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Mail className="w-6 h-6 text-primary-500" /> Messages Inbox
            </h1>
            <p className="text-slate-400 text-xs">Review client inquires, mark states, and delete submissions.</p>
          </div>

          {/* Filtering dropdowns */}
          <div className="self-start sm:self-center">
            <select
              value={readFilter}
              onChange={(e) => {
                setReadFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-350 text-xs focus:outline-none focus:border-primary-500 transition-all duration-300"
            >
              <option value="">All Inquiries</option>
              <option value="false">Unread Inbox</option>
              <option value="true">Read Inbox</option>
            </select>
          </div>
        </div>

        {/* Error warnings */}
        {errorMsg && (
          <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-455 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Messaging Container */}
        {loading ? (
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-8 text-center space-y-4 animate-pulse">
            <div className="h-6 bg-slate-800 rounded w-1/4 mx-auto"></div>
            <div className="h-24 bg-slate-800 rounded w-full"></div>
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isExpanded = expandedId === msg._id;
              return (
                <div
                  key={msg._id}
                  onClick={() => handleExpandMessage(msg)}
                  className={`bg-slate-900 border ${
                    msg.read ? 'border-slate-850' : 'border-primary-500/35 shadow-md shadow-primary-500/5'
                  } rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-350 cursor-pointer text-left`}
                >
                  {/* Top Summary Bar */}
                  <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {/* Envelope status icons */}
                      <div className={`p-2 rounded-lg mt-0.5 sm:mt-0 ${
                        msg.read ? 'bg-slate-950 text-slate-500' : 'bg-primary-950 text-primary-400'
                      }`}>
                        {msg.read ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100 text-sm">{msg.name}</span>
                          <span className="text-[10px] text-slate-500 hover:underline inline-flex items-center gap-1">
                            &lt;{msg.email}&gt;
                          </span>
                        </div>
                        <h3 className="text-slate-300 text-xs font-semibold mt-1">{msg.subject}</h3>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-slate-850 pt-3 sm:pt-0">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(msg.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>

                      {/* Control buttons */}
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleToggleReadStatus(msg, e)}
                          className={`p-1.5 rounded-lg border text-slate-450 hover:text-white transition-all ${
                            msg.read
                              ? 'border-slate-800 bg-slate-950/60 hover:bg-slate-850'
                              : 'border-slate-800 bg-slate-950 hover:bg-slate-850'
                          }`}
                          title={msg.read ? 'Mark Unread' : 'Mark Read'}
                        >
                          {msg.read ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={(e) => handleDeleteMessage(msg._id, e)}
                          className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-rose-900 hover:text-rose-400 transition-all"
                          title="Delete Message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="text-slate-500 pl-1.5 hidden sm:block">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body display dropdown */}
                  <div
                    className={`transition-all duration-300 ease-in-out bg-slate-950/50 border-t border-slate-850/60 overflow-hidden ${
                      isExpanded ? 'max-h-[500px] border-t' : 'max-h-0'
                    }`}
                  >
                    <div className="p-5 text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                      <div className="flex items-center gap-1.5 text-slate-500 uppercase text-[9px] tracking-wider font-bold mb-3 border-b border-slate-900 pb-2">
                        <User className="w-3 h-3" /> Inquiry body text
                      </div>
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-2 bg-slate-900 border border-slate-800 text-slate-450 hover:text-white rounded-lg disabled:opacity-40 disabled:hover:text-slate-450 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-xs text-slate-400 font-medium">
                  Page <span className="text-white">{page}</span> of <span className="text-slate-500">{pagination.pages}</span>
                </div>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.pages}
                  className="p-2 bg-slate-900 border border-slate-800 text-slate-450 hover:text-white rounded-lg disabled:opacity-40 disabled:hover:text-slate-450 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-slate-850 rounded-2xl bg-slate-900/10">
            <RefreshCw className="w-10 h-10 text-slate-700 mx-auto mb-4 animate-pulse-subtle" />
            <p className="text-slate-450 font-semibold">Your inbox is clear!</p>
            <p className="text-[10px] text-slate-550 mt-1 max-w-xs mx-auto">
              There are no messages matching this filter. New form submissions from contact routes will appear here instantly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
