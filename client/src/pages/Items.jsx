import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { ASSET_BASE_URL } from '../api';
import { Search, SlidersHorizontal, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, RefreshCw, AlertCircle } from 'lucide-react';

const Items = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);

  // Filter, sort & search states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [pagination, setPagination] = useState({
    total: 0, page: 1, limit: 9, pages: 1,
  });

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

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const qp = new URLSearchParams({ page, limit, sort });
      if (search.trim()) qp.append('search', search.trim());
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

  const handleSearchSubmit = (e) => { e.preventDefault(); setPage(1); fetchItems(); };

  const handleClearFilters = () => { setSearch(''); setCategory(''); setSort('-createdAt'); setPage(1); };

  const activeFiltersCount = [search, category, sort !== '-createdAt' ? sort : ''].filter(Boolean).length;

  /* ── Inline Product Card (flat, matching BD reference) ── */
  const ProductCard = ({ item }) => {
    const imageUrl = item.images && item.images.length > 0
      ? (item.images[0].startsWith('http') ? item.images[0] : `${ASSET_BASE_URL}${item.images[0]}`)
      : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';

    return (
      <Link to={`/items/${item._id}`} className="group block">
        {/* Image */}
        <div className="aspect-[4/3] w-full bg-white border border-gray-200 rounded overflow-hidden mb-3 flex items-center justify-center">
          <img
            src={imageUrl}
            alt={item.title}
            className="object-contain w-full h-full p-2 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        {/* Title */}
        <h3 className="text-[15px] font-bold text-slate-900 leading-snug mb-1 group-hover:text-[#0058a3] transition-colors duration-200 line-clamp-2">
          {item.title}
        </h3>
        {/* Description */}
        <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">
          {item.shortDescription}
        </p>
        {/* Price if available */}
        {item.price !== null && item.price !== undefined && (
          <p className="text-sm font-bold text-slate-800 mt-1.5">${item.price.toLocaleString()}</p>
        )}
      </Link>
    );
  };

  /* ── Filter Sidebar Content ── */
  const FilterSidebar = ({ mobile = false }) => (
    <div>
      {/* Filters heading */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-[#0058a3]" />
          <span className="text-[15px] font-semibold text-[#0058a3]">Filters</span>
        </div>
        {mobile && (
          <button onClick={() => setShowMobileFilters(false)} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Categories Section */}
      <div className="pt-5">
        <button
          onClick={() => setCategoriesExpanded(!categoriesExpanded)}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <span className="text-[13px] font-bold text-slate-800 uppercase tracking-wide">Categories</span>
          {categoriesExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {categoriesExpanded && (
          <div className="space-y-1">
            {categories.length > 0 ? (
              categories.map((cat, idx) => (
                <label key={idx} className="flex items-center gap-2.5 py-[6px] cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={category === cat.name}
                    onChange={() => {
                      setCategory(category === cat.name ? '' : cat.name);
                      setPage(1);
                      if (mobile) setShowMobileFilters(false);
                    }}
                    className="w-[15px] h-[15px] rounded-sm border-gray-300 text-[#0058a3] focus:ring-[#0058a3] cursor-pointer"
                  />
                  <span className="text-[13px] text-gray-700 group-hover:text-gray-900 transition-colors flex-1">
                    {cat.name}
                  </span>
                  <span className="text-[11px] font-semibold text-[#0058a3] bg-blue-50 px-1.5 py-0.5 rounded min-w-[24px] text-center">
                    {cat.count}
                  </span>
                </label>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-2">No categories found</p>
            )}
            {categories.length > 5 && (
              <button className="text-[12px] text-[#0058a3] hover:underline mt-2 flex items-center gap-1">
                Scroll for more <ChevronDown className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sort Section */}
      <div className="pt-5 mt-4 border-t border-gray-200">
        <h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-wide mb-3">Sort By</h4>
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="w-full py-2 px-3 border border-gray-300 rounded text-[13px] text-gray-700 bg-white focus:outline-none focus:border-[#0058a3] focus:ring-1 focus:ring-[#0058a3] cursor-pointer"
        >
          <option value="-createdAt">Newest First</option>
          <option value="createdAt">Oldest First</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
        </select>
      </div>

      {/* Clear Filters */}
      {(search || category || sort !== '-createdAt') && (
        <button
          onClick={() => { handleClearFilters(); if (mobile) setShowMobileFilters(false); }}
          className="w-full mt-5 py-2 text-[12px] text-red-500 hover:text-white border border-red-200 hover:bg-red-500 hover:border-red-500 font-semibold rounded transition-all duration-200 flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="w-3 h-3" /> Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-white min-h-screen text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ═══ Hero Banner ═══ */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: 160 }}>
        {/* Navy background */}
        <div className="absolute inset-0 bg-[#0c1a40]" />
        {/* Orange triangle on right */}
        <div
          className="absolute top-0 right-0 h-full bg-[#ff6f00]"
          style={{
            width: '30%',
            clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0 100%)',
          }}
        />
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
          <h1 className="text-white text-xl sm:text-2xl font-semibold mb-4 sm:mb-5">Product Search</h1>
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-lg mx-auto sm:mx-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by SKU or Text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0058a3] shadow-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setPage(1); setTimeout(fetchItems, 50); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* ═══ Page Content ═══ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-5">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#0058a3]" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#0058a3] text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Filter Drawer (bottom sheet) */}
        <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${showMobileFilters ? 'visible' : 'invisible'}`}>
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${showMobileFilters ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setShowMobileFilters(false)}
          />
          <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto shadow-2xl transition-transform duration-300 ${showMobileFilters ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <FilterSidebar mobile={true} />
          </div>
        </div>

        {/* Desktop: Sidebar + Grid */}
        <div className="flex gap-8 lg:gap-10">
          {/* Left Sidebar */}
          <aside className="hidden lg:block w-[240px] xl:w-[260px] flex-shrink-0">
            <div className="sticky top-20">
              <FilterSidebar />
            </div>
          </aside>

          {/* Right: Product Listing */}
          <div className="flex-1 min-w-0">
            {/* "Featured Products" heading */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                Featured Products
              </h2>
              <div className="h-px bg-gray-200 mt-4" />
            </div>

            {/* Content */}
            {error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <AlertCircle className="w-10 h-10 text-red-400" />
                <p className="text-red-600 font-semibold">{error}</p>
                <button onClick={fetchItems} className="px-5 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition-colors">
                  Retry
                </button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="animate-pulse">
                    <div className="aspect-[4/3] bg-gray-100 rounded mb-3" />
                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-full mb-1" />
                    <div className="h-3 bg-gray-100 rounded w-5/6" />
                  </div>
                ))}
              </div>
            ) : items.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                  {items.map((item) => (
                    <ProductCard key={item._id} item={item} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-10 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="p-2 rounded border border-gray-300 text-gray-500 hover:text-gray-800 hover:border-gray-400 disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-500">
                      Page <span className="font-semibold text-gray-800">{page}</span> of {pagination.pages}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.pages}
                      className="p-2 rounded border border-gray-300 text-gray-500 hover:text-gray-800 hover:border-gray-400 disabled:opacity-30 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <RefreshCw className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-semibold">No products match your search.</p>
                <p className="text-sm text-gray-400 mt-1">Try clearing your filters or searching for something else.</p>
                <button onClick={handleClearFilters} className="mt-4 px-5 py-2 bg-[#0058a3] text-white text-sm font-medium rounded hover:bg-[#004a8c] transition-colors">
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Items;
