import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, ArrowRight } from 'lucide-react';
import { ASSET_BASE_URL } from '../api';

const ItemCard = ({ item, lightTheme = false }) => {
  const { _id, title, shortDescription, category, price, images, tags } = item;

  // Use fallback image if none are uploaded
  const imageUrl = images && images.length > 0
    ? (images[0].startsWith('http') ? images[0] : `${ASSET_BASE_URL}${images[0]}`)
    : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';

  return (
    <div className={`group rounded-2xl overflow-hidden transition-all duration-500 flex flex-col h-full animate-slide-up ${
      lightTheme
        ? 'bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1'
        : 'bg-slate-900/80 border border-slate-800/60 hover:border-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/5 hover:-translate-y-1'
    }`}>
      {/* Thumbnail */}
      <div className={`relative aspect-[16/10] w-full overflow-hidden ${lightTheme ? 'bg-slate-100' : 'bg-slate-950'}`}>
        <img
          src={imageUrl}
          alt={title}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out will-change-transform"
          loading="lazy"
        />
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
          lightTheme
            ? 'bg-gradient-to-t from-white/20 to-transparent'
            : 'bg-gradient-to-t from-slate-950/40 to-transparent'
        }`} />
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full backdrop-blur-md border ${
            lightTheme
              ? 'bg-white/80 text-primary-600 border-slate-200/50 shadow-sm'
              : 'bg-slate-950/80 text-primary-400 border-slate-700/60'
          }`}>
            {category}
          </span>
        </div>
        {/* Price Tag */}
        {price !== null && price !== undefined && (
          <div className="absolute bottom-3 right-3">
            <span className="px-3 py-1.5 text-sm font-bold rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 backdrop-blur-md text-white shadow-lg shadow-primary-500/20">
              ${price.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <h3 className={`text-base sm:text-lg font-bold group-hover:text-primary-500 transition-colors duration-300 line-clamp-1 mb-1.5 ${
          lightTheme ? 'text-slate-800' : 'text-white'
        }`}>
          {title}
        </h3>
        <p className={`text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 mb-4 flex-grow leading-relaxed ${
          lightTheme ? 'text-slate-500' : 'text-slate-400'
        }`}>
          {shortDescription}
        </p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                  lightTheme
                    ? 'text-slate-500 bg-slate-50 border-slate-200/80'
                    : 'text-slate-400 bg-slate-950/80 border-slate-800/60'
                }`}
              >
                <Tag className="w-2.5 h-2.5 text-primary-500" />
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-[10px] text-slate-500 self-center">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* View Details Link */}
        <div className={`border-t pt-3 sm:pt-4 mt-auto ${lightTheme ? 'border-slate-100' : 'border-slate-800/60'}`}>
          <Link
            to={`/items/${_id}`}
            className={`flex items-center justify-between text-sm font-semibold transition-colors duration-300 ${
              lightTheme ? 'text-primary-600 hover:text-primary-700' : 'text-primary-400 hover:text-primary-300'
            }`}
          >
            <span>Explore Details</span>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border ${
              lightTheme
                ? 'bg-slate-50 text-primary-600 border-slate-200 group-hover:bg-gradient-to-r group-hover:from-primary-600 group-hover:to-indigo-600 group-hover:text-white group-hover:border-primary-600 group-hover:shadow-lg group-hover:shadow-primary-500/20'
                : 'bg-slate-950 text-primary-400 border-slate-800 group-hover:translate-x-1 group-hover:bg-gradient-to-r group-hover:from-primary-600 group-hover:to-indigo-600 group-hover:text-white group-hover:shadow-lg'
            }`}>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
