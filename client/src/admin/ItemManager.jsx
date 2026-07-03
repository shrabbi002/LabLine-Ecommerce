import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { ASSET_BASE_URL } from '../api';
import {
  FolderOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  FileX2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

const ItemManager = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Table search & filter params
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  // Delete Prompt Modal states
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        sort: '-createdAt', // newest listings first
      });

      if (search.trim()) queryParams.append('search', search.trim());
      if (status) queryParams.append('status', status);

      const res = await api.get(`/items?${queryParams.toString()}`);
      if (res.data.success) {
        setItems(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setErrorMsg('Failed to download product catalog listings.');
      console.error('Catalog fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [page, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCatalog();
  };

  // Switch active vs draft state instantly on listing click
  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'active' ? 'draft' : 'active';
    try {
      const res = await api.put(`/items/${item._id}`, { status: nextStatus });
      if (res.data.success) {
        setItems((prev) =>
          prev.map((i) => (i._id === item._id ? { ...i, status: nextStatus } : i))
        );
      }
    } catch (err) {
      console.error('Failed to toggle status:', err.message);
    }
  };

  // Delete confirmation handler
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/items/${deleteTarget._id}`);
      if (res.data.success) {
        setItems((prev) => prev.filter((i) => i._id !== deleteTarget._id));
        setDeleteTarget(null);
      }
    } catch (err) {
      console.error('Deletion failure:', err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-5 gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <FolderOpen className="w-6 h-6 text-primary-500" /> Item Management
            </h1>
            <p className="text-slate-400 text-xs">Create catalog postings, toggle display settings, and upload details.</p>
          </div>
          <Link
            to="/admin/items/new"
            className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-all duration-300 shadow-md shadow-primary-500/10 transform hover:-translate-y-0.5 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" /> Add Product Item
          </Link>
        </div>

        {/* Searching & Filter inputs */}
        <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl shadow-lg">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Input field */}
            <div className="md:col-span-7 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search catalog listings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder-slate-600 transition-all duration-300"
              />
            </div>

            {/* Status filtering dropdown */}
            <div className="md:col-span-3">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-350 text-xs focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-300"
              >
                <option value="">All Statuses</option>
                <option value="active">Active only</option>
                <option value="draft">Drafts only</option>
              </select>
            </div>

            {/* Submit Action */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:text-white text-slate-300 font-semibold rounded-xl text-xs transition-colors duration-300"
              >
                Filter Catalog
              </button>
            </div>
          </form>
        </div>

        {/* Table content layout */}
        {errorMsg ? (
          <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-400 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        ) : loading ? (
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-8 text-center space-y-4 animate-pulse">
            <div className="h-6 bg-slate-800 rounded w-1/4 mx-auto"></div>
            <div className="h-32 bg-slate-800 rounded w-full"></div>
          </div>
        ) : items.length > 0 ? (
          <div className="bg-slate-900 border border-slate-850/80 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-500 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-850">
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Featured</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-950/40 transition-colors">
                      {/* Title & thumb */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-7 bg-slate-950 rounded border border-slate-800 overflow-hidden flex-shrink-0">
                            {item.images && item.images.length > 0 ? (
                              <img src={item.images[0].startsWith('http') ? item.images[0] : `${ASSET_BASE_URL}${item.images[0]}`} alt="" className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full bg-slate-900 flex items-center justify-center text-[10px] text-slate-650 font-bold">No img</div>
                            )}
                          </div>
                          <span className="font-bold text-slate-200 line-clamp-1">{item.title}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400">
                          {item.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 font-semibold">
                        {item.price !== null && item.price !== undefined ? `$${item.price.toLocaleString()}` : '-'}
                      </td>

                      {/* Status toggle */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                            item.status === 'active'
                              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-450 hover:bg-emerald-900/40'
                              : 'bg-amber-950/60 border-amber-800 text-amber-450 hover:bg-amber-900/40'
                          }`}
                        >
                          {item.status === 'active' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </>
                          ) : (
                            <>
                              <FileX2 className="w-3 h-3" /> Draft
                            </>
                          )}
                        </button>
                      </td>

                      {/* Featured */}
                      <td className="px-6 py-4">
                        {item.featured ? (
                          <span className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                            <Sparkles className="w-3.5 h-3.5 fill-amber-500" /> Yes
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/items/${item._id}`}
                            target="_blank"
                            className="p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
                            title="Preview Public Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            to={`/admin/items/${item._id}/edit`}
                            className="p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-750 text-slate-300 hover:text-primary-400 rounded-lg transition-all"
                            title="Edit Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 bg-slate-950 border border-slate-800 hover:border-rose-900 text-slate-450 hover:text-rose-400 rounded-lg transition-all"
                            title="Delete Listing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table pagination row */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-850 px-6 py-4 bg-slate-950/60">
                <div className="text-xs text-slate-500 font-medium">
                  Showing <span className="text-slate-350">{items.length}</span> items of <span className="text-slate-350">{pagination.total}</span> total
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                    className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <FolderOpen className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold">No product items listed.</p>
            <p className="text-xs text-slate-500 mt-1">
              Get started by clicking the "Add Product Item" button in the top right to populate your catalog.
            </p>
          </div>
        )}

        {/* Delete confirmation modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-6 space-y-5 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Delete Product Listing</h3>
              </div>
              
              <p className="text-slate-450 text-xs leading-relaxed">
                Are you sure you want to delete <span className="text-white font-bold">"{deleteTarget.title}"</span>? This will permanently erase the database entry and delete all image files associated with it from the server's uploads folder. This action is irreversible.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-750 text-slate-350 text-xs font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="px-4 py-2 bg-rose-650 hover:bg-rose-550 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-40"
                >
                  {deleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemManager;
