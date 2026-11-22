import React, { useState, useEffect } from 'react';
import api from '../api';
import ItemCard, { ItemCardSkeleton } from '../components/ItemCard';
import { Aurora, Reveal } from '../components/motion';
import { Search, ChevronLeft, ChevronRight, X, RefreshCw, AlertCircle, ArrowUpDown, LayoutGrid, Package } from 'lucide-react';

const sortOptions = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'createdAt', label: 'Oldest' },
  { value: 'priceAsc', label: 'Price ↑' },
  { value: 'priceDesc', label: 'Price ↓' },
];

const Items = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 9, pages: 1 });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/items/categories');
        if (res.data.success) setCategories(res.data.data);
      } catch (err) {
        console.error('Error fetching categories:', err.message);
      }
    };
    fetchCategories();
  }, []);

  const fetchItems = async (searchTerm = search) => {
    setLoading(true);
    setError(null);
    try {
      const qp = new URLSearchParams({ page, limit, sort });
      if (searchTerm.trim()) qp.append('search', searchTerm.trim());
      if (category) qp.append('category', category);
      const res = await api.get(`/items?${qp.toString()}`);
      if (res.data.success) {
        setItems(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError('Unable to retrieve listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [category, sort, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  const clearSearch = () => {
    setSearch('');
    setPage(1);
    fetchItems('');
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setSort('-createdAt');
    setPage(1);
    if (!category && sort === '-createdAt') fetchItems('');
  };

  const selectCategory = (name) => {
    setCategory(name);
    setPage(1);
  };

  const hasFilters = search || category || sort !== '-createdAt';
  const totalCount = categories.reduce((sum, c) => sum + (c.count || 0), 0);

  return (
    <div className="-mt-20 min-h-screen text-slate-100">
      {/* ─── Hero / Search ─── */}
      <section className="relative pt-36 pb-16 sm:pt-40 sm:pb-20 overflow-hidden noise">
        <Aurora />
        <div className="absolute inset-0 bg-grid pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-slate-300 animate-slide-up">
            <LayoutGrid className="w-3.5 h-3.5 text-primary-300" /> Full catalogue
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white animate-slide-up" style={{ animationDelay: '80ms' }}>
            Discover <span className="text-gradient">products</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto animate-slide-up" style={{ animationDelay: '160ms' }}>
            Browse everything we offer. Search by name, SKU or keyword, and filter by category.
          </p>

          <form
            onSubmit={handleSearchSubmit}
            className="relative max-w-xl mx-auto animate-slide-up group"
            style={{ animationDelay: '240ms' }}
          >
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary-600 via-cyan-500 to-fuchsia-500 opacity-30 blur-md group-focus-within:opacity-80 transition-opacity duration-500" />
            <div className="relative flex items-center glass bg-[#0b0d1a]/80 rounded-2xl p-1.5">
              <Search className="w-5 h-5 text-slate-500 ml-3.5 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by SKU or text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-0 bg-transparent px-3 py-3 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
              />
              {search && (
                <button type="button" onClick={clearSearch} className="p-2 text-slate-500 hover:text-white transition-colors" aria-label="Clear search">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button type="submit" className="btn-primary px-5 py-3 text-sm">
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ─── Toolbar ─── */}
      <div className="sticky top-[76px] z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass bg-[#0b0d1a]/70 rounded-2xl p-2 flex flex-col md:flex-row md:items-center gap-2 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)]">
          <div className="flex gap-1.5 overflow-x-auto flex-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <CategoryChip active={!category} onClick={() => selectCategory('')} label="All" count={totalCount || null} />
            {categories.map((cat) => (
              <CategoryChip
                key={cat.name}
                active={category === cat.name}
                onClick={() => selectCategory(category === cat.name ? '' : cat.name)}
                label={cat.name}
                count={cat.count}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 md:border-l md:border-white/10 md:pl-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] flex-1 md:flex-none">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 mx-1.5 flex-shrink-0" />
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSort(opt.value); setPage(1); }}
                  className={`flex-1 md:flex-none px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                    sort === opt.value ? 'bg-white text-slate-900 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {hasFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/10 transition-colors animate-scale-in"
                title="Clear filters"
              >
                <RefreshCw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Results ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24">
        {!loading && !error && (
          <div className="flex items-center justify-between mb-6 text-sm animate-fade-in">
            <p className="text-slate-400">
              Showing <span className="text-white font-semibold">{items.length}</span> of{' '}
              <span className="text-white font-semibold">{pagination.total}</span> results
              {category && <> in <span className="text-primary-300 font-semibold">{category}</span></>}
            </p>
          </div>
        )}

        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-rose-400" />
            </div>
            <p className="text-rose-300 font-semibold">{error}</p>
            <button onClick={() => fetchItems()} className="btn-ghost px-5 py-2.5 text-sm">Retry</button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => <ItemCardSkeleton key={n} />)}
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {items.map((item, i) => (
                <Reveal key={item._id} delay={(i % 3) * 100}>
                  <ItemCard item={item} />
                </Reveal>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-16">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="w-11 h-11 rounded-xl glass flex items-center justify-center text-slate-300 hover:text-white hover:border-primary-500/40 disabled:opacity-30 disabled:pointer-events-none transition-all"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === pagination.pages || Math.abs(n - page) <= 1)
                  .map((n, idx, arr) => (
                    <React.Fragment key={n}>
                      {idx > 0 && n - arr[idx - 1] > 1 && <span className="text-slate-600 px-1">…</span>}
                      <button
                        onClick={() => setPage(n)}
                        className={`w-11 h-11 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          n === page
                            ? 'bg-gradient-to-tr from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-600/40 scale-110'
                            : 'glass text-slate-400 hover:text-white'
                        }`}
                      >
                        {n}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.pages}
                  className="w-11 h-11 rounded-xl glass flex items-center justify-center text-slate-300 hover:text-white hover:border-primary-500/40 disabled:opacity-30 disabled:pointer-events-none transition-all"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] animate-scale-in">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-4 animate-float" />
            <p className="text-slate-200 font-semibold">No products match your search.</p>
            <p className="text-sm text-slate-500 mt-1">Try clearing your filters or searching for something else.</p>
            <button onClick={handleClearFilters} className="btn-primary mt-6 px-5 py-2.5 text-sm">
              Reset filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

const CategoryChip = ({ active, onClick, label, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
      active
        ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-600/30'
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {label}
    {count !== null && count !== undefined && (
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${active ? 'bg-white/20' : 'bg-white/5 text-slate-500'}`}>
        {count}
      </span>
    )}
  </button>
);

export default Items;
