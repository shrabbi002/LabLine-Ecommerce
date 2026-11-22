import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import ItemCard, { resolveImage } from '../components/ItemCard';
import ProductSlider from '../components/ProductSlider';
import { Aurora, Reveal, PageLoader } from '../components/motion';
import { Calendar, ArrowLeft, Mail, ChevronLeft, ChevronRight, AlertTriangle, Share2, Check, Expand, X } from 'lucide-react';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState({ x: 50, y: 50, active: false });

  useEffect(() => {
    const fetchItemDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/items/${id}`);
        if (res.data.success) {
          const fetchedItem = res.data.data;
          setItem(fetchedItem);
          setActiveImageIdx(0);
          try {
            const relRes = await api.get(`/items?category=${encodeURIComponent(fetchedItem.category)}&limit=9`);
            if (relRes.data.success) {
              setRelatedItems(relRes.data.data.filter((i) => i._id !== fetchedItem._id).slice(0, 8));
            }
          } catch (relErr) {
            console.error('Error loading related items:', relErr.message);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to retrieve item details.');
      } finally {
        setLoading(false);
      }
    };
    fetchItemDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const imageList = item?.images?.length ? item.images.map(resolveImage) : [resolveImage(null)];

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') setActiveImageIdx((p) => (p + 1) % imageList.length);
      if (e.key === 'ArrowLeft') setActiveImageIdx((p) => (p - 1 + imageList.length) % imageList.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, imageList.length]);

  if (loading) return <PageLoader label="Loading item details..." />;

  if (error || !item) {
    return (
      <div className="min-h-[70vh] py-20 flex items-center justify-center px-4">
        <div className="max-w-md w-full glass rounded-3xl p-8 text-center space-y-5 animate-scale-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white">Oops!</h2>
          <p className="text-slate-400 text-sm">{error || 'The item you are looking for does not exist or has been archived.'}</p>
          <button onClick={() => navigate('/items')} className="btn-ghost w-full py-3 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </button>
        </div>
      </div>
    );
  }

  const { title, shortDescription, description, category, price, tags, createdAt, status } = item;
  const next = () => setActiveImageIdx((p) => (p + 1) % imageList.length);
  const prev = () => setActiveImageIdx((p) => (p - 1 + imageList.length) % imageList.length);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* user dismissed the share sheet */
    }
  };

  const handleZoom = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100, active: true });
  };

  return (
    <div className="relative text-slate-100 py-8 sm:py-12">
      <Aurora className="opacity-40 h-[700px]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 animate-fade-in">
          <Link to="/items" className="inline-flex items-center gap-1.5 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Products
          </Link>
          <span>/</span>
          <span className="text-slate-400">{category}</span>
          <span className="hidden sm:inline">/</span>
          <span className="hidden sm:inline text-slate-300 truncate max-w-xs">{title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Gallery */}
          <div className="lg:col-span-7 space-y-4 animate-slide-up">
            <div
              className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden glass group cursor-zoom-in"
              onMouseMove={handleZoom}
              onMouseLeave={() => setZoom((z) => ({ ...z, active: false }))}
              onClick={() => setLightbox(true)}
            >
              {imageList.map((src, idx) => (
                <img
                  key={src + idx}
                  src={src}
                  alt={`${title} - view ${idx + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    idx === activeImageIdx ? 'opacity-100' : 'opacity-0 scale-105'
                  }`}
                  style={
                    idx === activeImageIdx
                      ? { transform: zoom.active ? 'scale(1.6)' : 'scale(1)', transformOrigin: `${zoom.x}% ${zoom.y}%` }
                      : undefined
                  }
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

              {status === 'draft' && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur">
                  Draft
                </span>
              )}
              <span className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Expand className="w-4 h-4" />
              </span>

              {imageList.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prev(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full glass text-white flex items-center justify-center sm:opacity-0 sm:-translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hover:scale-110"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); next(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full glass text-white flex items-center justify-center sm:opacity-0 sm:translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hover:scale-110"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {imageList.map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-500 ${idx === activeImageIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {imageList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {imageList.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIdx(index)}
                    className={`relative flex-shrink-0 w-20 sm:w-24 aspect-[4/3] rounded-xl overflow-hidden transition-all duration-300 ${
                      activeImageIdx === index
                        ? 'ring-2 ring-primary-400 ring-offset-2 ring-offset-[#05060f] scale-105'
                        : 'opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info panel */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 animate-slide-up" style={{ animationDelay: '120ms' }}>
            <div className="glass rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-primary-500/10 text-primary-200 border border-primary-500/25 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  {category}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">{title}</h1>
                <p className="text-slate-400 leading-relaxed">{shortDescription}</p>
              </div>

              {price !== null && price !== undefined && (
                <div className="flex items-end justify-between p-5 rounded-2xl bg-gradient-to-br from-primary-600/15 to-cyan-500/5 border border-primary-500/20">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Price</span>
                  <span className="font-display text-4xl font-bold text-gradient">${Number(price).toLocaleString()}</span>
                </div>
              )}

              {tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium text-slate-300 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-primary-400/40 hover:text-white transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <Link
                  to={`/contact?subject=${encodeURIComponent(`Inquiry about: ${title}`)}`}
                  className="btn-primary w-full py-4 text-sm"
                >
                  <Mail className="w-4 h-4" /> Contact about this item
                </Link>
                <button onClick={handleShare} className="btn-ghost w-full py-3.5 text-sm">
                  {copied ? (
                    <><Check className="w-4 h-4 text-emerald-400" /> Link copied!</>
                  ) : (
                    <><Share2 className="w-4 h-4" /> Share this item</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <Reveal className="glass rounded-3xl p-6 sm:p-10 space-y-5">
            <h2 className="font-display text-2xl font-bold text-white">About this item</h2>
            <div className="h-px bg-gradient-to-r from-primary-500/50 via-white/10 to-transparent" />
            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">{description}</div>
          </Reveal>
        )}

        {/* Related */}
        {relatedItems.length > 0 && (
          <section className="space-y-8 pb-8">
            <Reveal className="flex items-end justify-between">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                You may also <span className="text-gradient">like</span>
              </h2>
              <Link to="/items" className="text-sm text-slate-400 hover:text-white transition-colors">View all →</Link>
            </Reveal>
            {relatedItems.length >= 3 ? (
              <Reveal className="overflow-x-clip -mx-4 px-4">
                <ProductSlider items={relatedItems} interval={6000} />
              </Reveal>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {relatedItems.map((relItem, i) => (
                  <Reveal key={relItem._id} delay={i * 120}>
                    <ItemCard item={relItem} />
                  </Reveal>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightbox(false)}
        >
          <button className="absolute top-5 right-5 w-11 h-11 rounded-full glass text-white flex items-center justify-center" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
          <img
            key={activeImageIdx}
            src={imageList[activeImageIdx]}
            alt={title}
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
          {imageList.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 w-12 h-12 rounded-full glass text-white flex items-center justify-center" aria-label="Previous">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 w-12 h-12 rounded-full glass text-white flex items-center justify-center" aria-label="Next">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemDetail;
