import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { ASSET_BASE_URL } from '../api';
import ItemCard from '../components/ItemCard';
import { Tag, Calendar, ArrowLeft, Mail, ChevronLeft, ChevronRight, AlertTriangle, Share2, ExternalLink } from 'lucide-react';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

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
            const relRes = await api.get(`/items?category=${fetchedItem.category}&limit=4`);
            if (relRes.data.success) {
              const filtered = relRes.data.data.filter((i) => i._id !== fetchedItem._id).slice(0, 3);
              setRelatedItems(filtered);
            }
          } catch (relErr) {
            console.error('Error loading related items:', relErr.message);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to retrieve item details.');
        console.error('Error fetching item details:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItemDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium tracking-wide text-sm">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="bg-slate-950 min-h-screen py-12 sm:py-20 text-slate-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800/60 rounded-2xl p-6 sm:p-8 text-center space-y-5 animate-scale-in">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">Oops!</h2>
          <p className="text-slate-400 text-sm">{error || 'The item you are looking for does not exist or has been archived.'}</p>
          <button
            onClick={() => navigate('/items')}
            className="w-full py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:text-white rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </button>
        </div>
      </div>
    );
  }

  const { title, shortDescription, description, category, price, images, tags, createdAt, status } = item;

  const imageList = images && images.length > 0
    ? images.map((img) => (img.startsWith('http') ? img : `${ASSET_BASE_URL}${img}`))
    : ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'];

  const handleNextImage = () => setActiveImageIdx((prev) => (prev + 1) % imageList.length);
  const handlePrevImage = () => setActiveImageIdx((prev) => (prev - 1 + imageList.length) % imageList.length);

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Back Link */}
        <div>
          <Link
            to="/items"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Products
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Image Viewer */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/60 shadow-2xl flex items-center justify-center group">
              <img
                src={imageList[activeImageIdx]}
                alt={`${title} - view ${activeImageIdx + 1}`}
                className="object-contain max-h-[300px] sm:max-h-[400px] md:max-h-[500px] w-full h-full transition-opacity duration-300"
              />

              {status === 'draft' && (
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                  <span className="px-3 py-1 rounded-lg bg-amber-950 border border-amber-800 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    Draft
                  </span>
                </div>
              )}

              {imageList.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 sm:left-4 p-2 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white backdrop-blur-sm border border-slate-800/60 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300"
                  >
                    <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 sm:right-4 p-2 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white backdrop-blur-sm border border-slate-800/60 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300"
                  >
                    <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {imageList.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {imageList.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIdx(index)}
                    className={`relative flex-shrink-0 w-16 sm:w-24 aspect-video rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      activeImageIdx === index
                        ? 'border-primary-500 ring-2 ring-primary-500/20'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Specs Panel */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <div className="bg-slate-900 border border-slate-800/60 p-5 sm:p-6 rounded-2xl shadow-xl space-y-4 sm:space-y-5">
              {/* Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/40 pb-4">
                <span className="px-3 py-1 rounded-full bg-primary-950/40 text-primary-400 border border-primary-900/30 text-xs font-semibold uppercase tracking-wider">
                  {category}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight">{title}</h1>
                <p className="text-slate-400 text-sm leading-relaxed">{shortDescription}</p>
              </div>

              {/* Price */}
              {price !== null && price !== undefined && (
                <div className="py-2.5 px-4 bg-slate-950/80 border border-slate-800/40 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Price / Value</span>
                  <span className="text-xl font-bold text-white">${price.toLocaleString()}</span>
                </div>
              )}

              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 bg-slate-950/80 px-3 py-1 rounded-lg border border-slate-800/40"
                      >
                        <Tag className="w-3 h-3 text-primary-500" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="pt-4 border-t border-slate-800/40 space-y-3">
                <Link
                  to={`/contact?subject=Inquiry about: ${encodeURIComponent(title)}`}
                  className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition-all duration-300 shadow-lg shadow-primary-600/10 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                  <Mail className="w-4 h-4" /> Contact about this item
                </Link>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                  className="w-full py-3 border border-slate-800/60 text-slate-400 hover:text-white hover:border-slate-700 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> Share this item
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Full Description */}
        <div className="bg-slate-900 border border-slate-800/60 p-5 sm:p-8 rounded-2xl shadow-xl space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-white border-b border-slate-800/40 pb-3">Complete Profile</h2>
          <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap space-y-4">
            {description}
          </div>
        </div>

        {/* Related Items */}
        {relatedItems.length > 0 && (
          <div className="space-y-5 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-bold text-white border-b border-slate-900/80 pb-3">Similar Items</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8 stagger-children">
              {relatedItems.map((relItem) => (
                <ItemCard key={relItem._id} item={relItem} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetail;
